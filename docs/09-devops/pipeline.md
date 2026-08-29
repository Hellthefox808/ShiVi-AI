# DevOps, CI/CD & Deployment Pipeline
## Reproducible Build & Release Engineering

ShiVi adheres to GitOps principles and fully automated quality gates.

---

### CI/CD Pipeline Stages

```
GIT COMMIT ➔ PR ➔ CI LINT & TYPECHECK ➔ UNIT TESTS (175+ files) ➔ HARNESS BENCHMARKS ➔ CONTAINER BUILD ➔ STAGING ➔ CANARY DEPLOYMENT ➔ PRODUCTION PROMOTION
```

### Key DevOps Guardrails
- **Zero Fiction Policy**: No build, integration, or compliance assertion is declared passed without concrete automated test execution.
- **Canary Gatekeeping**: Agent and model version updates must pass the Universal Evaluation Harness (>90% accuracy, >95% groundedness, 100% policy compliance) before being promoted from CANARY to PRODUCTION.
- **Instant Rollback**: If drift or error rate anomalies exceed 1% in canary traffic, traffic immediately falls back to the baseline version.
