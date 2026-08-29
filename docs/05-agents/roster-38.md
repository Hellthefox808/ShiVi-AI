# 38 Core Specialized Agents Roster
## Canonical Agent Specifications

ShiVi defines 38 domain-specialized agents with distinct evaluation targets, risk tiers, allowed tools, and memory scopes.

---

### Category Breakdown

#### 1. GTM & Revenue Operations (15 Agents)
1. **`orchestrator-agent`** (T2): Decomposes high-level goals into multi-turn agent execution graphs.
2. **`executive-intelligence-agent`** (T1): Solves macro revenue anomalies (*"Why is forecast down?"*).
3. **`research-agent`** (T1): SEC filings and market account intelligence gathering.
4. **`account-intelligence-agent`** (T1): Synthesizes 360-degree account profiles.
5. **`icp-agent`** (T1): Dynamic scoring of accounts against ICP rubrics.
6. **`enrichment-agent`** (T1): Verifies email, tech stack, and executive hierarchy.
7. **`lead-qualification-agent`** (T1): Applies MEDDPICC and BANT frameworks.
8. **`lead-routing-agent`** (T2): Rep territory and capacity routing.
9. **`sdr-agent`** (T2): Autonomous prospecting and cadence scheduling.
10. **`outreach-agent`** (T2): Context-aware hyper-personalized messaging.
11. **`meeting-intelligence-agent`** (T1): Parses recordings, sentiment, and action items.
12. **`buying-committee-agent`** (T2): Maps Champion, Economic Buyer, Evaluator, Blocker.
13. **`deal-strategy-agent`** (T2): Generates competitive battlecards and next-best actions.
14. **`deal-risk-agent`** (T2): Detects stalled stages (>21d) and communication gaps (>14d).
15. **`pipeline-intelligence-agent`** (T1): Funnel conversion rates and pipeline velocity.

#### 2. Revenue Forecasting & Customer Lifecycle (9 Agents)
16. **`forecast-agent`** (T2): Probabilistic weighted ARR and scenario rollups.
17. **`territory-agent`** (T2): Territory balance and quota planning.
18. **`renewal-agent`** (T2): 90/60/30-day renewal timeline countdown.
19. **`expansion-agent`** (T2): Upsell and seat consumption surge detection.
20. **`customer-health-agent`** (T1): 0–100 unified customer health scoring.
21. **`customer-success-agent`** (T2): QBR generation and CSM playbooks.
22. **`onboarding-agent`** (T1): Time-to-value milestone tracking.
23. **`support-intelligence-agent`** (T1): Support ticket clustering and SLA breach detection.
24. **`crm-hygiene-agent`** (T3): Deduplication and merge proposal generator.

#### 3. Platform, Governance & Assurance (14 Agents)
25. **`data-quality-agent`** (T2): Schema drift and foreign key anomaly detector.
26. **`knowledge-agent`** (T1): Enterprise document parsing and entity extraction.
27. **`rag-agent`** (T1): Dense vector + sparse hybrid rerank search.
28. **`retrieval-judge`** (T1): Factual grounding and citation verifier.
29. **`policy-agent`** (T3): Capability token and HITL gatekeeper.
30. **`security-agent`** (T4): Prompt shield and jailbreak detector.
31. **`compliance-agent`** (T3): SOC2/GDPR/EU AI Act audit verifier.
32. **`tool-reliability-agent`** (T2): MCP tool circuit breaker monitor.
33. **`cost-optimization-agent`** (T2): FinOps token burn and budget controller.
34. **`experiment-agent`** (T1): A/B prompt and model experiment evaluator.
35. **`evaluation-agent`** (T2): Golden benchmark trajectory evaluator.
36. **`harness-judge`** (T3): Canary and production promotion gatekeeper.
37. **`executive-reporting-agent`** (T1): Monthly revenue attribution reports.
38. **`workflow-recovery-agent`** (T3): Self-healing and compensation rollback orchestrator.
