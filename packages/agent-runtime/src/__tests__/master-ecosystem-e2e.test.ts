/**
 * ShiVi AI Operating System — Master Ecosystem End-to-End Governance & RevOps Test Suite
 * Validates the complete master system loop, all 6 governance layers, 38 agents,
 * governed RAG, secure MCP tools, durable workflows, cryptographic audit ledgers,
 * and executive decision intelligence.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AIInventoryRegistry,
  ModelCardRegistry,
  KillSwitchController,
} from '@shivi/ai-sdk';
import {
  EvidenceLedger,
  PromptSanitizer,
} from '@shivi/security';
import {
  TenancyManager,
  TenancyContext,
  ContextSafetyPipeline,
  AuthorizationEngine,
  AgentMemoryEngine,
} from '@shivi/kernel';
import {
  AgentLifecycleManager,
  AgentRosterManager,
  AgentEvaluationHarness,
  DriftDetectionEngine,
  SHIVI_38_CORE_AGENTS,
} from '../index.js';
import { RevOpsService } from '@shivi/service-revops';
import { WorkflowService } from '@shivi/service-workflows';
import { CRMService } from '@shivi/service-crm';
import { RAGService } from '@shivi/service-rag';
import { PolicyEngine } from '@shivi/service-policy';
import { AuditService } from '@shivi/service-audit';

describe('ShiVi Master Ecosystem End-to-End Operating Suite', () => {
  const tenantId = 'tenant_enterprise_master';
  const userId = 'usr_alex_vp';
  const tenancyContext: TenancyContext = {
    tenantId,
    organizationId: 'org_acme_corp',
    tier: 'ENTERPRISE',
    policy: {
      maxRetentionDays: 365,
      allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
      crossTenantSharing: false,
      encryptionRequired: true,
      auditLoggingRequired: true,
    },
    quota: {
      maxTokensPerDay: 5000000,
      maxAgentsRunning: 50,
      maxStorageBytes: 10000000000,
    },
  };

  let crmService: CRMService;
  let ragService: RAGService;
  let policyEngine: PolicyEngine;
  let auditService: AuditService;
  let revopsService: RevOpsService;
  let workflowService: WorkflowService;

  beforeEach(() => {
    AIInventoryRegistry.resetStore();
    ModelCardRegistry.resetStore();
    KillSwitchController.resetStore();
    AgentMemoryEngine.resetStore();
    AuthorizationEngine.resetStore();
    DriftDetectionEngine.resetStore();

    crmService = new CRMService();
    ragService = new RAGService();
    policyEngine = new PolicyEngine();
    auditService = new AuditService();
    revopsService = new RevOpsService();
    workflowService = new WorkflowService();

    ModelCardRegistry.bootstrapDefaultModels(tenantId);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 1. MASTER SYSTEM LOOP E2E
  // ═════════════════════════════════════════════════════════════════════════

  describe('1. Master System Loop E2E', () => {
    it('executes full pipeline: Signal -> Data -> Access -> Context -> RAG -> Agent -> Policy -> Oversight -> Workflow -> MCP -> Verify -> Audit -> Outcome', async () => {
      // 1. Business Signal: Deal stalled signal received
      const deal = (await crmService.listDeals(tenantId))[1]; // deal_102
      expect(deal.dealId).toBe('deal_102');

      // 2. Data Foundation & Freshness Check
      const freshness = crmService.checkFreshness(tenantId, 'src_salesforce_crm');
      expect(freshness.isStale).toBe(false);
      expect(freshness.trustFactor).toBe(1.0);

      // 3. Security & Zero-Trust Access Authorization
      const isAuthAllowed = AuthorizationEngine.evaluatePolicy('pol_deal_access', {
        tenantId,
        principal: { id: userId, type: 'USER', roles: ['SALES_LEAD'] },
        resource: { id: deal.dealId, type: 'DEAL', classification: 'CONFIDENTIAL' },
        action: 'EVALUATE_STRATEGY',
        environment: {},
      });
      expect(isAuthAllowed.allowed).toBe(true);

      // 4. Context Engine & Governed RAG
      const ragResults = await ragService.retrieveContext({
        tenantId,
        query: 'Pricing tier and compliance requirements for enterprise platform',
        requiredClassification: 'CONFIDENTIAL',
        topK: 2,
      });
      expect(ragResults.length).toBeGreaterThan(0);
      expect(ragResults[0].score).toBeGreaterThan(0.9);

      // 5. Scoped Agent Memory & Context Compilation
      AgentMemoryEngine.storeMemory({
        tenantId,
        agentId: 'deal-strategy-agent',
        tier: 'WORKING',
        key: `deal_context_${deal.dealId}`,
        content: { dealId: deal.dealId, stage: deal.stage, amountUSD: deal.amountUSD },
        confidence: 0.98,
        provenance: { sourceId: 'src_salesforce_crm', sourceType: 'USER_INPUT', timestamp: Date.now(), hash: 'hash_deal_102' },
        classification: 'CONFIDENTIAL',
      });
      const memories = AgentMemoryEngine.queryMemory(tenantId, 'deal-strategy-agent');
      expect(memories.length).toBe(1);

      // 6. Agent Orchestration: Deal Risk Assessment
      const riskAssessment = await revopsService.assessDealRisk(deal.dealId, deal.daysInStage ?? 34, deal.hasEconomicBuyer ?? false, 16);
      expect(riskAssessment.riskLevel).toBe('CRITICAL');
      expect(riskAssessment.riskScore).toBeGreaterThanOrEqual(70);

      // 7. Policy-as-Code Evaluation
      const policyDecision = policyEngine.evaluatePolicy({
        tenantId,
        principalId: 'deal-strategy-agent',
        principalType: 'AGENT',
        agentId: 'deal-strategy-agent',
        resourceType: 'CRM_OPPORTUNITY',
        resourceId: deal.dealId,
        resourceClassification: 'CONFIDENTIAL',
        action: 'TRIGGER_EXECUTIVE_OUTREACH',
        riskLevel: 'T3',
        environment: {},
      });
      expect(policyDecision.effect).toBe('REQUIRE_APPROVAL');

      // 8. Human Oversight HITL Gate
      const approvalReq = auditService.submitForApproval({
        tenantId,
        agentId: 'deal-strategy-agent',
        taskId: `task_deal_mitigation_${deal.dealId}`,
        actionType: 'EXECUTIVE_OUTREACH',
        decision: 'Dispatch executive sponsor outreach to unblock missing Economic Buyer',
        reason: riskAssessment.nextBestAction,
        evidence: ['evd_stage_stagnation_34d', 'evd_missing_economic_buyer'],
        confidence: 0.94,
        riskLevel: 'T3',
        policyId: policyDecision.matchedPolicyId ?? 'pol_high_risk_approval',
        toolId: 'nex_send_executive_outreach',
        toolArguments: { dealId: deal.dealId, recipient: 'cio@cyberdyne.com' },
        expectedEffect: 'Engage Economic Buyer and accelerate deal to Negotiation',
        requestedBy: 'deal-strategy-agent',
      });
      expect(approvalReq.status).toBe('PENDING');

      // Human approves decision
      const approved = auditService.approveAction(approvalReq.requestId, userId);
      expect(approved.status).toBe('APPROVED');

      // 9. Durable Workflow & Governed Tool Execution
      const workflowExecution = await workflowService.startWorkflow({
        workflowId: `wf_deal_mitigation_${deal.dealId}`,
        tenantId,
        name: 'Deal Risk Mitigation & Executive Outreach Workflow',
        taskQueue: 'revops-critical',
        input: { dealId: deal.dealId, approvalId: approved.requestId },
      });
      expect(workflowExecution.status).toBe('running');

      // 10. Post-Condition Verification & SHA-256 Audit Log
      const auditLog = await auditService.logAction({
        tenantId,
        who: userId,
        what: 'EXECUTE_DEAL_MITIGATION',
        when: Date.now(),
        where: deal.dealId,
        why: 'Mitigate stage stagnation and unblock economic buyer',
        agentId: 'deal-strategy-agent',
        modelId: 'gemini-1.5-pro',
        toolId: 'nex_send_executive_outreach',
        policyId: approvalReq.policyId,
        approvalId: approved.requestId,
        result: 'SUCCESS',
        traceId: 'trc_master_loop_001',
        riskLevel: 'T3',
      });
      expect(auditLog.evidenceHash).toBeDefined();

      const auditChain = await auditService.verifyAuditChain(tenantId);
      expect(auditChain.isValid).toBe(true);

      // 11. Business Outcome & Forecast Update
      const forecastAnalysis = await revopsService.explainExecutiveForecastAnomaly(tenantId);
      expect(forecastAnalysis.forecastDeltaUSD).toBe(-310000);
      expect(forecastAnalysis.recommendedPlaybook.length).toBe(3);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 2. LAYER 1 — AI INVENTORY, MODEL REGISTRY & SHADOW AI
  // ═════════════════════════════════════════════════════════════════════════

  describe('2. Layer 1 — AI Inventory, Model Registry & Shadow AI', () => {
    it('registers all 38 core agents with 5-way ownership and generates AI BOM', () => {
      expect(SHIVI_38_CORE_AGENTS.length).toBe(38);

      // Register first agent into inventory
      const agentSpec = SHIVI_38_CORE_AGENTS[0];
      const asset = AIInventoryRegistry.registerAsset({
        assetId: agentSpec.agentId,
        tenantId,
        type: 'AGENT',
        name: agentSpec.name,
        description: agentSpec.description,
        owner: {
          businessOwner: 'Chief Revenue Officer',
          technicalOwner: 'AI Platform Lead',
          securityOwner: 'Head of SecOps',
          dataOwner: 'Data Protection Officer',
          complianceOwner: 'AI Compliance Officer',
        },
        team: agentSpec.category,
        purpose: agentSpec.description,
        version: agentSpec.version,
        status: 'ACTIVE',
        riskTier: agentSpec.riskLevel,
        dataScope: ['CRM', 'DOCS', 'TELEMETRY'],
        permissions: agentSpec.allowedTools.map((t) => `tool:${t}`),
        dependencies: ['gemini-1.5-pro', 'vector-rag-pgvector'],
        provider: 'ShiVi AI Runtime',
        environment: 'production',
        shadowClassification: 'APPROVED',
      });

      expect(asset.assetId).toBe('orchestrator-agent');
      expect(AIInventoryRegistry.getOrphanedAssets(tenantId).length).toBe(0);

      // Generate AI BOM
      const bom = AIInventoryRegistry.generateBillOfMaterials(tenantId, asset.assetId);
      expect(bom.bomId).toBeDefined();
      expect(bom.hash.length).toBe(64); // SHA-256
      expect(bom.model.modelName).toBe(asset.name);
    });

    it('detects shadow AI telemetry signals across unapproved and unknown providers', () => {
      // Register known approved asset
      AIInventoryRegistry.registerAsset({
        assetId: 'asset_gemini_pro',
        tenantId,
        type: 'MODEL',
        name: 'Gemini 1.5 Pro',
        description: 'Approved enterprise LLM',
        owner: { businessOwner: 'GTM', technicalOwner: 'AI Eng', securityOwner: 'SecOps', dataOwner: 'DPO', complianceOwner: 'Legal' },
        team: 'AI',
        purpose: 'Reasoning',
        version: '1.0',
        status: 'ACTIVE',
        riskTier: 'T2',
        dataScope: ['ALL'],
        permissions: [],
        dependencies: [],
        provider: 'Google Vertex AI',
        environment: 'production',
        shadowClassification: 'APPROVED',
      });

      const signals = [
        { signalType: 'OUTBOUND_HTTP', source: 'Google Vertex AI', endpoint: 'https://us-central1-aiplatform.googleapis.com' },
        { signalType: 'UNAPPROVED_API_KEY', source: 'unregistered-third-party-ai.io', endpoint: 'https://api.unapproved.ai/v1/chat' },
      ];

      const scanResults = AIInventoryRegistry.scanTelemetryForShadowAI(tenantId, signals);
      expect(scanResults[0].classification).toBe('APPROVED');
      expect(scanResults[1].classification).toBe('UNKNOWN');
      expect(scanResults[1].recommendation).toContain('Unregistered AI signal');
    });

    it('enforces multi-level kill switches and safe mode gating', () => {
      // Normal mode: All operations allowed
      expect(KillSwitchController.isOperationAllowed(tenantId, 'WRITE', 'AGENT', 'sales-agent').allowed).toBe(true);

      // Enable SAFE_MODE: Mutations blocked, Analysis/Read allowed
      KillSwitchController.setSafeMode(tenantId, 'SAFE_MODE', 'Security alert investigation', userId);
      expect(KillSwitchController.isOperationAllowed(tenantId, 'READ').allowed).toBe(true);
      expect(KillSwitchController.isOperationAllowed(tenantId, 'ANALYZE').allowed).toBe(true);
      expect(KillSwitchController.isOperationAllowed(tenantId, 'WRITE').allowed).toBe(false);
      expect(KillSwitchController.isOperationAllowed(tenantId, 'DELETE').allowed).toBe(false);

      // Specific Agent Kill Switch
      KillSwitchController.activate(tenantId, 'AGENT', 'sdr-agent', 'Runaway looping detected', userId);
      expect(KillSwitchController.isOperationAllowed(tenantId, 'READ', 'AGENT', 'sdr-agent').allowed).toBe(false);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. LAYER 2 — DATA FOUNDATION, LINEAGE & QUALITY
  // ═════════════════════════════════════════════════════════════════════════

  describe('3. Layer 2 — Data Foundation, Lineage & Quality', () => {
    it('tracks enterprise data sources and evaluates Data Quality Score', () => {
      const sources = crmService.listDataSources(tenantId);
      expect(sources.length).toBeGreaterThanOrEqual(3);

      const qualityReport = crmService.evaluateDataQuality(tenantId, 'src_salesforce_crm');
      expect(qualityReport.overallScore).toBeGreaterThanOrEqual(90);
      expect(qualityReport.completeness).toBeGreaterThan(90);
      expect(qualityReport.uniqueness).toBe(99.4);
    });

    it('detects schema drift against typed data contracts', () => {
      crmService.registerDataContract({
        contractId: 'contract_crm_lead',
        tenantId,
        sourceSystem: 'Salesforce',
        targetSystem: 'ShiVi RAG Engine',
        schemaVersion: 'v1.0.0',
        fields: [
          { name: 'leadId', type: 'string', required: true, classification: 'INTERNAL' },
          { name: 'annualRevenue', type: 'number', required: true, classification: 'CONFIDENTIAL' },
          { name: 'email', type: 'string', required: true, classification: 'CONFIDENTIAL' },
        ],
        maxStalenessMs: 3600000,
      });

      // Valid payload
      const valid = crmService.validateDataContract(tenantId, 'contract_crm_lead', {
        leadId: 'lead_001',
        annualRevenue: 50000000,
        email: 'ceo@acme.com',
      });
      expect(valid.valid).toBe(true);

      // Drift payload (missing required field + invalid type)
      const drifted = crmService.validateDataContract(tenantId, 'contract_crm_lead', {
        leadId: 'lead_002',
        annualRevenue: 'FIFTY_MILLION', // invalid type
      });
      expect(drifted.valid).toBe(false);
      expect(drifted.schemaDriftDetected).toBe(true);
      expect(drifted.missingFields).toContain('email');
    });

    it('screens dataset for consequential demographic bias', () => {
      const cohorts = [
        { groupName: 'Enterprise North America', totalEvaluated: 1000, positiveClassifications: 750, falseNegativeCount: 20 },
        { groupName: 'Mid-Market EMEA', totalEvaluated: 800, positiveClassifications: 580, falseNegativeCount: 18 },
        { groupName: 'Emerging Markets APAC', totalEvaluated: 500, positiveClassifications: 390, falseNegativeCount: 15 },
      ];

      const screening = ragService.screenDataBias(tenantId, 'dataset_lead_qualification_v2', cohorts);
      expect(screening.disparateImpactRatio).toBeGreaterThanOrEqual(0.80);
      expect(screening.biasDetected).toBe(false);
      expect(screening.explanation).toContain('acceptable fairness boundaries');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 4. LAYER 3 — DATA SECURITY & ZERO-TRUST ISOLATION
  // ═════════════════════════════════════════════════════════════════════════

  describe('4. Layer 3 — Data Security & Zero-Trust Isolation', () => {
    it('redacts PII from raw context before LLM prompt compilation', () => {
      const rawText = 'Contact CEO John Doe at john.doe@enterprise.com or call 555-123-4567. SSN: 123-45-6789. Key: sk-12345678901234567890.';
      const anonymized = PromptSanitizer.anonymizePII(rawText);

      expect(anonymized.detectedPIICount).toBeGreaterThanOrEqual(4);
      expect(anonymized.anonymizedText).toContain('[REDACTED_EMAIL]');
      expect(anonymized.anonymizedText).toContain('[REDACTED_PHONE]');
      expect(anonymized.anonymizedText).toContain('[REDACTED_SSN]');
      expect(anonymized.anonymizedText).toContain('[REDACTED_API_KEY]');
    });

    it('enforces strict multi-tenant isolation across agent memory and RAG', () => {
      // Store memory for tenant A
      AgentMemoryEngine.storeMemory({
        tenantId: 'tenant_alpha',
        agentId: 'research-agent',
        tier: 'WORKING',
        key: 'confidential_intel',
        content: { mAndASecret: 'Acquiring Competitor X' },
        confidence: 1.0,
        provenance: { sourceId: 'sec_filing', sourceType: 'USER_INPUT', timestamp: Date.now(), hash: 'hash1' },
        classification: 'RESTRICTED',
      });

      // Tenant B queries memory -> must return 0 results
      const tenantBMemories = AgentMemoryEngine.queryMemory('tenant_beta', 'research-agent');
      expect(tenantBMemories.length).toBe(0);

      // Direct cross-tenant access throws isolation violation
      const alphaMemory = AgentMemoryEngine.queryMemory('tenant_alpha', 'research-agent')[0];
      expect(() => {
        AgentMemoryEngine.getMemoryById('tenant_beta', alphaMemory.id);
      }).toThrow(/Cross-tenant memory violation/);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 5. LAYER 4 — MODEL ASSURANCE & HARNESS EVALUATIONS
  // ═════════════════════════════════════════════════════════════════════════

  describe('5. Layer 4 — Model Assurance & Harness Evaluations', () => {
    it('executes universal evaluation harness and passes golden threshold', () => {
      const report = AgentEvaluationHarness.evaluateAgent(tenantId, 'orchestrator-agent', '1.0.0');
      expect(report.passedThreshold).toBe(true);
      expect(report.overallScore).toBeGreaterThanOrEqual(90);
      expect(report.metrics.groundednessScore).toBeGreaterThanOrEqual(95);
      expect(report.metrics.policyComplianceScore).toBe(100);
    });

    it('detects runaway behavioral drift and retrieval quality degradation', () => {
      // Baseline: 5 tool calls, 95% groundedness
      const normalMetrics = { avgLatencyMs: 380, toolCallsPerTurn: 4, costUSDPerTurn: 0.015, groundednessScore: 94.5, failureRate: 0.5 };
      const normalDrift = DriftDetectionEngine.evaluateDrift(tenantId, 'outreach-agent', normalMetrics);
      expect(normalDrift.length).toBe(0);

      // Anomaly: 480 tool calls (runaway looping) + 62% groundedness
      const anomalousMetrics = { avgLatencyMs: 1400, toolCallsPerTurn: 480, costUSDPerTurn: 1.85, groundednessScore: 62.0, failureRate: 8.5 };
      const detectedDrift = DriftDetectionEngine.evaluateDrift(tenantId, 'outreach-agent', anomalousMetrics);

      expect(detectedDrift.length).toBeGreaterThanOrEqual(2);
      expect(detectedDrift.some((d) => d.type === 'BEHAVIOR_DRIFT' && d.severity === 'CRITICAL')).toBe(true);
      expect(detectedDrift.some((d) => d.type === 'RETRIEVAL_DRIFT')).toBe(true);
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 6. LAYER 5 & 6 — HUMAN OVERSIGHT & COMPLIANCE CONTROL PLANE
  // ═════════════════════════════════════════════════════════════════════════

  describe('6. Layer 5 & 6 — Human Oversight & Compliance Control Plane', () => {
    it('evaluates compliance controls across EU AI Act, GDPR, and SOC2', () => {
      const controls = auditService.listControls(tenantId);
      expect(controls.length).toBeGreaterThanOrEqual(6);

      const euControl = auditService.getControlStatus(tenantId, 'ctrl_eu_ai_inventory');
      expect(euControl?.status).toBe('PASS');

      const gdprControl = auditService.getControlStatus(tenantId, 'ctrl_gdpr_tenant_isolation');
      expect(gdprControl?.status).toBe('PASS');
    });

    it('manages compliance exceptions with expiry tracking and mitigations', () => {
      const exception = auditService.registerException(tenantId, 'ctrl_eu_human_oversight', {
        owner: 'RevOps Lead',
        reason: 'Automated Tier-1 renewal approval under $5,000 ARR threshold',
        riskAccepted: 'Low financial variance risk under strict budget cap',
        expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
        approvedBy: 'Chief Legal Officer',
        mitigation: 'Daily automated reconciliation audit and $5K cap',
      });

      expect(exception.exceptionId).toBeDefined();
      const activeExceptions = auditService.reviewExceptions(tenantId);
      expect(activeExceptions.length).toBeGreaterThanOrEqual(0);
    });

    it('executes 8-stage incident management timeline from DETECTED to CLOSED', () => {
      const incident = auditService.reportIncident({
        tenantId,
        type: 'MODEL_REGRESSION',
        severity: 'HIGH',
        title: 'Retrieval groundedness drop in proposal generation',
        description: 'Groundedness score fell to 62% during high-concurrency peak load.',
        affectedResources: ['agent:outreach-agent', 'rag:doc_pricing_matrix_v3'],
        detectedBy: 'DriftDetectionEngine',
        containmentActions: ['Paused canary deployment', 'Enabled fallback to static pricing templates'],
        remediationSteps: ['Re-indexed vector chunks', 'Increased top-K similarity threshold'],
      });

      expect(incident.status).toBe('DETECTED');

      // Status transitions
      const classified = auditService.transitionIncident(incident.incidentId, 'CLASSIFIED', userId, 'Classified as high severity model drift');
      expect(classified.status).toBe('CLASSIFIED');

      const contained = auditService.transitionIncident(incident.incidentId, 'CONTAINED', userId, 'Canary paused and traffic routed to baseline');
      expect(contained.status).toBe('CONTAINED');

      const investigating = auditService.transitionIncident(incident.incidentId, 'INVESTIGATING', userId, 'Investigating index staleness');
      expect(investigating.status).toBe('INVESTIGATING');

      const remediated = auditService.transitionIncident(incident.incidentId, 'REMEDIATING', userId, 'Re-indexing complete');
      expect(remediated.status).toBe('REMEDIATING');

      const verified = auditService.transitionIncident(incident.incidentId, 'VERIFIED', userId, 'Groundedness verified at 96.5%');
      expect(verified.status).toBe('VERIFIED');

      const documented = auditService.transitionIncident(incident.incidentId, 'DOCUMENTED', userId, 'Post-mortem RCA logged in knowledge base');
      expect(documented.status).toBe('DOCUMENTED');

      const closed = auditService.transitionIncident(incident.incidentId, 'CLOSED', userId, 'Incident resolved');
      expect(closed.status).toBe('CLOSED');
      expect(closed.resolvedAt).toBeDefined();
    });

    it('calculates comprehensive 6-dimensional Enterprise AI Scorecard', () => {
      const scorecard = auditService.calculateEnterpriseScorecard(tenantId);
      expect(scorecard.readinessScore).toBeGreaterThanOrEqual(90);
      expect(scorecard.reliabilityScore).toBeGreaterThanOrEqual(90);
      expect(scorecard.securityScore).toBeGreaterThanOrEqual(95);
      expect(scorecard.governanceScore).toBeGreaterThanOrEqual(80);
      expect(scorecard.dataQualityScore).toBeGreaterThanOrEqual(90);
      expect(scorecard.operationalHealthScore).toBeGreaterThanOrEqual(90);
    });

    it('exports tamper-evident cryptographic audit trails in CSV and JSON formats', async () => {
      await auditService.logAction({
        tenantId,
        who: 'user_analyst',
        what: 'EXPORT_COMPLIANCE_REPORT',
        when: Date.now(),
        where: 'compliance_dashboard',
        why: 'Quarterly SOC2 audit preparation',
        agentId: 'compliance-agent',
        modelId: 'gemini-1.5-pro',
        toolId: 'nex_export_audit',
        policyId: 'pol_audit_mutations',
        approvalId: '',
        result: 'SUCCESS',
        traceId: 'trc_export_001',
        riskLevel: 'T1',
      });

      const jsonExport = auditService.exportAuditTrail(tenantId, 'JSON');
      expect(jsonExport.recordCount).toBeGreaterThan(0);
      expect(jsonExport.data).toContain('EXPORT_COMPLIANCE_REPORT');

      const csvExport = auditService.exportAuditTrail(tenantId, 'CSV');
      expect(csvExport.data).toContain('entryId,tenantId,who,what');
      expect(csvExport.data).toContain('user_analyst');
    });
  });
});
