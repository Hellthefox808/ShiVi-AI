# Architecture Decision Record (ADR-001)
## ADR-001: Centralized Platform Kernel & Unified Control Planes

- **Status**: Accepted
- **Date**: 2026-08-29
- **Author**: ShiVi Core Architecture Team

---

### Context
Building an enterprise-grade AI B2B operating system requires consistent identity, multi-tenancy isolation, authorization, policy checks, and cryptographic auditing. Scattering security, model routing, or tenancy logic across individual domain services leads to governance drift, data leakage, and untracked shadow AI.

### Decision
1. Implement a single shared `@shivi/kernel` containing identity, tenant resolution, RBAC/ABAC authorization, capability token gating (T0–T5), and scoped agent memory.
2. Route all LLM requests exclusively through `@shivi/ai-sdk` (AI Gateway) with automatic model fallback, token budgets, and cost tracking.
3. Expose 5 Unified Control Planes in the user interface (Business, AI, Execution, Security & Governance, Operations).

### Consequences
- **Positive**: Strict tenant isolation enforced at database, vector, cache, and memory layers; zero duplicated authz or policy code; 100% auditable SHA-256 evidence chain; deterministic evaluation of all 38 agents.
- **Negative**: All new domain services must consume the kernel contracts and cannot bypass policy or capability gates.
