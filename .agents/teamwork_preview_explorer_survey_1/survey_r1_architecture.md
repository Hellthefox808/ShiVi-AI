# ShiVi X100+ Architecture and Requirement R1 Runtime Survey Report

**Date**: 2026-08-28
**Surveyor**: Teamwork Explorer (Survey Explorer 1)
**Target Root**: c:/Users/ravir/Desktop/PROJECT/Project/ShiVi
**Primary Focus**: Monorepo Topology, Domain Subsystems, and Requirement R1 (Autonomous Multi-Agent Runtime & Registry)

---

## 1. Executive Summary

ShiVi is a zero-trust, AI-native B2B Revenue Operations Operating System and control plane orchestrating **38 specialized autonomous agents**, hybrid RAG knowledge graphs, deterministic multi-agent state machines, and cryptographic SHA-256 evidence ledgers.

The repository follows a high-density, highly modular pnpm monorepo structure:
- **12 Core Packages** in packages/ (kernel, agent-runtime, ai-sdk, security, mcp-gateway, ui, contracts, database, telemetry, resilience, chaos-redteam, dev-platform)
- **27 Backend Microservices** in services/ (revops, gtm, agents, workflows, rag, crm, sales, marketing, customer-success, finance, billing, procurement, support, search, analytics, observability, audit, notifications, itops, identity, tenancy, authorization, policy, memory, tools, mcp, a2a)
- **100 Domain Subsystems** in domains/ (numbered packages from 01-gtm-os through 100-platform-health)
- **6 Background Workers** in workers/ (agent-worker, event-worker, scheduled-worker, ingestion-worker, analytics-worker, notification-worker)
- **3 Core Backend Applications** in apps/ (kernel-api, command-center, bff)
- **6 Frontend Applications** in frontend/apps/ (web, admin, ai-studio, analytics, developer-portal, marketplace)
- **12 Frontend Shared Packages** in frontend/packages/ (agent-ui, design-system, charts, tables, state, feature-flags, telemetry-client, auth-client, api-client, icons, validation, ui)

**Verification Status**: All **475 automated tests** across **167 test files** pass with 100 percent pass rate via Vitest in 10.70 seconds.

---

## 2. Monorepo Configuration and Workspace Topology

### 2.1 Workspace Configuration (pnpm-workspace.yaml)
The monorepo registers package globs encompassing all tiers of the application:
`yaml
packages:
  - 'frontend/apps/*'
  - 'frontend/packages/*'
  - 'backend/apps/*'
  - 'backend/services/*'
  - 'contracts/*'
  - 'packages/*'
  - 'apps/*'
  - 'domains/*'
  - 'services/*'
  - 'workers/*'
`

