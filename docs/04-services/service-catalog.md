# Service Catalog & Monorepo Packages
## Monorepo Service Registry

The ShiVi platform consists of core packages and bounded domain microservices:

| Package / Service | Path | Description |
| :--- | :--- | :--- |
| **`@shivi/contracts`** | `packages/contracts` | Canonical Zod schemas and TypeScript types for governance, agents, revops, crm, and tenancy. |
| **`@shivi/kernel`** | `packages/kernel` | Core control primitives: Identity, Tenancy, AuthZ, Capability, Memory, Context Safety. |
| **`@shivi/ai-sdk`** | `packages/ai-sdk` | AI Gateway, Multi-Model Router, FinOps Cost Tracker, Model Card Registry, Kill Switches. |
| **`@shivi/security`** | `packages/security` | Prompt Sanitizer, PII Redactor, Cryptographic Evidence Ledger, Vault KMS. |
| **`@shivi/agent-runtime`**| `packages/agent-runtime` | 38 Core Agents Roster, Lifecycle Manager, Universal Evaluation Harness, Drift Engine. |
| **`service-revops`** | `services/revops` | Pipeline velocity engine, deal risk scoring, executive forecast anomaly decomposition. |
| **`service-crm`** | `services/crm` | Data source manager, freshness checker, 6-dimension data quality evaluator, contract validation. |
| **`service-rag`** | `services/rag` | Hybrid dense/sparse retrieval, 8-step decision lineage tracking, demographic bias screening. |
| **`service-audit`** | `services/audit` | Cryptographic SHA-256 audit log, compliance control plane (EU AI Act, GDPR, SOC2), HITL oversight queue. |
| **`service-policy`** | `services/policy` | Policy-as-Code engine, capability token evaluation, rate limiter. |
| **`service-workflows`**| `services/workflows` | Durable state machine workflow execution with reverse compensation rollback. |
| **`service-mcp`** | `services/mcp` | Model Context Protocol tool runtime and untrusted output sanitizer. |
