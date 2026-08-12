# ShiVi X100+ Platform Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "primary_region" {
  description = "Primary deployment region"
  type        = string
  default     = "us-central1"
}

variable "dr_region" {
  description = "Disaster recovery region"
  type        = string
  default     = "us-east1"
}

variable "environment" {
  description = "Deployment environment (staging, production)"
  type        = string
  default     = "staging"
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be 'staging' or 'production'."
  }
}

variable "gke_min_nodes" {
  description = "GKE minimum node count"
  type        = number
  default     = 3
}

variable "gke_max_nodes" {
  description = "GKE maximum node count"
  type        = number
  default     = 20
}

variable "gke_machine_type" {
  description = "GKE node machine type"
  type        = string
  default     = "e2-standard-8"
}

variable "db_tier" {
  description = "Cloud SQL tier"
  type        = string
  default     = "db-custom-4-16384"
}

variable "redis_memory_gb" {
  description = "Redis memory size in GB"
  type        = number
  default     = 4
}
