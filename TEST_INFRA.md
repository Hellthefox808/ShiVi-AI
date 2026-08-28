# E2E Test Infra: ShiVi RevOps OS

## Test Philosophy
- Opaque-box, requirement-driven. Derives from ORIGINAL_REQUEST.md requirements (R1–R5).
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | 38 Core Specialized Agents Roster | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 2 | Capability Scoping & T0–T5 Risk Tiers | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 3 | Token Budgeting & FinOps Engine | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 4 | Model Router & Fallback Gateway | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 5 | Agent Lifecycle & Recovery Engine | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 6 | Agent Evaluation Harness & Canary | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ | ✓ |
| 7 | Real-Time Pipeline Intelligence | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 8 | Buying Committee Role Mapping | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 9 | Deal Risk Scoring Engine | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 10 | Dynamic Forecast Rollups | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ | ✓ |
| 11 | Deterministic Workflow State Machine | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 12 | Human-in-the-Loop (HITL) Gates | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 13 | Reverse Rollback Compensation | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 14 | Cryptographic SHA-256 Evidence Ledger | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ | ✓ |
| 15 | Dense & Sparse Hybrid RAG Retrieval | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 16 | Tenant Isolation & ACL Role Filtering | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 17 | Citation Provenance & Groundedness | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 18 | Prompt Injection Sanitization | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ | ✓ |
| 19 | Glassmorphic Web Control Plane | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ |
| 20 | Interactive Workflow Studio | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ |
| 21 | Pipeline Kanban & Mitigation UI | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ |
| 22 | 5 Live RevOps Demonstration Scenarios | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ |
| 23 | 38 Agents Interactive Roster | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ | ✓ |
| 24 | Automated Monorepo Vitest Test Suites | ORIGINAL_REQUEST §Verification | 5 | 5 | ✓ | ✓ |
| 25 | Zero TypeScript Compilation Errors | ORIGINAL_REQUEST §Verification | 5 | 5 | ✓ | ✓ |

## Test Architecture
- Test runner: `npx vitest run`
- TypeScript checker: `npx tsc -p tsconfig.base.json --noEmit`
- Test suites: 167 files covering all packages, services, kernel, security, contracts, and frontend modules.
- Pass/fail semantics: Exit code 0, 100% test pass rate across all 475+ test cases.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Enterprise Deal Risk Mitigation | Buying committee mapping, deal risk scoring, prompt sanitization, HITL gate | High |
| 2 | Autonomous RevOps Contract Ingestion | Ingestion DLP scan, dense/sparse vector embedding, ACL classification | High |
| 3 | Multi-Agent Forecast Adjustment Workflow | 4-stage pipeline rollups, FinOps token budgeting, SHA-256 evidence logging | High |
| 4 | Workflow Failure Rollback Compensation | Step execution error, automated reverse rollback compensation, zero orphaned records | High |
| 5 | Agent Lifecycle Canary & Evaluation Replay | Benchmark evaluation, hallucination scoring, canary replay promotion | High |

## Coverage Thresholds
- Tier 1: Feature Coverage (>=5 tests per feature)
- Tier 2: Boundary & Corner Cases (stagnation >21d, communication gap >14d, cost cap exceed, chain tampering)
- Tier 3: Cross-Feature Interactions (RAG + Prompt Sanitizer + ACL; Workflow + HITL + Evidence Ledger + Rollback)
- Tier 4: 5 Realistic End-to-End RevOps Application Scenarios
