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

resource "google_compute_managed_ssl_certificate" "gke_lb_ssl_cert" {
  name = "gke-lb-ssl-cert"
  managed {
    domains = [var.lb_domain_name]
  }
}

resource "google_compute_health_check" "gke_http_health_check" {
  name = "gke-http-health-check"
  http_health_check {
    port         = var.gke_service_port_for_lb
    request_path = "/"
  }
}

resource "google_compute_backend_service" "gke_backend_service" {
  name                  = "gke-backend-service"
  protocol              = "HTTP"
  port_name             = "http"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  health_checks         = [google_compute_health_check.gke_http_health_check.self_link]
  # NEG configuration will be referenced here once GKE services are annotated.
  # For now, this backend service won't have any backends.
}

resource "google_compute_url_map" "gke_url_map" {
  name            = "gke-url-map"
  default_service = google_compute_backend_service.gke_backend_service.self_link
}

resource "google_compute_target_https_proxy" "gke_https_proxy" {
  name             = "gke-https-proxy"
  url_map          = google_compute_url_map.gke_url_map.self_link
  ssl_certificates = [google_compute_managed_ssl_certificate.gke_lb_ssl_cert.self_link]
}

resource "google_compute_global_forwarding_rule" "gke_forwarding_rule" {
  name                  = "gke-forwarding-rule"
  ip_address            = google_compute_global_address.gke_lb_ip.self_link
  target                = google_compute_target_https_proxy.gke_https_proxy.self_link
  port_range            = "443"
  load_balancing_scheme = "EXTERNAL_MANAGED"
}