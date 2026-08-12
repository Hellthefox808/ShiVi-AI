# ShiVi Cloud SQL PostgreSQL + pgvector Module

variable "project_id" { type = string }
variable "region" { type = string }
variable "network_id" { type = string }
variable "environment" { type = string }
variable "tier" { type = string }
variable "ha_enabled" { type = bool }

resource "google_sql_database_instance" "shivi" {
  name             = "shivi-db-${var.environment}"
  database_version = "POSTGRES_16"
  region           = var.region
  project          = var.project_id

  settings {
    tier              = var.tier
    availability_type = var.ha_enabled ? "REGIONAL" : "ZONAL"

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "03:00"
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 30
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
      require_ssl     = true
    }

    database_flags {
      name  = "cloudsql.enable_pgvector"
      value = "on"
    }

    database_flags {
      name  = "max_connections"
      value = "200"
    }

    insights_config {
      query_insights_enabled  = true
      query_plans_per_minute  = 5
      query_string_length     = 4096
      record_application_tags = true
      record_client_address   = true
    }

    maintenance_window {
      day          = 7
      hour         = 4
      update_track = var.environment == "production" ? "stable" : "canary"
    }
  }

  deletion_protection = var.environment == "production"
}

resource "google_sql_database" "shivi_db" {
  name     = "shivi_platform"
  instance = google_sql_database_instance.shivi.name
}

output "instance_id" {
  value = google_sql_database_instance.shivi.id
}

output "connection_string" {
  value     = google_sql_database_instance.shivi.connection_name
  sensitive = true
}
