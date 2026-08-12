# ShiVi X100+ Platform Outputs

output "gke_cluster_endpoint" {
  description = "GKE cluster endpoint"
  value       = module.gke.cluster_endpoint
  sensitive   = true
}

output "database_connection_string" {
  description = "Cloud SQL connection string"
  value       = module.database.connection_string
  sensitive   = true
}

output "redis_host" {
  description = "Redis instance host"
  value       = module.redis.host
}

output "vpc_network_id" {
  description = "VPC network ID"
  value       = module.networking.network_id
}
