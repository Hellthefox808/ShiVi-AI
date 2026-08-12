# ShiVi X100+ Platform — Root Terraform Configuration
# Provider: Google Cloud Platform

terraform {
  required_version = ">= 1.9.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
  }
  backend "gcs" {
    bucket = "shivi-terraform-state"
    prefix = "platform"
  }
}

provider "google" {
  project = var.project_id
  region  = var.primary_region
}

provider "google-beta" {
  project = var.project_id
  region  = var.primary_region
}

module "networking" {
  source       = "./modules/networking"
  project_id   = var.project_id
  region       = var.primary_region
  environment  = var.environment
}

module "gke" {
  source              = "./modules/gke"
  project_id          = var.project_id
  region              = var.primary_region
  network_id          = module.networking.network_id
  subnet_id           = module.networking.subnet_id
  environment         = var.environment
  min_node_count      = var.gke_min_nodes
  max_node_count      = var.gke_max_nodes
  machine_type        = var.gke_machine_type
}

module "database" {
  source              = "./modules/database"
  project_id          = var.project_id
  region              = var.primary_region
  network_id          = module.networking.network_id
  environment         = var.environment
  tier                = var.db_tier
  ha_enabled          = var.environment == "production"
}

module "redis" {
  source              = "./modules/redis"
  project_id          = var.project_id
  region              = var.primary_region
  network_id          = module.networking.network_id
  environment         = var.environment
  memory_size_gb      = var.redis_memory_gb
}

# Multi-Region DR (production only)
module "dr" {
  source              = "./modules/dr"
  count               = var.environment == "production" ? 1 : 0
  project_id          = var.project_id
  primary_region      = var.primary_region
  dr_region           = var.dr_region
  primary_cluster_id  = module.gke.cluster_id
  primary_db_id       = module.database.instance_id
}
