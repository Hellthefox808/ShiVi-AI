# 6-Layer AI Governance Fabric
## Enterprise AI Assurance & Regulatory Compliance

ShiVi integrates AI governance directly into the platform's core runtime rather than treating it as an external checklist.

---

### The 6 Governance Layers

1. **Layer 1: AI Inventory, Model Registry & Shadow AI**:
   - Continuous catalog of all 38 agents, models, prompts, and tools.
   - 5-Way Ownership (Business, Technical, Security, Data, Compliance).
   - Dynamic AI Bill of Materials (AI BOM) with SHA-256 validation.
   - Shadow AI network telemetry scanner.
   - Multi-level kill switches (`NORMAL`, `SAFE_MODE`, `READ_ONLY`, `LOCKDOWN`).

2. **Layer 2: Data Foundation, Lineage & Quality**:
   - 8-step decision lineage tracking.
   - 6-dimension data quality scoring (Completeness, Accuracy, Consistency, Uniqueness, Validity, Timeliness).
   - Data contract schema drift detection.
   - Demographic bias screening (EEOC 4/5ths rule).

3. **Layer 3: Data Security & Zero-Trust Isolation**:
   - Pre-context PII redaction (email, phone, SSN, card, API keys).
   - Contextual ABAC + RBAC policy enforcement.
   - Cryptographic multi-tenant memory & vector boundary isolation.

4. **Layer 4: Model Assurance & Universal Eval Harness**:
   - Model cards with failure modes, latency, and cost parameters.
   - Universal benchmark harness (Golden standard, Adversarial, Regression).
   - Multi-dimensional continuous drift detection (`BEHAVIOR_DRIFT`, `RETRIEVAL_DRIFT`, `MODEL_DRIFT`).

5. **Layer 5: Human Oversight (HITL) & Decision Review**:
   - Consequential action approval gates (T3–T5).
   - Interactive decision review with reason, evidence, and expected effect.
   - Role-authorized override capability with mandatory justification audit.
   - 8-stage incident management lifecycle.

6. **Layer 6: Compliance Control Plane & Cryptographic Audit**:
   - Continuous automated controls for EU AI Act (Art. 9, 14, 15, 50), GDPR (Art. 5, 32), and SOC2 (CC6.1).
   - Exception management with expiry dates and mitigation plans.
   - Tamper-evident SHA-256 cryptographic evidence hash chaining.
   - Complete 13-point audit logging and CSV/JSON reporting.
