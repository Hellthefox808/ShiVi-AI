# ShiVi Multi-Region Disaster Recovery Module

variable "project_id" { type = string }
variable "primary_region" { type = string }
variable "dr_region" { type = string }
variable "primary_cluster_id" { type = string }
variable "primary_db_id" { type = string }

# DR GKE Cluster (standby)
resource "google_container_cluster" "shivi_dr" {
  provider         = google-beta
  name             = "shivi-dr"
  location         = var.dr_region
  project          = var.project_id
  enable_autopilot = true

  release_channel {
    channel = "STABLE"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
}

# Cross-region database replica
resource "google_sql_database_instance" "shivi_replica" {
  name                 = "shivi-db-replica"
  database_version     = "POSTGRES_16"
  region               = var.dr_region
  project              = var.project_id
  master_instance_name = var.primary_db_id

  replica_configuration {
    failover_target = true
  }

  settings {
    tier              = "db-custom-4-16384"
    availability_type = "REGIONAL"

    backup_configuration {
      enabled = false
    }
  }
}

# Cloud DNS failover routing
resource "google_dns_record_set" "failover" {
  name         = "api.shivi.internal."
  type         = "A"
  ttl          = 60
  managed_zone = "shivi-internal"

  routing_policy {
    primary_backup {
      enable_geo_fencing_for_backups = true
      primary {
        internal_load_balancers {
          load_balancer_type = "regionalL4ilb"
          ip_address         = "10.0.0.100"
          ip_protocol        = "tcp"
          port               = "443"
          project            = var.project_id
          region             = var.primary_region
          network_url        = "projects/${var.project_id}/global/networks/shivi-vpc-production"
        }
      }
      backup_geo {
        location = var.dr_region
        rrdatas  = ["10.1.0.100"]
      }
      trickle_ratio = 0.0
    }
  }
}

output "dr_cluster_endpoint" {
  value     = google_container_cluster.shivi_dr.endpoint
  sensitive = true
}

output "replica_connection_string" {
  value     = google_sql_database_instance.shivi_replica.connection_name
  sensitive = true
}
