# Data Flow & Decision Lineage Architecture
## 8-Step Governed Decision Flow

Every consequential AI decision within ShiVi is strictly traceable through 8 deterministic stages:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Trigger
    participant Source as 1. Enterprise Source (CRM/Docs)
    participant Transform as 2. Transform & DLP Redactor
    participant Storage as 3. Encrypted Storage (pgvector/DB)
    participant Retrieval as 4. ACL Hybrid Retrieval
    participant Model as 5. AI Gateway & Model Router
    participant Agent as 6. Specialized Agent Runtime
    participant Decision as 7. Policy & HITL Decision Gate
    participant Action as 8. Verified External Action (MCP/Tool)
    participant Audit as Cryptographic Audit Ledger

    User->>Source: Business Signal Received
    Source->>Transform: Ingest Raw Payload
    Transform->>Storage: Store DLP-Sanitized Context
    Storage->>Retrieval: Hybrid Dense/Sparse Query
    Retrieval->>Model: Pack Minimal Authorized Context
    Model->>Agent: Generate Plan & Proposed Mutation
    Agent->>Decision: Submit Action for Policy Evaluation
    Decision->>Action: Execute Approved Tool Operation
    Action->>Audit: Record SHA-256 Chained Evidence Hash
```

---

### Context Engine Guidelines
- **Relevant & Minimal**: Never dump entire databases or full account histories into context.
- **Pre-Context Sanitization**: PII (emails, phones, SSNs, credit cards, API keys) is redacted before prompt generation.
- **Traceable**: Every context item carries document ID, chunk index, timestamp, and security classification.
