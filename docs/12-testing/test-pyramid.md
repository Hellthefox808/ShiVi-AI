# Testing Pyramid & Quality Verification
## Complete Test Verification Architecture

ShiVi validates reliability, security, and governance across 8 test levels:

---

### Test Tiers

1. **Unit Tests (175+ Test Files / 613+ Tests)**: Validates individual functions, schemas, state transitions, and sanitizers in <10 seconds.
2. **Integration Tests**: Tests inter-service communication between Kernel, AI Gateway, CRM, RAG, and Workflows.
3. **Master Ecosystem E2E Suite (`master-ecosystem-e2e.test.ts`)**: Runs the full 15-step master operating loop from User Login to Forecast Update.
4. **Universal AI Agent Harness**: Evaluates 38 agents against golden benchmark trajectories and evaluates accuracy, groundedness, and policy adherence.
5. **Adversarial & Red Team Suite**: Injects direct and indirect prompt injections, PII leakage attempts, and privilege escalation vectors.
6. **Multi-Tenant Boundary Isolation Tests**: Attempts cross-tenant memory, vector, and record access to verify hard rejection.
7. **Failure Recovery & Chaos Tests**: Injects tool timeouts, CRM disconnections, and verifies LIFO reverse compensation rollback.
8. **Drift Detection Tests**: Simulates runaway looping (>400 tool calls) and groundedness degradation.
