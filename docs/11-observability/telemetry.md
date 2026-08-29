# Observability, Telemetry & FinOps Cost Tracking
## OpenTelemetry & Business Observability Architecture

ShiVi instruments every layer of execution with distributed tracing and cost attribution.

---

### 1. Distributed Trace Hierarchy

```
[HTTP Request / Gateway Ingress]
  └── [Durable Workflow Step]
        └── [Agent Execution Turn]
              ├── [Pre-Context PII Sanitization]
              ├── [pgvector Hybrid RAG Query]
              ├── [AI Gateway LLM Request (Tokens, Model, Cost)]
              ├── [Policy Capability Gate Check (T0-T5)]
              ├── [Governed MCP Tool Invocation]
              └── [SHA-256 Cryptographic Audit Commit]
```

---

### 2. FinOps AI Cost Tracking
Every model call logs token usage (prompt tokens, completion tokens), execution latency (ms), and cost in USD. Budgets are strictly enforced at the agent, workflow, tenant, and organization levels.
