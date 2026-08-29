# Zero-Trust Security & Multi-Tenant Isolation
## Comprehensive Security Architecture

Security is baked into every layer of ShiVi: Frontend, API Gateway, Database, Vector Store, Scoped Memory, and Agent Execution.

---

### Key Security Controls

1. **Strict Multi-Tenant Isolation**:
   - Every database query, vector search, cache key, and memory query requires a validated `TenantContext`.
   - Cross-tenant memory or data access throws hard `SecurityViolationException`.

2. **Pre-Context PII Anonymization**:
   - The [`PromptSanitizer`](file:///c:/Users/ravir/Desktop/PROJECT/Project/ShiVi/packages/security/src/sanitizer.ts) detects and redacts emails (`[REDACTED_EMAIL]`), phone numbers (`[REDACTED_PHONE]`), social security numbers (`[REDACTED_SSN]`), credit cards (`[REDACTED_CARD]`), and API keys (`[REDACTED_API_KEY]`) before compilation into prompt context.

3. **Prompt Injection & Adversarial Shielding**:
   - Multi-layer regex and semantic classification detecting direct instructions override (`Ignore previous instructions`), jailbreaks, exfiltration markers, and indirect prompt injection within ingested documents.

4. **KMS & Envelope Encryption**:
   - AES-256-GCM encryption for all sensitive fields at rest with per-tenant data keys encrypted under master KMS keys.
