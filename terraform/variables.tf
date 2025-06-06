variable "project_id" {
  description = "The project ID to host the cluster in"
  type        = string
  # 環境変数 TF_VAR_project_id から読み込む
  # 環境変数が設定されていない場合はエラーを表示
  validation {
    condition     = var.project_id != ""
    error_message = "The project_id value is required. Please set TF_VAR_project_id environment variable."
  }
}

variable "region" {
  description = "The region to host the cluster in"
  type        = string
  default     = "asia-northeast1"
}

variable "cluster_name" {
  description = "The name of the cluster"
  type        = string
  default     = "my-gke-cluster"
}

variable "pods_ipv4_cidr" {
  description = "The IP address range for pods in this cluster"
  type        = string
  default     = "10.1.0.0/16"
}

variable "services_ipv4_cidr" {
  description = "The IP address range for services in this cluster"
  type        = string
  default     = "10.2.0.0/16"
}

variable "master_ipv4_cidr" {
  description = "The IP range in CIDR notation to use for the hosted master network"
  type        = string
  default     = "172.16.0.0/28"
}

variable "subnet_ip_cidr" {
  description = "The IP address range for the subnet"
  type        = string
  default     = "10.0.0.0/24"
}

variable "sql_user_password" {
  description = "Password for the Cloud SQL user."
  type        = string
  sensitive   = true
  validation {
    condition     = var.sql_user_password != ""
    error_message = "The sql_user_password value is required."
  }
}

variable "artifact_repo_id" {
  description = "ID for the Artifact Registry repository."
  type        = string
  default     = "gke-app-repository"
  validation {
    condition     = var.artifact_repo_id != ""
    error_message = "The artifact_repo_id value is required."
  }
}

variable "lb_domain_name" {
  description = "The domain name for the Load Balancer's SSL certificate (e.g., app.yourdomain.com)."
  type        = string
  validation {
    condition     = var.lb_domain_name != ""
    error_message = "The lb_domain_name value is required."
  }
}

variable "gke_service_port_for_lb" {
  description = "The port number of the GKE service the load balancer will target for health checks and traffic."
  type        = number
  default     = 80
}