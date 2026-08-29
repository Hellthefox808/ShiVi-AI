# Integrations & Governed MCP Gateway
## Model Context Protocol (MCP) & Adapter Architecture

ShiVi treats all external tool interactions as untrusted until verified through the **Governed MCP Gateway**.

---

### Governed Tool Execution Flow

```mermaid
sequenceDiagram
    participant Agent as Specialized Agent
    participant MCP as Governed MCP Gateway
    participant Policy as Policy Engine (T0-T5)
    participant Tool as External MCP Server (CRM/Email/Calendar)
    participant Sanitize as Output Sanitizer
    participant Audit as Cryptographic Audit

    Agent->>MCP: Request Tool Invocation (Tool ID, Params)
    MCP->>Policy: Validate Capability Token & Permission Scope
    alt Policy Denied / Gate Blocked
        Policy-->>Agent: Rejection / Approval Required
    else Policy Allowed
        Policy->>MCP: Authorized
        MCP->>Tool: Execute Tool Request
        Tool-->>MCP: Raw Output Payload
        MCP->>Sanitize: Inspect Output for Prompt Injections & PII
        Sanitize-->>MCP: Clean Result
        MCP->>Audit: Log Invocation & SHA-256 Hash
        MCP-->>Agent: Return Verified Tool Result
    end
```

---

### Adapter Pattern
Business logic depends exclusively on typed adapter interfaces (e.g. `CRMAdapter`, `EmailAdapter`), allowing seamless switching between mock test harnesses and live production integrations (Salesforce, HubSpot, SendGrid, Gmail).