### 2.2 Global Module Resolution and Path Aliases (vitest.config.ts)
Vitest and TypeScript path aliases map package names to source entrypoints:
- @shivi/kernel -> ./packages/kernel/src/index.ts
- @shivi/agent-runtime -> ./packages/agent-runtime/src/index.ts
- @shivi/ai-sdk -> ./packages/ai-sdk/src/index.ts
- @shivi/security -> ./packages/security/src/index.ts
- @shivi/mcp-gateway -> ./packages/mcp-gateway/src/index.ts
- @shivi/ui -> ./packages/ui/src/index.ts
- @shivi/contracts -> ./packages/contracts/src/index.ts
- Aliases are provided for all 27 microservices (@shivi/service-*), 6 background workers (@shivi/worker-*), 6 frontend apps (@shivi/app-*), and 12 frontend packages (@shivi/*).

---

## 3. Requirement R1: Autonomous Multi-Agent Runtime & Registry

Requirement R1 mandates:
Execution, lifecycle management, capability scoping T0-T5 risk tiers, token budgeting, and recovery strategies for the 38 specialized revenue agents across GTM, RevOps, Governance, Harness, and Operations.

### 3.1 38 Specialized Core Agents Catalog (packages/agent-runtime/src/roster.ts)

The complete roster of 38 specialized agents is defined in SHIVI_38_CORE_AGENTS managed by AgentRosterManager:

| # | Agent ID | Agent Name | Category | Risk Tier | Memory Scope | Default Model | Timeout | Eval Thresh | Approval Req | Allowed Tool Capabilities |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | orchestrator-agent | Master Orchestrator Agent | OPS | T2 | ORGANIZATION | gemini-1.5-pro | 60s | 90% | No | dispatch_subagent, read_memory, write_memory, audit_log |
| 2 | executive-intelligence-agent | Executive Intelligence Agent | GTM | T1 | ORGANIZATION | gemini-1.5-pro | 30s | 92% | No | query_forecast, query_pipeline, synthesize_brief |
| 3 | research-agent | Market & Account Research Agent | GTM | T1 | ACCOUNT | claude-3-5-sonnet | 45s | 88% | No | web_search, read_url, extract_sec_filing |
| 4 | account-intelligence-agent | Account 360 Intelligence Agent | GTM | T1 | ACCOUNT | gemini-1.5-pro | 30s | 90% | No | read_crm_account, read_telemetry, read_tickets |
| 5 | icp-agent | Ideal Customer Profile (ICP) Agent | GTM | T1 | ORGANIZATION | gemini-1.5-flash | 15s | 85% | No | evaluate_icp_score, read_rubric |
| 6 | enrichment-agent | Data Enrichment Agent | GTM | T1 | TASK | gemini-1.5-flash | 20s | 88% | No | enrich_contact, enrich_company, verify_email |
| 7 | lead-qualification-agent | Lead Qualification Agent | GTM | T1 | ACCOUNT | claude-3-5-sonnet | 25s | 90% | No | score_meddpicc, score_bant, update_lead_qualification |
| 8 | lead-routing-agent | Lead Routing Agent | GTM | T2 | ORGANIZATION | gemini-1.5-flash | 15s | 95% | No | lookup_territory, check_rep_capacity, assign_lead |
| 9 | sdr-agent | Autonomous SDR Agent | GTM | T2 | ACCOUNT | gemini-1.5-pro | 30s | 88% | No | create_outreach_campaign, schedule_sequence, search_leads |
| 10 | outreach-agent | Personalized Outreach Agent | GTM | T2 | TASK | claude-3-5-sonnet | 20s | 90% | No | draft_email, generate_social_dm |
| 11 | meeting-intelligence-agent | Meeting Intelligence Agent | GTM | T1 | ACCOUNT | gemini-1.5-pro | 45s | 92% | No | transcribe_audio, extract_action_items, analyze_sentiment |
| 12 | buying-committee-agent | Buying Committee Mapping Agent | REVOPS | T2 | ACCOUNT | gemini-1.5-pro | 30s | 94% | No | map_stakeholder_graph, detect_missing_buyer, read_crm_contacts |
| 13 | deal-strategy-agent | Deal Strategy & Positioning Agent | REVOPS | T2 | ACCOUNT | claude-3-5-sonnet | 35s | 90% | No | query_battlecard, recommend_concession, generate_proposal |
| 14 | deal-risk-agent | Deal Risk & Slippage Agent | REVOPS | T2 | ACCOUNT | gemini-1.5-pro | 25s | 95% | No | calculate_deal_velocity, detect_stalled_stage, alert_deal_risk |
| 15 | pipeline-intelligence-agent | Pipeline Intelligence Agent | REVOPS | T1 | ORGANIZATION | gemini-1.5-pro | 30s | 90% | No | compute_pipeline_coverage, analyze_conversion_rates |
| 16 | forecast-agent | Revenue Forecasting Agent | REVOPS | T2 | ORGANIZATION | gemini-1.5-pro | 30s | 95% | No | calculate_weighted_forecast, generate_forecast_snapshot |
| 17 | territory-agent | Territory & Quota Planning Agent | REVOPS | T2 | ORGANIZATION | gemini-1.5-flash | 25s | 88% | No | model_territory_split, calculate_quota_attainment |
| 18 | renewal-agent | Contract Renewal Agent | REVOPS | T2 | ACCOUNT | claude-3-5-sonnet | 25s | 92% | No | track_renewal_timeline, draft_renewal_proposal |
| 19 | expansion-agent | Account Expansion & Upsell Agent | REVOPS | T2 | ACCOUNT | gemini-1.5-pro | 25s | 90% | No | detect_expansion_signal, recommend_upsell_package |
| 20 | customer-health-agent | Customer Health Scoring Agent | REVOPS | T1 | ACCOUNT | gemini-1.5-flash | 20s | 90% | No | compute_health_score, detect_churn_risk |
| 21 | customer-success-agent | Customer Success Copilot | OPS | T2 | ACCOUNT | claude-3-5-sonnet | 30s | 90% | No | generate_qbr_deck, schedule_csm_touchpoint |
| 22 | onboarding-agent | Customer Onboarding Agent | OPS | T1 | ACCOUNT | gemini-1.5-flash | 20s | 88% | No | track_onboarding_milestones, alert_stalled_setup |
| 23 | support-intelligence-agent | Support Intelligence Agent | OPS | T1 | ACCOUNT | gemini-1.5-flash | 20s | 90% | No | cluster_tickets, detect_sla_breach |
| 24 | crm-hygiene-agent | CRM Data Hygiene Agent | OPS | T3 | ORGANIZATION | claude-3-5-sonnet | 40s | 96% | Yes | detect_duplicates, propose_crm_merge, execute_crm_merge |
| 25 | data-quality-agent | Data Quality & Drift Agent | OPS | T2 | ORGANIZATION | gemini-1.5-flash | 25s | 92% | No | check_schema_anomalies, validate_crm_invariants |
| 26 | knowledge-agent | Enterprise Knowledge Agent | KNOWLEDGE | T1 | ORGANIZATION | gemini-1.5-pro | 45s | 90% | No | parse_document, extract_entities, index_chunks |
| 27 | rag-agent | Hybrid RAG Retrieval Agent | KNOWLEDGE | T1 | TASK | gemini-1.5-pro | 20s | 94% | No | hybrid_vector_search, rerank_passages, pack_context |
| 28 | retrieval-judge | Retrieval Groundedness Judge | KNOWLEDGE | T1 | TASK | claude-3-5-sonnet | 25s | 95% | No | verify_citations, score_groundedness |
| 29 | policy-agent | Policy & Governance Agent | GOVERNANCE | T3 | ORGANIZATION | claude-3-5-sonnet | 15s | 98% | Yes | evaluate_capability_gate, enforce_hitl_approval |
| 30 | security-agent | AI Security & Prompt Shield Agent | GOVERNANCE | T4 | ORGANIZATION | gemini-1.5-flash | 10s | 99% | No | scan_adversarial_threats, quarantine_agent |
| 31 | compliance-agent | Compliance & Audit Agent | GOVERNANCE | T3 | ORGANIZATION | claude-3-5-sonnet | 30s | 98% | Yes | verify_evidence_chain, export_audit_bundle |
| 32 | tool-reliability-agent | MCP Tool Reliability Agent | OPS | T2 | ORGANIZATION | gemini-1.5-flash | 15s | 92% | No | probe_mcp_health, trip_tool_circuit_breaker |
| 33 | cost-optimization-agent | FinOps Cost Optimization Agent | GOVERNANCE | T2 | ORGANIZATION | gemini-1.5-flash | 15s | 94% | No | check_token_budgets, recommend_model_switch |
| 34 | experiment-agent | Prompt & Model Experiment Agent | HARNESS | T1 | ORGANIZATION | gemini-1.5-pro | 60s | 90% | No | run_ab_experiment, calculate_statistical_significance |
| 35 | evaluation-agent | Agent Trajectory Evaluation Agent | HARNESS | T2 | ORGANIZATION | claude-3-5-sonnet | 45s | 95% | No | execute_benchmark_suite, score_trajectory |
| 36 | harness-judge | Harness Promotion Judge | HARNESS | T3 | ORGANIZATION | claude-3-5-sonnet | 30s | 98% | Yes | evaluate_promotion_criteria, promote_agent_version |
| 37 | executive-reporting-agent | Executive Reporting Agent | GTM | T1 | ORGANIZATION | gemini-1.5-pro | 40s | 92% | No | compile_revenue_report, export_pdf_briefing |
| 38 | workflow-recovery-agent | Workflow Self-Healing & Recovery Agent | OPS | T3 | ORGANIZATION | claude-3-5-sonnet | 30s | 96% | Yes | replay_workflow_step, execute_compensation_rollback |

---

### 3.2 Capability Scoping & T0-T5 Risk Governance (packages/kernel/src/capability.ts)

- **T0-T5 Risk Hierarchy**:
  - T0 (No Risk): Public read-only inspection, file listing, plan formation.
  - T1 (Low Risk): Confidential internal reads (CRM read, RAG retrieval, vector search).
  - T2 (Moderate Risk): Non-destructive state mutation (drafting outreach, updating scores, routing leads).
  - T3 (High Risk): Destructive or high-impact state mutation (CRM stage mutation, duplicate merges, policy updates). Requires mandatory Human-in-the-Loop (HITL) approval.
  - T4 (Critical Risk): Security posture alteration, model quarantine override. Requires multi-signature approval.
  - T5 (Catastrophic Risk): Tenant partition destruction, cryptographic root key rotation. Requires quorum authorization.
- **Capability Tokens**: Issued by CapabilityBroker.issueToken with TTL seconds, delegation chains, operation scope matching, and instant revocation capability (revokeToken).
- **Delegation Depth Checks**: Recursively verified via CapabilityBroker.delegateToken to prevent unconstrained subagent privilege escalation.

---

### 3.3 Token Budgeting & FinOps Cost Engine (packages/ai-sdk/src/gateway/cost.ts)

- **Multi-Model Cost Catalog**:
  - gemini-1.5-pro: .00125 / 1k input tokens, .005 / 1k output tokens
  - gemini-1.5-flash: .000075 / 1k input tokens, .0003 / 1k output tokens
  - claude-3-5-sonnet: .003 / 1k input tokens, .015 / 1k output tokens
  - gpt-4o: .0025 / 1k input tokens, .01 / 1k output tokens
  - ollama-llama3: .00 (local deployment)
- **Tenant-Level Budgets**: ModelCostTracker.setTenantBudget enforces monthly spend caps. Any request attempting to exceed the limit throws a budget violation error.
- **Task Cost Ceilings**: AgentExecutor.executeTask continuously accumulates cost during trajectory execution. If maxCostUSD is exceeded, execution terminates with ABORTED_COST_EXCEEDED and commits an evidence record.

---

### 3.4 Model Routing & Fallback Gateway (packages/ai-sdk/src/gateway/router.ts)

- **Adaptive Task Routing**:
  - SIMPLE: Routes to gemini-1.5-flash (fallback: gpt-4o) for sub-second latency and minimal cost.
  - MEDIUM: Routes to claude-3-5-sonnet (fallback: gemini-1.5-pro) for high-precision qualification and positioning.
  - COMPLEX: Routes to gemini-1.5-pro (fallback: gpt-4o) for 1M+ token context window and multi-turn planning.
  - privacyRestricted: Routes strictly to local ollama-llama3 with gemini-1.5-flash private VPC fallback.
- **Failover Execution**: ModelRouter.executeWithFallback catches model API timeouts/errors and switches to secondary models without breaking workflow execution.

---

### 3.5 Agent Lifecycle State Machine (packages/agent-runtime/src/lifecycle.ts)

The lifecycle defines 10 discrete states:
1. DRAFT: Newly registered agent specification.
2. EVALUATING: Running automated benchmark test suites.
3. SECURITY_REVIEW: Undergoing adversarial prompt injection screening.
4. STAGING: Staged in pre-production environment.
5. CANARY: Deployed to 5-10% traffic with trajectory replay monitoring.
6. ACTIVE: General production execution.
7. DEGRADED: Operating under constrained capability due to tool/memory failure.
8. QUARANTINED: Isolated due to detected adversarial prompt injection or safety breach.
9. REVOKED: Cryptographic capability revoked.
10. RETIRED: Decommissioned.

---

### 3.6 Recovery Strategies Engine (packages/agent-runtime/src/recovery.ts)

Implements the 6-stage lifecycle: **Prevention -> Detection -> Containment -> Recovery -> Evidence -> Verification**.
- **Supported Triggers**:
  - GOAL_DRIFT: Agent deviating from assigned objective.
  - REASONING_LOOP: Agent caught in cyclic tool invocations (detected at >= 3 identical calls).
  - MEMORY_POISONING: Corrupted working context or injected malicious payloads.
  - CONTEXT_ROT: Stale context degrading decision quality.
  - COST_EXPLOSION: Runaway token burn.
  - SECURITY_BREACH: Prompt injection detected by PromptSanitizer.
- **Recovery Actions**:
  - Automatic containment to QUARANTINED or DEGRADED.
  - Selective working memory purge via AgentMemoryEngine.clearWorkingMemory.
  - Checkpoint restoration from persistent state.
  - Mandatory SHA-256 evidence record logging to EvidenceLedger.

---

### 3.7 Agent Evaluation Harness & Canary Replay (packages/agent-runtime/src/harness.ts, canary.ts)

- **Evaluation Harness**:
  - Benchmarks: Golden standard task completion, Adversarial prompt injection defense, Tool failure resilience, Policy gate regression tests.
  - Strict Target Metrics: Task Success Rate (98.5%), Groundedness (96.0%), Citation Accuracy (99.2%), Tool Success (97.4%), Policy Compliance (100.0%), Hallucination Rate (<0.8%), Average Latency (340ms).
  - Automated Promotion: AgentEvaluationHarness.promoteAgent transitions passing agents (score >= evaluationThreshold) to CANARY or ACTIVE.
- **Canary Replay Engine**:
  - Replays golden trajectories step-by-step.
  - Requires >= 90% replay accuracy score to achieve automated promotion to ACTIVE.

---

### 3.8 MCP Gateway & Tool Scopes (packages/mcp-gateway/src/registry.ts)

The MCP Tool Registry exposes typed tool definitions with strict T0-T5 risk classifications:
- T0 Tools: nex_list_files_code, nex_read_file_code, plan_mode_response, ask_followup_question
- T1 Tools: call_tool, read_crm_account, update_lead_qualification, hybrid_vector_search, verify_citations, score_groundedness
- T2 Tools: nex_create_file_code, nex_replace_lines_code, batch_tool, calculate_deal_velocity, map_stakeholder_graph
- T3 Tools: evaluate_capability_gate, enforce_hitl_approval, replay_workflow_step, execute_compensation_rollback

---

## 4. Multi-Agent Workflows & Demonstration Scenarios

### 4.1 Durable Multi-Agent Workflows (packages/agent-runtime/src/workflows.ts)
- **Workflow State Machine**: IDLE -> RUNNING -> WAITING_APPROVAL -> PAUSED -> COMPENSATING -> COMPLETED / FAILED.
- **Three Standard Graphs**:
  1. wf_inbound_lead_qualification: 4 steps (Enrichment -> ICP Score -> Territory Routing -> Outreach Draft).
  2. wf_stalled_deal_recovery: 6 steps (Deal Risk Detection -> RAG Meeting Transcripts -> Buying Committee Org Chart -> Deal Strategy -> Policy T3 Gate -> CRM Forecast Mutation).
  3. wf_renewal_churn_mitigation: 2 steps (Customer Health Telemetry -> Emergency QBR Escalation).

### 4.2 Five Live RevOps Demonstration Scenarios (packages/agent-runtime/src/scenarios.ts)
1. **Scenario 1: Stalled  Opportunity Recovery**: Identifies 34 days in Proposal stage, uncovers missing Economic Buyer (Sarah Chen, VP Infra), crafts executive briefing with SOC2 report, enforces T3 HITL approval, and adds  to committed forecast.
2. **Scenario 2: Inbound Enterprise Lead Qualification**: Enriches Vertex Labs ( ARR), evaluates ICP fit, routes to Strategic AE in <1hr SLA.
3. **Scenario 3: Renewal & Churn Risk Mitigation**: Detects 35% product usage drop and 2 Sev-1 tickets on  contract, initiates CSM intervention playbook.
4. **Scenario 4: CRM Data Hygiene & Merge**: Scans CRM for duplicate accounts, merges duplicate records, commits SHA-256 evidence entry.
5. **Scenario 5: Executive Forecast Rollup**: Rollup analysis across 4 stages (.14M total pipeline, .498M weighted ARR, .54M committed forecast).

---

## 5. Verification & Test Suite Summary

- **Test Runner**: Vitest v2.0.5
- **Total Test Files**: 167 passed (167)
- **Total Tests**: 475 passed (475)
- **Execution Duration**: 10.70 seconds
- **Compilation**: Clean TypeScript compilation across all packages without type errors.

---

## 6. Recommendations & Cross-Requirement Integration Plan

1. **R2 RevOps Engine**: Connect services/revops directly with AgentRosterManager.getAgent('deal-risk-agent') and forecast-agent to feed live pipeline metrics into the Kanban board.
2. **R3 Workflow Orchestration**: Integrate the durable state transitions of MultiAgentWorkflowEngine with the frontend Workflow Studio for visual node graph execution.
3. **R4 Hybrid RAG**: Verify that packages/ai-sdk/src/rag and services/rag enforce tenant-level vector ACL filtering against TenancyContext.
4. **R5 Control Plane UI**: Bind ShiViDesignTokens (packages/ui/src/tokens.ts) and @shivi/agent-ui 18 AI components in frontend/apps/web to render the interactive 38-agent roster and workflow live-monitor.
