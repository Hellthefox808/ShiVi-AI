#!/usr/bin/env node
/**
 * ShiVi X100+ Infrastructure Scaffolder
 * Generates Terraform, Kubernetes, Helm, OpenTelemetry, and DR infrastructure
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

// ─── Terraform ───────────────────────────────────────────────
const tfDir = join(ROOT, 'infrastructure', 'terraform');

mkdirSync(join(tfDir, 'modules', 'gke'), { recursive: true });
mkdirSync(join(tfDir, 'modules', 'database'), { recursive: true });
mkdirSync(join(tfDir, 'modules', 'redis'), { recursive: true });
mkdirSync(join(tfDir, 'modules', 'networking'), { recursive: true });
mkdirSync(join(tfDir, 'modules', 'dr'), { recursive: true });
mkdirSync(join(tfDir, 'environments', 'staging'), { recursive: true });
mkdirSync(join(tfDir, 'environments', 'production'), { recursive: true });

writeFileSync(join(tfDir, 'main.tf'), `# ShiVi X100+ Platform — Root Terraform Configuration
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
`);

writeFileSync(join(tfDir, 'variables.tf'), `# ShiVi X100+ Platform Variables

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
`);

writeFileSync(join(tfDir, 'outputs.tf'), `# ShiVi X100+ Platform Outputs

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
`);

// GKE Module
writeFileSync(join(tfDir, 'modules', 'gke', 'main.tf'), `# ShiVi GKE Cluster Module

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
  name     = "shivi-\${var.environment}"
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
    workload_pool = "\${var.project_id}.svc.id.goog"
  }
}

output "cluster_id" {
  value = google_container_cluster.shivi.id
}

output "cluster_endpoint" {
  value     = google_container_cluster.shivi.endpoint
  sensitive = true
}
`);

// Database Module
writeFileSync(join(tfDir, 'modules', 'database', 'main.tf'), `# ShiVi Cloud SQL PostgreSQL + pgvector Module

variable "project_id" { type = string }
variable "region" { type = string }
variable "network_id" { type = string }
variable "environment" { type = string }
variable "tier" { type = string }
variable "ha_enabled" { type = bool }

resource "google_sql_database_instance" "shivi" {
  name             = "shivi-db-\${var.environment}"
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
`);

// Redis Module
writeFileSync(join(tfDir, 'modules', 'redis', 'main.tf'), `# ShiVi Memorystore Redis Module

variable "project_id" { type = string }
variable "region" { type = string }
variable "network_id" { type = string }
variable "environment" { type = string }
variable "memory_size_gb" { type = number }

resource "google_redis_instance" "shivi" {
  name           = "shivi-cache-\${var.environment}"
  tier           = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  memory_size_gb = var.memory_size_gb
  region         = var.region
  project        = var.project_id

  authorized_network = var.network_id
  redis_version      = "REDIS_7_2"
  display_name       = "ShiVi Platform Cache (\${var.environment})"
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
`);

// Networking Module
writeFileSync(join(tfDir, 'modules', 'networking', 'main.tf'), `# ShiVi VPC Networking Module

variable "project_id" { type = string }
variable "region" { type = string }
variable "environment" { type = string }

resource "google_compute_network" "shivi" {
  name                    = "shivi-vpc-\${var.environment}"
  auto_create_subnetworks = false
  project                 = var.project_id
}

resource "google_compute_subnetwork" "shivi" {
  name          = "shivi-subnet-\${var.environment}"
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
  name          = "shivi-private-ip-\${var.environment}"
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
  name    = "shivi-nat-router-\${var.environment}"
  region  = var.region
  network = google_compute_network.shivi.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "shivi-nat-\${var.environment}"
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
`);

// DR Module
writeFileSync(join(tfDir, 'modules', 'dr', 'main.tf'), `# ShiVi Multi-Region Disaster Recovery Module

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
    workload_pool = "\${var.project_id}.svc.id.goog"
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
          network_url        = "projects/\${var.project_id}/global/networks/shivi-vpc-production"
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
`);

// ─── Kubernetes ──────────────────────────────────────────────
const k8sDir = join(ROOT, 'infrastructure', 'kubernetes');
mkdirSync(join(k8sDir, 'deployments'), { recursive: true });
mkdirSync(join(k8sDir, 'services'), { recursive: true });
mkdirSync(join(k8sDir, 'configmaps'), { recursive: true });
mkdirSync(join(k8sDir, 'hpa'), { recursive: true });
mkdirSync(join(k8sDir, 'ingress'), { recursive: true });

writeFileSync(join(k8sDir, 'namespace.yaml'), `apiVersion: v1
kind: Namespace
metadata:
  name: shivi-platform
  labels:
    app.kubernetes.io/part-of: shivi-x100
    app.kubernetes.io/managed-by: helm
  annotations:
    purpose: "ShiVi X100+ Enterprise AI Platform"
`);

writeFileSync(join(k8sDir, 'deployments', 'kernel-api.yaml'), `apiVersion: apps/v1
kind: Deployment
metadata:
  name: shivi-kernel-api
  namespace: shivi-platform
  labels:
    app: kernel-api
    tier: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kernel-api
  template:
    metadata:
      labels:
        app: kernel-api
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
    spec:
      serviceAccountName: shivi-kernel-api
      containers:
        - name: kernel-api
          image: gcr.io/PROJECT_ID/shivi-kernel-api:latest
          ports:
            - containerPort: 3000
              name: http
            - containerPort: 9090
              name: metrics
          env:
            - name: NODE_ENV
              value: production
            - name: PORT
              value: "3000"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: shivi-database
                  key: connection-string
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: shivi-redis
                  key: connection-string
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: "http://otel-collector.shivi-platform:4317"
            - name: OTEL_SERVICE_NAME
              value: shivi-kernel-api
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          securityContext:
            runAsNonRoot: true
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
`);

writeFileSync(join(k8sDir, 'services', 'kernel-api-svc.yaml'), `apiVersion: v1
kind: Service
metadata:
  name: shivi-kernel-api
  namespace: shivi-platform
  labels:
    app: kernel-api
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
      name: http
    - port: 9090
      targetPort: 9090
      protocol: TCP
      name: metrics
  selector:
    app: kernel-api
`);

writeFileSync(join(k8sDir, 'hpa', 'kernel-api-hpa.yaml'), `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: shivi-kernel-api-hpa
  namespace: shivi-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: shivi-kernel-api
  minReplicas: 3
  maxReplicas: 50
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 4
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 2
          periodSeconds: 120
`);

writeFileSync(join(k8sDir, 'ingress', 'ingress.yaml'), `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shivi-platform-ingress
  namespace: shivi-platform
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  tls:
    - hosts:
        - api.shivi.io
        - app.shivi.io
      secretName: shivi-tls
  rules:
    - host: api.shivi.io
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: shivi-kernel-api
                port:
                  number: 80
    - host: app.shivi.io
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: shivi-web
                port:
                  number: 80
`);

writeFileSync(join(k8sDir, 'configmaps', 'platform-config.yaml'), `apiVersion: v1
kind: ConfigMap
metadata:
  name: shivi-platform-config
  namespace: shivi-platform
data:
  LOG_LEVEL: "info"
  OTEL_EXPORTER_OTLP_ENDPOINT: "http://otel-collector.shivi-platform:4317"
  OTEL_SERVICE_NAME: "shivi-platform"
  MAX_AGENT_CONCURRENCY: "100"
  DEFAULT_MODEL_PROVIDER: "gemini"
  RATE_LIMIT_RPM: "1000"
  EVIDENCE_CHAIN_ALGORITHM: "sha256"
  TENANT_ISOLATION_MODE: "strict"
`);

// ─── Helm Charts ─────────────────────────────────────────────
const helmDir = join(ROOT, 'infrastructure', 'helm');
mkdirSync(join(helmDir, 'templates'), { recursive: true });

writeFileSync(join(helmDir, 'Chart.yaml'), `apiVersion: v2
name: shivi-platform
description: ShiVi X100+ Enterprise AI Operating Ecosystem
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - ai
  - enterprise
  - multi-tenant
  - agents
  - governance
maintainers:
  - name: ShiVi Engineering Core
home: https://github.com/Hellthefox808/ShiVi-AI
sources:
  - https://github.com/Hellthefox808/ShiVi-AI
`);

writeFileSync(join(helmDir, 'values.yaml'), `# ShiVi X100+ Helm Chart — Default Values

replicaCount: 3

image:
  repository: gcr.io/shivi-platform/kernel-api
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: api.shivi.io
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: shivi-tls
      hosts:
        - api.shivi.io

resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 2000m
    memory: 2Gi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 50
  targetCPUUtilizationPercentage: 70

database:
  host: ""
  port: 5432
  name: shivi_platform
  sslMode: require

redis:
  host: ""
  port: 6379

observability:
  otel:
    enabled: true
    endpoint: "http://otel-collector:4317"
  prometheus:
    enabled: true
    port: 9090

security:
  podSecurityContext:
    runAsNonRoot: true
  containerSecurityContext:
    readOnlyRootFilesystem: true
    allowPrivilegeEscalation: false

dr:
  enabled: false
  region: us-east1
  failoverMode: automatic
  rpo: "1m"
  rto: "5m"
`);

writeFileSync(join(helmDir, 'values-staging.yaml'), `# ShiVi Staging Overrides
replicaCount: 2
autoscaling:
  minReplicas: 2
  maxReplicas: 10
resources:
  requests:
    cpu: 250m
    memory: 256Mi
  limits:
    cpu: 1000m
    memory: 1Gi
dr:
  enabled: false
`);

writeFileSync(join(helmDir, 'values-production.yaml'), `# ShiVi Production Overrides
replicaCount: 5
autoscaling:
  minReplicas: 5
  maxReplicas: 100
  targetCPUUtilizationPercentage: 65
resources:
  requests:
    cpu: 1000m
    memory: 1Gi
  limits:
    cpu: 4000m
    memory: 4Gi
dr:
  enabled: true
  region: us-east1
  failoverMode: automatic
  rpo: "30s"
  rto: "2m"
`);

// ─── OpenTelemetry ───────────────────────────────────────────
const otelDir = join(ROOT, 'infrastructure', 'observability');
mkdirSync(join(otelDir, 'grafana', 'dashboards'), { recursive: true });
mkdirSync(join(otelDir, 'prometheus'), { recursive: true });
mkdirSync(join(otelDir, 'otel'), { recursive: true });

writeFileSync(join(otelDir, 'otel', 'collector-config.yaml'), `# ShiVi OpenTelemetry Collector Configuration
# Distributed tracing, metrics, and log collection

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 5s
    send_batch_size: 1024
    send_batch_max_size: 2048

  memory_limiter:
    check_interval: 5s
    limit_mib: 4096
    spike_limit_mib: 512

  attributes:
    actions:
      - key: platform
        value: shivi-x100
        action: upsert
      - key: environment
        from_attribute: deployment.environment
        action: upsert

  resource:
    attributes:
      - key: service.namespace
        value: shivi-platform
        action: upsert

  tail_sampling:
    policies:
      - name: error-traces
        type: status_code
        status_code:
          status_codes: [ERROR]
      - name: slow-traces
        type: latency
        latency:
          threshold_ms: 1000
      - name: probabilistic
        type: probabilistic
        probabilistic:
          sampling_percentage: 10

exporters:
  otlp/cloud_trace:
    endpoint: cloudtrace.googleapis.com:443
    compression: gzip

  otlp/cloud_monitoring:
    endpoint: monitoring.googleapis.com:443
    compression: gzip

  prometheus:
    endpoint: 0.0.0.0:9090
    namespace: shivi

  logging:
    loglevel: info

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, attributes, resource, tail_sampling]
      exporters: [otlp/cloud_trace, logging]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch, attributes, resource]
      exporters: [otlp/cloud_monitoring, prometheus]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch, attributes, resource]
      exporters: [logging]

  extensions: []

  telemetry:
    logs:
      level: info
    metrics:
      address: 0.0.0.0:8888
`);

writeFileSync(join(otelDir, 'prometheus', 'alerts.yaml'), `# ShiVi Platform Prometheus Alerting Rules

groups:
  - name: shivi-platform-alerts
    rules:
      - alert: ShiViHighErrorRate
        expr: rate(shivi_http_requests_total{status=~"5.."}[5m]) / rate(shivi_http_requests_total[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }} on {{ $labels.service }}"

      - alert: ShiViAgentQuarantined
        expr: shivi_agent_state{state="quarantined"} > 0
        for: 1m
        labels:
          severity: warning
          team: ai-ops
        annotations:
          summary: "Agent {{ $labels.agent_id }} quarantined"
          description: "Agent has been quarantined in tenant {{ $labels.tenant_id }}"

      - alert: ShiViHighLatencyP99
        expr: histogram_quantile(0.99, rate(shivi_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "P99 latency exceeds 2s on {{ $labels.service }}"

      - alert: ShiViModelBudgetExceeded
        expr: shivi_ai_cost_total_usd > shivi_ai_budget_limit_usd * 0.9
        for: 1m
        labels:
          severity: critical
          team: finops
        annotations:
          summary: "AI model budget 90% consumed for tenant {{ $labels.tenant_id }}"

      - alert: ShiViEvidenceLedgerTamper
        expr: shivi_evidence_ledger_tamper_detected_total > 0
        for: 0m
        labels:
          severity: critical
          team: security
        annotations:
          summary: "Evidence ledger tamper detected!"
          description: "Cryptographic chain integrity violation in tenant {{ $labels.tenant_id }}"

      - alert: ShiViDRReplicationLag
        expr: shivi_dr_replication_lag_seconds > 60
        for: 5m
        labels:
          severity: critical
          team: sre
        annotations:
          summary: "DR replication lag exceeds 60s"
          description: "Cross-region replication lag is {{ $value }}s"

      - alert: ShiViTenantIsolationViolation
        expr: shivi_tenant_isolation_violations_total > 0
        for: 0m
        labels:
          severity: critical
          team: security
        annotations:
          summary: "Tenant isolation violation detected!"
`);

writeFileSync(join(otelDir, 'grafana', 'dashboards', 'platform-overview.json'), JSON.stringify({
  dashboard: {
    title: "ShiVi X100+ Platform Overview",
    uid: "shivi-platform-overview",
    tags: ["shivi", "platform", "overview"],
    timezone: "browser",
    panels: [
      { title: "Request Rate", type: "timeseries", gridPos: { h: 8, w: 12, x: 0, y: 0 }, targets: [{ expr: "rate(shivi_http_requests_total[5m])" }] },
      { title: "Error Rate", type: "timeseries", gridPos: { h: 8, w: 12, x: 12, y: 0 }, targets: [{ expr: "rate(shivi_http_requests_total{status=~'5..'}[5m])" }] },
      { title: "P99 Latency", type: "timeseries", gridPos: { h: 8, w: 12, x: 0, y: 8 }, targets: [{ expr: "histogram_quantile(0.99, rate(shivi_request_duration_seconds_bucket[5m]))" }] },
      { title: "Active Agents", type: "stat", gridPos: { h: 4, w: 6, x: 12, y: 8 }, targets: [{ expr: "count(shivi_agent_state{state='active'})" }] },
      { title: "Quarantined Agents", type: "stat", gridPos: { h: 4, w: 6, x: 18, y: 8 }, targets: [{ expr: "count(shivi_agent_state{state='quarantined'})" }] },
      { title: "AI Spend (USD)", type: "stat", gridPos: { h: 4, w: 6, x: 12, y: 12 }, targets: [{ expr: "sum(shivi_ai_cost_total_usd)" }] },
      { title: "DR Replication Lag", type: "gauge", gridPos: { h: 4, w: 6, x: 18, y: 12 }, targets: [{ expr: "shivi_dr_replication_lag_seconds" }] },
    ],
  },
}, null, 2) + '\n');

console.log('✅ Infrastructure scaffolding complete:');
console.log('   • Terraform: main.tf, variables.tf, outputs.tf + 5 modules (gke, database, redis, networking, dr)');
console.log('   • Kubernetes: namespace, deployment, service, HPA, ingress, configmap');
console.log('   • Helm: Chart.yaml, values.yaml, values-staging.yaml, values-production.yaml');
console.log('   • OpenTelemetry: collector-config.yaml');
console.log('   • Prometheus: alerting rules (7 alerts)');
console.log('   • Grafana: platform overview dashboard');
