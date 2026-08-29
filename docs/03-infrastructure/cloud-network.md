# Cloud & Network Infrastructure
## Zero-Trust Multi-Tier Infrastructure Topology

ShiVi infrastructure follows the principle of least privilege, strict network isolation, and reproducible Infrastructure-as-Code (IaC).

---

### Network Architecture

```
PUBLIC TIER:
  [Cloudflare CDN / WAF] ➔ [Application Load Balancer] ➔ [API Gateway / Edge]

PRIVATE TIER (No Public Internet Access):
  ├── Compute: [API Servers, Workflow Workers, Agent Runtime Workers]
  ├── Database: [PostgreSQL (Primary + Read Replicas)]
  ├── Caching & Messaging: [Redis Cluster (Outbox & Ephemeral state)]
  ├── Vector Store: [pgvector Encrypted Index]
  └── KMS & Secrets: [HashiCorp Vault / Cloud KMS]
```

### Security Guardrails
- **No Direct Database Access**: Database and cache instances reside exclusively in private subnets with strict security group peering.
- **Envelope Encryption**: All sensitive data stored at rest uses AES-256-GCM with automated 90-day master key rotation.
- **mTLS / SPIFFE SVID**: Inter-service communication is authenticated via mutual TLS with cryptographic SPIFFE SVIDs.
