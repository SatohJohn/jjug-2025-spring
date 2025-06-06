terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  # Autopilotモードを有効化
  enable_autopilot = true

  # クラスターの削除を許可
  deletion_protection = false

  # Autopilotでは、以下の設定は不要になります
  # - remove_default_node_pool
  # - initial_node_count
  # - node_config
  # - node_pool

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  ip_allocation_policy {
    cluster_ipv4_cidr_block  = var.pods_ipv4_cidr
    services_ipv4_cidr_block = var.services_ipv4_cidr
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = var.master_ipv4_cidr
  }

  # Autopilotでは、リリースチャンネルを指定することを推奨
  release_channel {
    channel = "REGULAR"
  }

  # ロードバランサーからの通信を許可
  master_authorized_networks_config {
    # 必要に応じて以下のようなCIDRブロックを追加
    cidr_blocks {
      cidr_block   = "0.0.0.0/0"  # 本番環境では適切なCIDRに制限することを推奨
      display_name = "Allow all"
    }
  }
}

resource "google_compute_network" "vpc" {
  name                    = "${var.cluster_name}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "${var.cluster_name}-subnet"
  ip_cidr_range = var.subnet_ip_cidr
  region        = var.region
  network       = google_compute_network.vpc.name
}

resource "google_sql_database_instance" "sql_instance" {
  name             = "gke-sql-instance"
  database_version = "POSTGRES_17"
  region           = var.region
  depends_on       = [google_service_networking_connection.private_vpc_connection]
  settings {
    tier              = "db-f1-micro"
    availability_type = "REGIONAL"
    disk_type         = "PD_SSD"
    disk_size         = 10
    ip_configuration {
      private_network = google_compute_network.vpc.self_link
      ipv4_enabled    = false
    }
  }
}

resource "google_sql_database" "sql_database" {
  name     = "gke-app-db"
  instance = google_sql_database_instance.sql_instance.name
}

resource "google_sql_user" "sql_user" {
  name     = "gke_app_user"
  instance = google_sql_database_instance.sql_instance.name
  password = var.sql_user_password
}

resource "google_artifact_registry_repository" "app_repo" {
  location      = var.region
  repository_id = var.artifact_repo_id
  format        = "DOCKER"
  description   = "Docker repository for GKE applications"
}

resource "google_compute_global_address" "gke_lb_ip" {
  name = "gke-lb-ip"
}

resource "google_dns_managed_zone" "main" {
  name        = "sample-zone"
  dns_name    = var.dns_zone_name
  description = "Sample DNS zone for JJUGCCC 2025"
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

resource "google_compute_firewall" "allow_lb_to_gke" {
  name    = "allow-lb-to-gke"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = [var.gke_service_port_for_lb]
  }

  source_ranges = ["130.211.0.0/22", "35.191.0.0/16"]  # Google Cloud Load BalancerのIP範囲
  target_tags = ["gke-${var.cluster_name}"]
}

# ヘルスチェック用のファイアウォールルール
resource "google_compute_firewall" "allow_health_check" {
  name    = "allow-health-check"
  network = google_compute_network.vpc.name

  allow {
    protocol = "tcp"
    ports    = [var.gke_service_port_for_lb]
  }

  source_ranges = ["130.211.0.0/22", "35.191.0.0/16", "209.85.152.0/22", "209.85.204.0/22"]  # Google Cloud Health Check
  target_tags = ["gke-${var.cluster_name}"]
}

# ノードプールの設定は削除（Autopilotモードでは不要）