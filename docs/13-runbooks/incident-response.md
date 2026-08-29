# Incident Management & Operational Runbooks
## 8-Stage Incident Response Lifecycle

ShiVi standardizes incident containment and resolution across all security, data, and AI failure events.

---

### The 8 Incident Stages

```
1. DETECTED ➔ 2. CLASSIFIED ➔ 3. CONTAINED ➔ 4. INVESTIGATING ➔ 5. REMEDIATING ➔ 6. VERIFIED ➔ 7. DOCUMENTED ➔ 8. CLOSED
```

### Standard Containment Runbooks

- **Runbook: Model Drift / Hallucination Spike**:
  1. Transition incident to `CONTAINED`.
  2. Activate Canary Rollback to revert agent version to baseline.
  3. Re-index vector embeddings if groundedness drops below 70%.
- **Runbook: Shadow AI / Unapproved Telemetry**:
  1. Quarantine source IP / API key at the WAF level.
  2. Add detected tool/model signature to blocked inventory assets.
  3. Notify AI Compliance Officer.
- **Runbook: Tool Outage / Partial CRM Sync**:
  1. Pause active durable workflows touching affected external integration.
  2. Switch adapter mode to `DEGRADED_READ_ONLY`.
  3. Trigger automated state reconciliation upon adapter recovery.
