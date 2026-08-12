# ShiVi VPC Networking Module

variable "project_id" { type = string }
variable "region" { type = string }
variable "environment" { type = string }

resource "google_compute_network" "shivi" {
  name                    = "shivi-vpc-${var.environment}"
  auto_create_subnetworks = false
  project                 = var.project_id
}

resource "google_compute_subnetwork" "shivi" {
  name          = "shivi-subnet-${var.environment}"
  ip_cidr_range = "10.0.0.0/20"
  region        = var.region
  network       = google_compute_network.shivi.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.4.0.0/14"
  }
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.8.0.0/20"
  }

  private_ip_google_access = true
}

resource "google_compute_global_address" "private_ip" {
  name          = "shivi-private-ip-${var.environment}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.shivi.id
}

resource "google_service_networking_connection" "private_vpc" {
  network                 = google_compute_network.shivi.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip.name]
}

# Cloud NAT for egress
resource "google_compute_router" "nat_router" {
  name    = "shivi-nat-router-${var.environment}"
  region  = var.region
  network = google_compute_network.shivi.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "shivi-nat-${var.environment}"
  router                             = google_compute_router.nat_router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

output "network_id" {
  value = google_compute_network.shivi.id
}

output "subnet_id" {
  value = google_compute_subnetwork.shivi.id
}
