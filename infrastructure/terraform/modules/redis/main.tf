# ShiVi Memorystore Redis Module

variable "project_id" { type = string }
variable "region" { type = string }
variable "network_id" { type = string }
variable "environment" { type = string }
variable "memory_size_gb" { type = number }

resource "google_redis_instance" "shivi" {
  name           = "shivi-cache-${var.environment}"
  tier           = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  memory_size_gb = var.memory_size_gb
  region         = var.region
  project        = var.project_id

  authorized_network = var.network_id
  redis_version      = "REDIS_7_2"
  display_name       = "ShiVi Platform Cache (${var.environment})"
  transit_encryption_mode = "SERVER_AUTHENTICATION"

  redis_configs = {
    maxmemory-policy = "allkeys-lru"
  }

  maintenance_policy {
    weekly_maintenance_window {
      day = "SUNDAY"
      start_time { hours = 4; minutes = 0; seconds = 0; nanos = 0 }
    }
  }
}

output "host" {
  value = google_redis_instance.shivi.host
}

output "port" {
  value = google_redis_instance.shivi.port
}
