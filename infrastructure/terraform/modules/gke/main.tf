# ShiVi GKE Cluster Module

variable "project_id" { type = string }
variable "region" { type = string }
variable "network_id" { type = string }
variable "subnet_id" { type = string }
variable "environment" { type = string }
variable "min_node_count" { type = number }
variable "max_node_count" { type = number }
variable "machine_type" { type = string }

resource "google_container_cluster" "shivi" {
  provider = google-beta
  name     = "shivi-${var.environment}"
  location = var.region
  project  = var.project_id

  network    = var.network_id
  subnetwork = var.subnet_id

  # Autopilot mode for production-grade management
  enable_autopilot = true

  release_channel {
    channel = var.environment == "production" ? "STABLE" : "REGULAR"
  }

  ip_allocation_policy {
    stack_type = "IPV4"
  }

  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block  = "172.16.0.0/28"
  }

  maintenance_policy {
    recurring_window {
      start_time = "2025-01-01T04:00:00Z"
      end_time   = "2025-01-01T08:00:00Z"
      recurrence = "FREQ=WEEKLY;BYDAY=SA,SU"
    }
  }

  binary_authorization {
    evaluation_mode = var.environment == "production" ? "PROJECT_SINGLETON_POLICY_ENFORCE" : "DISABLED"
  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }
}

output "cluster_id" {
  value = google_container_cluster.shivi.id
}

output "cluster_endpoint" {
  value     = google_container_cluster.shivi.endpoint
  sensitive = true
}
