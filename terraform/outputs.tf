output "kubernetes_cluster_name" {
  value       = google_container_cluster.primary.name
  description = "GKE Cluster Name"
}

output "kubernetes_cluster_host" {
  value       = google_container_cluster.primary.endpoint
  description = "GKE Cluster Host"
}

output "kubernetes_cluster_ca_certificate" {
  value       = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
  description = "GKE Cluster CA Certificate"
  sensitive   = true
}

output "sql_instance_connection_name" {
  value       = google_sql_database_instance.sql_instance.connection_name
  description = "Cloud SQL instance connection name."
}

output "sql_database_name" {
  value       = google_sql_database.sql_database.name
  description = "Cloud SQL database name."
}

output "artifact_registry_repository_url" {
  value       = google_artifact_registry_repository.app_repo.repository_id
  description = "Artifact Registry repository URL."
}

output "load_balancer_ip" {
  value       = google_compute_global_address.gke_lb_ip.address
  description = "External IP address of the Global Load Balancer."
}