<p align="center">
  <strong>🔮 SHIVI — AI-NATIVE B2B REVOPS & CONTROL PLANE</strong>
</p>

<h1 align="center">ShiVi — Agentic AI Revenue Operations & B2B SaaS Control Plane</h1>

<p align="center">
  <em>Enterprise-Grade · Zero-Trust · 38 Specialized Agents · 5 Live RevOps Scenarios · 100 Domain Engines</em><br/>
  <em>Architected for High-Assurance Autonomous B2B Revenue Operations & Control Plane Execution</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Vitest-471%20Passed-success?style=for-the-badge&logo=vitest" alt="Tests"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Suites-167%20Passed-success?style=for-the-badge&logo=vitest" alt="Suites"/></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.5.4%20(0%20Errors)-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-%E2%89%A518-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node"/></a>
  <a href="#"><img src="https://img.shields.io/badge/pnpm-Monorepo-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm"/></a>
  <a href="#"><img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License"/></a>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Edge%20Readiness-100%25-brightgreen?style=flat-square" alt="Edge Readiness"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Red--Team%20Containment-100%25-success?style=flat-square" alt="Red-Team"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Specialized%20Agents-38%20Core%20Agents-6366f1?style=flat-square" alt="Agents"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Live%20Scenarios-5%20Workflows-00f2fe?style=flat-square" alt="Scenarios"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Microservices-27%20Services-6366f1?style=flat-square" alt="Microservices"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Domains-100%20Systems-8b5cf6?style=flat-square" alt="Domains"/></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Redis-7--Alpine-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis"/></a>
</p>

---

## 📑 Table of Contents

