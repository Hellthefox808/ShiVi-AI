# Project: ShiVi RevOps OS & Control Plane

## Architecture
ShiVi is a zero-trust, AI-native B2B Revenue Operations Operating System and control plane orchestrating 38 specialized agents, hybrid RAG knowledge graphs, durable multi-agent workflows, and tamper-evident SHA-256 evidence ledgers.

The architecture comprises 5 modular layers:
1. **Autonomous Multi-Agent Runtime Layer** (`packages/agent-runtime`, `packages/kernel`, `packages/ai-sdk`, `packages/mcp-gateway`): Agent registry (38 specialized agents), lifecycle state machine (10 states), capability scoping (T0–T5 risk tiers), model router, token budgeting, and recovery containment.
2. **Enterprise RevOps & Deal Risk Layer** (`services/revops`, `domains/02-revops-engine`, `domains/03-pipeline-intelligence`, `packages/contracts`): Stage velocity computation, buying committee mapping, deal risk evaluation (stagnation >21d, missing economic buyer, communication gap >14d), and dynamic forecast rollups across 4 pipeline stages.
3. **Durable Multi-Agent Workflow & Evidence Layer** (`packages/kernel/src/workflow.ts`, `services/workflows`, `packages/security/src/evidence.ts`): Deterministic state machine graphs (IDLE, RUNNING, WAITING_APPROVAL, COMPENSATING, COMPLETED), HITL approval gates for T3–T5 mutations, reverse rollback compensation, and SHA-256 chained evidence ledger.
4. **Hybrid RAG & Context Engineering Layer** (`packages/ai-sdk/src/rag`, `packages/security/src/sanitizer.ts`, `packages/kernel/src/context-safety.ts`): Dense vector and sparse lexical hybrid retrieval, multi-stage ingestion with DLP scanning, tenant/ACL role filtering, citation provenance schemas, groundedness evaluation, and prompt injection defense.
5. **Control Plane Web Surface & Verification Layer** (`public/index.html`, `frontend/`, test suites): Responsive glassmorphism control plane, Workflow Studio with live rollback, 4-stage Pipeline Kanban with forecast rollups, 5 Live RevOps scenarios, 38 Agents roster, and monorepo Vitest verification suite.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 38 Core Specialized Agents Roster | Complete enumeration of 38 agents across GTM (11), RevOps (9), Knowledge (3), Governance (5), Harness (3), Operations (7) | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Capability Scoping & T0–T5 Risk Tiers | Capability tokens, delegation chains, and mandatory human approval checks for high-risk mutations | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Token Budgeting & FinOps Engine | Model pricing catalog, tenant budget caps, and runaway task cost ceilings | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Model Router & Fallback Gateway | Complexity-based model routing (Flash, Sonnet, Pro) with multi-provider fallback | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Agent Lifecycle & Recovery Engine | 10 lifecycle states, 6 drift/loop/poisoning recovery triggers, and memory purge | M1 | ORIGINAL_REQUEST §R1 |
| 6 | Agent Evaluation Harness & Canary | Golden benchmark suites, prompt injection resistance, and canary replay promotion | M1 | ORIGINAL_REQUEST §R1 |
| 7 | Real-Time Pipeline Intelligence | Stage velocity ($42.5K/day), win rate, sales cycle metrics | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Buying Committee Role Mapping | Stakeholder identification (Champion, Economic Buyer, Technical Buyer, Procurement, Legal) | M2 | ORIGINAL_REQUEST §R2 |
| 9 | Deal Risk Scoring Engine | Risk scoring detecting stagnation (>21d), missing economic buyer, communication decay (>14d) | M2 | ORIGINAL_REQUEST §R2 |
| 10 | Dynamic Forecast Rollups | Total Pipeline ($1.94M), Weighted ARR ($1.50M), Committed ARR ($1.54M) across 4 stages | M2 | ORIGINAL_REQUEST §R2 |
| 11 | Deterministic Workflow State Machine | Step transitions (IDLE, RUNNING, WAITING_APPROVAL, COMPENSATING, COMPLETED) | M3 | ORIGINAL_REQUEST §R3 |
| 12 | Human-in-the-Loop (HITL) Gates | Pausing high-risk mutations until explicit human approval signal | M3 | ORIGINAL_REQUEST §R3 |
| 13 | Reverse Rollback Compensation | LIFO step rollback compensation preventing orphaned records | M3 | ORIGINAL_REQUEST §R3 |
| 14 | Cryptographic SHA-256 Evidence Ledger | Block hash chaining to genesis and tamper-evident integrity verification | M3 | ORIGINAL_REQUEST §R3 |
| 15 | Dense & Sparse Hybrid RAG Retrieval | Cosine similarity vector search and multi-stage ingestion pipeline | M4 | ORIGINAL_REQUEST §R4 |
| 16 | Tenant Isolation & ACL Role Filtering | Strict tenant boundaries, classification validation, and role-based chunk access | M4 | ORIGINAL_REQUEST §R4 |
| 17 | Citation Provenance & Groundedness | Citation metadata schemas, context quality scoring, and groundedness evaluation | M4 | ORIGINAL_REQUEST §R4 |
| 18 | Prompt Injection Sanitization | Input scanning regex, redaction, and auto-containment of compromised contexts | M4 | ORIGINAL_REQUEST §R4 |
| 19 | Glassmorphic Web Control Plane | High-performance responsive UI (`public/index.html`) with glassmorphism aesthetics | M5 | ORIGINAL_REQUEST §R5 |
| 20 | Interactive Workflow Studio | Visual step execution terminal with triggerable workflow and compensation rollback | M5 | ORIGINAL_REQUEST §R5 |
| 21 | Pipeline Kanban & Mitigation UI | 4-stage Kanban, forecast metrics cards, and deal mitigation actions | M5 | ORIGINAL_REQUEST §R5 |
| 22 | 5 Live RevOps Demonstration Scenarios | End-to-end executable scenarios with step timelines and SHA-256 evidence blocks | M5 | ORIGINAL_REQUEST §R5 |
| 23 | 38 Agents Interactive Roster | Searchable/filterable catalog with risk tiers, tools, and model router metadata | M5 | ORIGINAL_REQUEST §R5 |
| 24 | Automated Monorepo Vitest Test Suites | 100% test pass rate across 167 suites and 475+ tests | M5 | ORIGINAL_REQUEST §Verification |
| 25 | Zero TypeScript Compilation Errors | Clean compilation across `tsconfig.base.json` and all workspace packages | M5 | ORIGINAL_REQUEST §Verification |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Autonomous Multi-Agent Runtime & Registry | R1: 38 Agents, T0–T5 Capabilities, Token Budgeting, Lifecycle, Recovery, Evaluation Harness | none | DONE |
| M2 | Enterprise B2B RevOps & Deal Risk Engine | R2: Pipeline Intelligence, Buying Committee, Risk Assessment (>21d, decay), Forecast Rollups | M1 | DONE |
| M3 | Durable Multi-Agent Workflows & Evidence Chain | R3: 5 Step States, HITL Gates, Reverse Compensation Rollback, SHA-256 Evidence Ledger | M1, M2 | DONE |
| M4 | Hybrid RAG & Context Engineering | R4: Dense/Sparse Retrieval, Ingestion DLP, ACL Filtering, Citation Provenance, Prompt Sanitizer | M1 | DONE |
| M5 | Web Control Plane & Production Verification | R5 & Verification: Glassmorphism UI, Studio, Kanban, 5 Scenarios, 38 Roster, 475+ Tests Pass, 0 TS Errors | M1, M2, M3, M4 | DONE |

