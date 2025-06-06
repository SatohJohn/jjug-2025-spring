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
  default     = "10.0.0.0/14"
}

variable "services_ipv4_cidr" {
  description = "The IP address range for services in this cluster"
  type        = string
  default     = "10.4.0.0/19"
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