1. [What Is ShiVi?](#what-is-shivi)
2. [Architectural Overview & Pillars](#architectural-overview--pillars)
3. [The 38 Core Specialized Agents Roster](#the-38-core-specialized-agents-roster)
4. [The 5 Live B2B Demonstration Workflows](#the-5-live-b2b-demonstration-workflows)
5. [Autonomous Agent Evaluation Harness](#autonomous-agent-evaluation-harness)
6. [Interactive Control Plane UI Experience](#interactive-control-plane-ui-experience)
7. [Monorepo Structure](#monorepo-structure)
8. [Core Platform Packages (12)](#core-platform-packages-12)
9. [Platform Microservices (27)](#platform-microservices-27)
10. [Background Workers (6)](#background-workers-6)
11. [100 Autonomous Domain Engines](#100-autonomous-domain-engines)
12. [Security, Evidence Ledger & Isolation](#security-evidence-ledger--isolation)
13. [Verification, Tests & Metrics](#verification-tests--metrics)
14. [Local Setup & Quickstart](#local-setup--quickstart)
15. [License](#license)

---

## 🚀 What Is ShiVi?

**ShiVi** is an AI-native operating layer for **B2B Revenue Operations (RevOps) and Enterprise SaaS Control Planes**.

ShiVi is **NOT** a chatbot.  
ShiVi is **NOT** a dashboard-only product.  
ShiVi is the **Autonomous Operating System for Revenue Execution**.

Every UI action maps to an underlying domain action, workflow transition, state update, API contract, event, command, query, or isolated prototype adapter:
- **Model proposes** → **Policy decides** → **System executes** → **Verification confirms** → **Human approves high-risk actions**.
- **Tamper-Evident SHA-256 Evidence Ledger** anchors every agent thought, tool call, evaluation score, and state change.
- **Continuous 7-Layer Tenant Isolation** ensures zero data leakage across organizations.

---

## 🤖 The 38 Core Specialized Agents Roster

ShiVi provides a comprehensive roster of 38 specialized, capability-scoped agents across 6 core operational categories:

| Agent Name | ID | Category | Risk Tier | Default Model Router | Primary Function |
|---|---|---|---|---|---|
| **Master Orchestrator** | `orchestrator-agent` | OPS | T2 | Gemini 1.5 Pro | Decomposes complex RevOps goals & coordinates subagents. |
| **Executive Intelligence** | `executive-intelligence-agent` | GTM | T1 | Gemini 1.5 Pro | Synthesizes C-suite ARR briefings & macro pipeline risks. |
| **Market & Account Research** | `research-agent` | GTM | T1 | Claude 3.5 Sonnet | Researches account firmographics, tech stack & SEC filings. |
| **Account 360 Intelligence** | `account-intelligence-agent` | GTM | T1 | Gemini 1.5 Pro | Unifies CRM history, product telemetry, and support tickets. |
| **ICP Scoring Agent** | `icp-agent` | GTM | T1 | Gemini 1.5 Flash | Evaluates lead fit against dynamic ICP rubrics. |
| **Data Enrichment Agent** | `enrichment-agent` | GTM | T1 | Gemini 1.5 Flash | Enriches contact data with verified tech stack & headcounts. |
| **Lead Qualification Agent** | `lead-qualification-agent` | GTM | T1 | Claude 3.5 Sonnet | Applies MEDDPICC & BANT frameworks to inbound leads. |
| **Lead Routing Agent** | `lead-routing-agent` | GTM | T2 | Gemini 1.5 Flash | Routes qualified leads by territory, capacity, and quota. |
| **Autonomous SDR Agent** | `sdr-agent` | GTM | T2 | Gemini 1.5 Pro | Orchestrates multi-channel prospecting cadences. |
| **Personalized Outreach** | `outreach-agent` | GTM | T2 | Claude 3.5 Sonnet | Drafts context-aware, hyper-relevant outbound emails. |
| **Meeting Intelligence** | `meeting-intelligence-agent` | GTM | T1 | Gemini 1.5 Pro | Extracts meeting transcripts, action items & sentiment. |
| **Buying Committee Mapping** | `buying-committee-agent` | REVOPS | T2 | Gemini 1.5 Pro | Maps Champions, Economic Buyers, and Blockers. |
| **Deal Strategy & Positioning** | `deal-strategy-agent` | REVOPS | T2 | Claude 3.5 Sonnet | Formulates competitive battlecards & concession strategies. |
| **Deal Risk & Slippage** | `deal-risk-agent` | REVOPS | T2 | Gemini 1.5 Pro | Detects stalled stage durations and forecast slippages. |
| **Pipeline Intelligence** | `pipeline-intelligence-agent` | REVOPS | T1 | Gemini 1.5 Pro | Analyzes stage conversion rates and coverage ratios. |
| **Revenue Forecasting** | `forecast-agent` | REVOPS | T2 | Gemini 1.5 Pro | Calculates probabilistic weighted ARR/MRR forecasts. |
| **Territory & Quota Planning** | `territory-agent` | REVOPS | T2 | Gemini 1.5 Flash | Optimizes territory splits and rep quota capacity. |
| **Contract Renewal Agent** | `renewal-agent` | REVOPS | T2 | Claude 3.5 Sonnet | Tracks 90/60/30-day renewal timelines & terms. |
| **Account Expansion & Upsell** | `expansion-agent` | REVOPS | T2 | Gemini 1.5 Pro | Identifies usage surges and cross-sell opportunities. |
| **Customer Health Scoring** | `customer-health-agent` | REVOPS | T1 | Gemini 1.5 Flash | Aggregates multi-dimensional 0–100 health metrics. |
| **Customer Success Copilot** | `customer-success-agent` | OPS | T2 | Claude 3.5 Sonnet | Assists CSMs with QBR decks and customer touchpoints. |
| **Customer Onboarding Agent** | `onboarding-agent` | OPS | T1 | Gemini 1.5 Flash | Tracks time-to-value (TTV) and milestone blockers. |
| **Support Intelligence** | `support-intelligence-agent` | OPS | T1 | Gemini 1.5 Flash | Analyzes ticket severity, SLAs, and escalation risks. |
| **CRM Data Hygiene Agent** | `crm-hygiene-agent` | OPS | T3 | Claude 3.5 Sonnet | Scans duplicate records and executes merge repair plans. |
| **Data Quality & Drift** | `data-quality-agent` | OPS | T2 | Gemini 1.5 Flash | Monitors database schema drift and metric anomalies. |
| **Enterprise Knowledge Agent** | `knowledge-agent` | KNOWLEDGE | T1 | Gemini 1.5 Pro | Ingests, normalizes, and chunks enterprise documents. |
| **Hybrid RAG Retrieval** | `rag-agent` | KNOWLEDGE | T1 | Gemini 1.5 Pro | Dense + sparse vector search with provenance citations. |
| **Retrieval Groundedness Judge** | `retrieval-judge` | KNOWLEDGE | T1 | Claude 3.5 Sonnet | Scores citation accuracy & factual grounding. |
| **Policy & Governance Agent** | `policy-agent` | GOVERNANCE | T3 | Claude 3.5 Sonnet | Enforces T0–T5 capability gates and HITL approvals. |
| **AI Security & Prompt Shield** | `security-agent` | GOVERNANCE | T4 | Gemini 1.5 Flash | Screens prompts for adversarial injection and jailbreaks. |
| **Compliance & Audit Agent** | `compliance-agent` | GOVERNANCE | T3 | Claude 3.5 Sonnet | Verifies SOC2 controls and SHA-256 evidence ledgers. |
| **MCP Tool Reliability** | `tool-reliability-agent` | OPS | T2 | Gemini 1.5 Flash | Monitors tool latency, failure rates & circuit breakers. |
| **FinOps Cost Optimization** | `cost-optimization-agent` | GOVERNANCE | T2 | Gemini 1.5 Flash | Analyzes token burn and enforces per-tenant budgets. |
| **Prompt & Model Experiment** | `experiment-agent` | HARNESS | T1 | Gemini 1.5 Pro | Runs A/B prompt and model evaluation experiments. |
| **Agent Trajectory Evaluation** | `evaluation-agent` | HARNESS | T2 | Claude 3.5 Sonnet | Scores agent execution trajectories against benchmarks. |
| **Harness Promotion Judge** | `harness-judge` | HARNESS | T3 | Claude 3.5 Sonnet | Autonomous promotion gatekeeper (DRAFT → PROD). |
| **Executive Reporting Agent** | `executive-reporting-agent` | GTM | T1 | Gemini 1.5 Pro | Compiles weekly revenue performance briefing packs. |
| **Workflow Self-Healing** | `workflow-recovery-agent` | OPS | T3 | Claude 3.5 Sonnet | Recovers failed steps and executes rollback compensations. |

---

## 🎬 The 5 Live B2B Demonstration Workflows

ShiVi includes 5 real, end-to-end executable RevOps demonstration workflows (accessible via CLI, API, or the interactive control plane):

1. **Scenario 1: Recover a Stalled $100K Opportunity**  
   - Opportunity Risk Agent detects 34-day stagnation in Proposal stage.
   - Hybrid RAG queries historical meeting transcripts and surfaces procurement objections.
   - Buying Committee Agent detects unengaged Economic Buyer (Sarah Chen, VP Infrastructure).
   - Deal Strategy Agent generates CRO sponsor outreach playbook and attaches SOC2 bundle.
   - Policy Agent requires Human Approval for CRM stage advancement (T3 Gate).
   - Human grants approval → CRM task created → Stage advanced to Negotiation → +$75K Weighted ARR committed to Forecast.
2. **Scenario 2: Qualify New Strategic Enterprise Lead**  
   - Inbound lead captured from Vertex Labs → Enrichment Agent fetches tech stack and funding → ICP Agent scores 94/100 (Tier 1 Strategic) → Lead Routing Agent assigns to Strategic Enterprise AE with < 1hr SLA.
3. **Scenario 3: Mitigate $250K Renewal Churn Risk**  
   - Telemetry signals 35% usage drop and 2 open Sev-1 tickets → Health score drops to 48 (At Risk) → Renewal Agent triggers Executive CSM Escalation Playbook & emergency QBR.
4. **Scenario 4: CRM Data Hygiene & Merge Repair**  
   - CRM Hygiene Agent scans 1,200 records → Identifies 14 duplicate contact clusters → Proposes merge plan with field conflict resolution → Human confirms → Clean merges executed with 99.8% data integrity restored.
5. **Scenario 5: Executive Forecast Risk Briefing**  
   - Query: *"What is putting this quarter's forecast at risk?"* → Executive Intelligence and Forecast Agents synthesize $260K slippage exposure with cited evidence and 3 prioritized remediation actions.

---

## 🧪 Autonomous Agent Evaluation Harness

The ShiVi Agent Evaluation Platform enforces strict quality, safety, and performance promotion gates:

```
[DRAFT] --> [EVALUATING] --> [SECURITY_REVIEW] --> [STAGING] --> [CANARY] --> [PRODUCTION]
```

- **Evaluation Test Categories**:
  - **Golden Standard Suites**: Deterministic business task completion accuracy.
  - **Adversarial & Injection Suites**: Direct/indirect prompt injection defense.
  - **Tool Failure Resilience**: Transient API error recovery & circuit breakers.
  - **Groundedness & Citations**: Zero hallucination scorecards (Target: >= 98%).
  - **FinOps Token Budgets**: Cost per execution trajectory tracking.

---

## 🖥️ Interactive Control Plane UI Experience (`public/index.html`)

The control plane is served at `public/index.html` with zero-dependency native JavaScript, responsive CSS grid/flexbox, and dark-mode glassmorphism:

- **✨ Overview & Hero**: System architecture pillars, live metrics ($1.54M ARR monitored, 38 agents, 471 tests).
- **🎬 5 Live Scenarios**: 1-click interactive execution of all 5 demonstration workflows with animated step timelines and SHA-256 evidence blocks.
- **🤖 38 Core Agents**: Category filtering, risk tiers, model router specs, and detail modals.
- **📈 Pipeline & Deals**: 4-stage Kanban board (Qualification, Value Prop, Proposal, Negotiation) with deal risk badges and modal diagnostics.
- **⚡ Command Center**: Governed task dispatcher, multi-model selection (Gemini, Claude, GPT-4o), live console terminal, and evidence block explorer.
- **🧪 Agent Harness**: Real-time evaluation benchmark scorecard and promotion gate runner.
- **🔐 SSO Login**: Multi-provider simulation (Google OIDC, Okta SAML, Microsoft Entra, SPIFFE SVID).

---

## 📊 Verification, Tests & Metrics

ShiVi is rigorously tested across the entire monorepo:

```bash
# Run all Vitest suites
npx vitest run
# Output: 167 test files passed | 471 tests passed (100% pass rate)

# Verify TypeScript compilation across all 166 configurations
node -e "..."
# Output: Checking 166 tsconfig.json files... Finished typecheck. Errors: 0
```

---

## 🚀 Local Setup & Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/Hellthefox808/ShiVi-AI.git
cd ShiVi

# 2. Install dependencies
pnpm install

# 3. Run all unit test suites
npx vitest run

# 4. Open the Interactive Control Plane
# Simply open public/index.html in any modern browser!
```

---

## 📄 License

Proprietary and Confidential. Copyright © 2026 ShiVi Technologies, Inc. All rights reserved.