## Interface Contracts
### `packages/kernel` ↔ `packages/agent-runtime`
- `CapabilityBroker.verifyCapability(token: CapabilityToken, requiredTier: RiskTier): boolean`
- `AgentExecutor.executeAgent(agentId: string, input: AgentTaskInput): Promise<AgentTaskResult>`

### `packages/kernel` ↔ `packages/security`
- `EvidenceLedger.appendRecord(record: EvidenceRecordInput): Promise<EvidenceBlock>`
- `EvidenceLedger.verifyChainIntegrity(): boolean`

### `services/revops` ↔ `services/workflows`
- `RevOpsService.assessDealRisk(deal: DealContext): DealRiskAssessment`
- `WorkflowService.executeWorkflow(workflowId: string, initialContext: Record<string, unknown>): Promise<WorkflowExecutionResult>`
- `WorkflowService.sendSignal(executionId: string, signal: WorkflowSignal): Promise<void>`

### `packages/ai-sdk` ↔ `packages/agent-runtime`
- `VectorRetrievalEngine.queryVectorIndex(query: VectorQuery, tenancy: TenancyContext): Promise<RetrievalResult[]>`
- `PromptSanitizer.scanInput(input: string): SanitizationResult`

## Code Layout
- `packages/contracts/`: TypeScript Zod and interface definitions (`crm.schema.ts`, `revops.schema.ts`, `knowledge.schema.ts`, `agent.schema.ts`, `workflow.schema.ts`).
- `packages/kernel/`: Core execution primitives (`capability.ts`, `workflow.ts`, `context-safety.ts`, `tenancy.ts`).
- `packages/agent-runtime/`: Agent definitions, lifecycle, execution, and evaluation (`roster.ts`, `executor.ts`, `lifecycle.ts`, `recovery.ts`, `harness.ts`, `canary.ts`, `workflows.ts`, `scenarios.ts`).
- `packages/ai-sdk/`: Gateway, cost tracking, router, and RAG retrieval (`gateway/router.ts`, `gateway/cost.ts`, `rag/retrieval.ts`, `rag/pipeline.ts`).
- `packages/security/`: Security sanitizer and evidence ledger (`sanitizer.ts`, `evidence.ts`).
- `packages/mcp-gateway/`: Model Context Protocol tool registry (`registry.ts`).
- `services/revops/`: RevOps domain business service (`src/index.ts`).
- `services/workflows/`: Durable workflow orchestration service (`src/index.ts`).
- `domains/`: Domain packages for pipeline intelligence, deal risk, compliance, revenue analytics.
- `public/index.html`: Responsive glassmorphism web control plane surface.
- `vitest.config.ts` & `tsconfig.base.json`: Monorepo test runner and TypeScript configuration.
