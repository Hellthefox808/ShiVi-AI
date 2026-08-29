/**
 * ShiVi Compliance, Oversight & Incident Management Tests
 * Verifies real SHA-256 audit chain integrity, compliance control evaluation,
 * human approval workflows, escalation paths, incident lifecycle, and governance scoring.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { AuditService } from '@shivi/service-audit';

describe('Compliance & Human Oversight Control Plane', () => {
  const tenantId = 'tenant_compliance_test';
  let auditService: AuditService;

  beforeEach(() => {
    auditService = new AuditService();
  });

  // ─── Audit Trail with Real SHA-256 ──────────────────────────────────────

  describe('Audit Trail — SHA-256 Evidence Chain', () => {
    it('should log audit entry with real SHA-256 hash (not random pseudo-hash)', async () => {
      const entry = await auditService.logAction({
        tenantId,
        who: 'user:alice',
        what: 'APPROVE_DEAL',
        when: Date.now(),
        where: 'deals/deal_001',
        why: 'Deal passed risk review',
        agentId: 'agent_deal_strategy',
        modelId: 'gemini-2.5-pro',
        toolId: 'crm_update',
        policyId: 'pol_deal_approval',
        approvalId: 'apr_001',
        result: 'SUCCESS',
        traceId: 'trace_abc123',
        riskLevel: 'T3',
        metadata: { dealValue: 250000 },
      });

      expect(entry.entryId).toMatch(/^audit_/);
      expect(entry.evidenceHash).toHaveLength(64); // SHA-256 hex
      expect(entry.evidenceHash).not.toMatch(/^hash_/); // NOT random pseudo-hash
    });

    it('should verify audit chain integrity via SHA-256 recalculation', async () => {
      await auditService.logAction({
        tenantId,
        who: 'user:bob',
        what: 'CREATE_OPPORTUNITY',
        when: Date.now(),
        where: 'opportunities/opp_001',
        why: 'New enterprise lead qualified',
        agentId: 'agent_qualification',
        modelId: 'gemini-flash',
        toolId: 'crm_create',
        policyId: 'pol_standard',
        approvalId: '',
        result: 'SUCCESS',
        traceId: 'trace_def456',
        riskLevel: 'T1',
        metadata: {},
      });

      await auditService.logAction({
        tenantId,
        who: 'agent:deal_risk',
        what: 'ASSESS_DEAL_RISK',
        when: Date.now(),
        where: 'deals/deal_002',
        why: 'Automated risk assessment triggered',
        agentId: 'agent_deal_risk',
        modelId: 'gemini-2.5-pro',
        toolId: 'risk_calculator',
        policyId: 'pol_risk_assessment',
        approvalId: '',
        result: 'SUCCESS',
        traceId: 'trace_ghi789',
        riskLevel: 'T2',
        metadata: { riskScore: 67 },
      });

      const verification = await auditService.verifyAuditChain(tenantId);
      expect(verification.isValid).toBe(true);
      expect(verification.verifiedRecordsCount).toBe(2);
      expect(verification.invalidEntries).toHaveLength(0);
    });

    it('should export audit trail as JSON', async () => {
      await auditService.logAction({
        tenantId,
        who: 'system',
        what: 'EXPORT_TEST',
        when: Date.now(),
        where: 'system',
        why: 'Test export',
        agentId: '',
        modelId: '',
        toolId: '',
        policyId: '',
        approvalId: '',
        result: 'SUCCESS',
        traceId: 'trace_export',
        riskLevel: 'T0',
        metadata: {},
      });

      const exported = auditService.exportAuditTrail(tenantId, 'JSON');
      expect(exported.recordCount).toBeGreaterThanOrEqual(1);
      expect(JSON.parse(exported.data)).toBeInstanceOf(Array);
    });

    it('should export audit trail as CSV', async () => {
      await auditService.logAction({
        tenantId,
        who: 'system',
        what: 'CSV_TEST',
        when: Date.now(),
        where: 'system',
        why: 'Test CSV export',
        agentId: '',
        modelId: '',
        toolId: '',
        policyId: '',
        approvalId: '',
        result: 'SUCCESS',
        traceId: 'trace_csv',
        riskLevel: 'T0',
        metadata: {},
      });

      const exported = auditService.exportAuditTrail(tenantId, 'CSV');
      expect(exported.data).toContain('entryId,tenantId');
      expect(exported.recordCount).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── Compliance Controls ──────────────────────────────────────────────

  describe('Compliance Control Plane', () => {
    it('should register and evaluate a compliance control', () => {
      const control = auditService.registerControl({
        controlId: 'ctrl_ai_inventory',
        tenantId,
        framework: 'EU_AI_ACT',
        requirement: 'Article 9 — Risk Management System',
        description: 'All AI systems must be inventoried with risk classification',
        owner: 'compliance_officer',
        status: 'NOT_ASSESSED',
        evidence: [],
        automatedCheck: (_tid: string) => 'PASS',
      });

      expect(control.controlId).toBe('ctrl_ai_inventory');
      expect(control.status).toBe('NOT_ASSESSED');

      const evaluated = auditService.evaluateControl(tenantId, 'ctrl_ai_inventory');
      expect(evaluated.status).toBe('PASS');
      expect(evaluated.lastEvaluatedAt).toBeGreaterThan(0);
    });

    it('should manually assess a control without automated check', () => {
      auditService.registerControl({
        controlId: 'ctrl_manual',
        tenantId,
        framework: 'GDPR',
        requirement: 'Article 35 — Data Protection Impact Assessment',
        description: 'DPIA required for high-risk processing',
        owner: 'dpo',
        status: 'NOT_ASSESSED',
        evidence: [],
      });

      const evaluated = auditService.evaluateControl(tenantId, 'ctrl_manual', 'PARTIAL', ['dpia_document_v2.pdf']);
      expect(evaluated.status).toBe('PARTIAL');
      expect(evaluated.evidence).toContain('dpia_document_v2.pdf');
    });

    it('should register exception and mark control as EXCEPTION', () => {
      auditService.registerControl({
        controlId: 'ctrl_exception_test',
        tenantId,
        framework: 'SOC2',
        requirement: 'CC6.1 — Logical and Physical Access Controls',
        description: 'Access controls for production systems',
        owner: 'security_team',
        status: 'PASS',
        evidence: [],
      });

      const exception = auditService.registerException(tenantId, 'ctrl_exception_test', {
        owner: 'cto',
        reason: 'Temporary elevated access for incident response',
        riskAccepted: 'Mitigated by 24/7 monitoring',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        approvedBy: 'ciso',
        mitigation: 'Continuous session recording enabled',
      });

      expect(exception.exceptionId).toMatch(/^exc_/);

      const reevaluated = auditService.evaluateControl(tenantId, 'ctrl_exception_test');
      expect(reevaluated.status).toBe('EXCEPTION');
    });

    it('should list controls filtered by framework', () => {
      const euControls = auditService.listControls(tenantId, 'EU_AI_ACT');
      expect(euControls.every((c) => c.framework === 'EU_AI_ACT')).toBe(true);
    });
  });

  // ─── Human Oversight ──────────────────────────────────────────────────

  describe('Human Oversight Manager', () => {
    it('should submit action for approval and track as PENDING', () => {
      const request = auditService.submitForApproval({
        tenantId,
        agentId: 'agent_pricing',
        taskId: 'task_price_override',
        actionType: 'FINANCIAL',
        decision: 'Override standard pricing for enterprise deal',
        reason: 'Customer requested volume discount',
        evidence: ['negotiation_notes.md', 'competitor_analysis.pdf'],
        confidence: 0.75,
        riskLevel: 'T3',
        policyId: 'pol_pricing',
        toolId: 'crm_price_update',
        toolArguments: { dealId: 'deal_001', newPrice: 450000 },
        expectedEffect: 'Update deal price to $450K',
        requestedBy: 'agent_pricing',
      });

      expect(request.requestId).toMatch(/^apr_/);
      expect(request.status).toBe('PENDING');
    });

    it('should approve a pending action', () => {
      const request = auditService.submitForApproval({
        tenantId,
        agentId: 'agent_outreach',
        taskId: 'task_email',
        actionType: 'COMMUNICATION',
        decision: 'Send follow-up email to prospect',
        reason: 'No response in 5 days',
        evidence: [],
        confidence: 0.9,
        riskLevel: 'T2',
        policyId: 'pol_comms',
        toolId: 'email_sender',
        toolArguments: { to: 'prospect@example.com' },
        expectedEffect: 'Send personalized follow-up email',
        requestedBy: 'agent_outreach',
      });

      const approved = auditService.approveAction(request.requestId, 'sales_manager');
      expect(approved.status).toBe('APPROVED');
      expect(approved.decidedBy).toBe('sales_manager');
      expect(approved.decidedAt).toBeGreaterThan(0);
    });

    it('should reject a pending action with reason', () => {
      const request = auditService.submitForApproval({
        tenantId,
        agentId: 'agent_bulk_ops',
        taskId: 'task_bulk_delete',
        actionType: 'DESTRUCTIVE',
        decision: 'Delete 5000 stale contacts',
        reason: 'CRM hygiene maintenance',
        evidence: [],
        confidence: 0.6,
        riskLevel: 'T4',
        policyId: 'pol_data_mutation',
        toolId: 'crm_bulk_delete',
        toolArguments: { filter: 'last_activity > 365d' },
        expectedEffect: 'Remove 5000 contact records',
        requestedBy: 'agent_bulk_ops',
      });

      const rejected = auditService.rejectAction(
        request.requestId,
        'data_steward',
        'Bulk deletion requires DPO sign-off per GDPR Article 17'
      );

      expect(rejected.status).toBe('REJECTED');
      expect(rejected.rejectionReason).toContain('GDPR');
    });

    it('should enforce override authority — deny unauthorized users', () => {
      const request = auditService.submitForApproval({
        tenantId,
        agentId: 'agent_test',
        taskId: 'task_override_test',
        actionType: 'CRITICAL',
        decision: 'Override blocked action',
        reason: 'Business urgency',
        evidence: [],
        confidence: 0.3,
        riskLevel: 'T5',
        policyId: 'pol_critical',
        toolId: 'critical_tool',
        toolArguments: {},
        expectedEffect: 'Execute critical mutation',
        requestedBy: 'agent_test',
      });

      expect(() => {
        auditService.overrideAction(
          request.requestId,
          'intern_user',
          'I think this is fine',
          ['admin', 'ciso', 'cto'],
          ['intern', 'viewer']
        );
      }).toThrow('lacks override authority');
    });

    it('should allow override by authorized user and record justification', () => {
      const request = auditService.submitForApproval({
        tenantId,
        agentId: 'agent_emergency',
        taskId: 'task_emergency',
        actionType: 'CRITICAL',
        decision: 'Emergency customer data export',
        reason: 'Legal hold requirement',
        evidence: ['legal_order.pdf'],
        confidence: 1.0,
        riskLevel: 'T5',
        policyId: 'pol_emergency',
        toolId: 'data_export',
        toolArguments: { scope: 'customer_123' },
        expectedEffect: 'Export customer data for legal hold',
        requestedBy: 'legal_team',
      });

      const overridden = auditService.overrideAction(
        request.requestId,
        'ciso_smith',
        'Legal hold supersedes standard policy — documented in case #LH-2026-001',
        ['admin', 'ciso', 'cto'],
        ['ciso', 'executive']
      );

      expect(overridden.status).toBe('OVERRIDDEN');
      expect(overridden.overrideJustification).toContain('Legal hold');
    });

    it('should determine escalation path for low confidence requests', () => {
      const path = auditService.getEscalationPath({
        requestId: 'apr_test',
        tenantId,
        agentId: 'agent_uncertain',
        taskId: 'task_uncertain',
        actionType: 'ADVISORY',
        decision: 'Unclear recommendation',
        reason: 'Ambiguous data',
        evidence: [],
        confidence: 0.3,
        riskLevel: 'T2',
        policyId: 'pol_standard',
        toolId: '',
        toolArguments: {},
        expectedEffect: 'Unknown',
        status: 'PENDING',
        requestedAt: Date.now(),
        requestedBy: 'agent_uncertain',
      });

      expect(path.shouldEscalate).toBe(true);
      expect(path.reason).toContain('Low confidence');
    });

    it('should list pending approvals for tenant', () => {
      auditService.submitForApproval({
        tenantId,
        agentId: 'agent_pending',
        taskId: 'task_pending',
        actionType: 'STANDARD',
        decision: 'Pending test',
        reason: 'Test',
        evidence: [],
        confidence: 0.8,
        riskLevel: 'T1',
        policyId: 'pol_test',
        toolId: '',
        toolArguments: {},
        expectedEffect: 'None',
        requestedBy: 'test',
      });

      const pending = auditService.getPendingApprovals(tenantId);
      expect(pending.length).toBeGreaterThanOrEqual(1);
      expect(pending.every((p) => p.status === 'PENDING')).toBe(true);
    });
  });

  // ─── Incident Management ──────────────────────────────────────────────

  describe('Incident Manager', () => {
    it('should report and track incident through full lifecycle', () => {
      const incident = auditService.reportIncident({
        tenantId,
        type: 'MODEL_REGRESSION',
        severity: 'HIGH',
        title: 'Agent groundedness score dropped below threshold',
        description: 'Sales research agent groundedness dropped from 96% to 72%',
        affectedResources: ['agent_sales_research', 'model_gemini_pro'],
        detectedBy: 'drift_monitor',
        containmentActions: [],
        remediationSteps: [],
      });

      expect(incident.incidentId).toMatch(/^inc_/);
      expect(incident.status).toBe('DETECTED');
      expect(incident.timeline).toHaveLength(1);

      // Progress through lifecycle
      let updated = auditService.transitionIncident(
        incident.incidentId, 'CLASSIFIED', 'security_bot', 'Classified as model regression'
      );
      expect(updated.status).toBe('CLASSIFIED');

      updated = auditService.transitionIncident(
        incident.incidentId, 'CONTAINED', 'ops_team', 'Agent moved to DEGRADED state'
      );
      expect(updated.status).toBe('CONTAINED');

      updated = auditService.transitionIncident(
        incident.incidentId, 'INVESTIGATING', 'ml_engineer', 'Investigating training data drift'
      );
      expect(updated.status).toBe('INVESTIGATING');

      updated = auditService.transitionIncident(
        incident.incidentId, 'REMEDIATING', 'ml_engineer', 'Re-evaluating with updated golden tests'
      );
      expect(updated.status).toBe('REMEDIATING');

      updated = auditService.transitionIncident(
        incident.incidentId, 'VERIFIED', 'qa_team', 'Groundedness restored to 95%'
      );
      expect(updated.status).toBe('VERIFIED');

      updated = auditService.transitionIncident(
        incident.incidentId, 'DOCUMENTED', 'compliance_officer', 'Post-incident report filed'
      );
      expect(updated.status).toBe('DOCUMENTED');

      updated = auditService.transitionIncident(
        incident.incidentId, 'CLOSED', 'ciso', 'Incident resolved and documented'
      );
      expect(updated.status).toBe('CLOSED');
      expect(updated.resolvedAt).toBeGreaterThan(0);
      expect(updated.timeline.length).toBe(8); // 1 detection + 7 transitions
    });

    it('should reject invalid incident transitions', () => {
      const incident = auditService.reportIncident({
        tenantId,
        type: 'SECURITY',
        severity: 'CRITICAL',
        title: 'Cross-tenant data access attempt',
        description: 'Agent attempted to read data from another tenant',
        affectedResources: ['tenant_boundary'],
        detectedBy: 'isolation_verifier',
        containmentActions: [],
        remediationSteps: [],
      });

      expect(() => {
        auditService.transitionIncident(incident.incidentId, 'CLOSED', 'admin', 'Skip to close');
      }).toThrow('Invalid incident transition');
    });

    it('should retrieve incident timeline', () => {
      const incident = auditService.reportIncident({
        tenantId,
        type: 'POLICY_VIOLATION',
        severity: 'MEDIUM',
        title: 'Agent exceeded token budget',
        description: 'Cost exceeded $5 limit',
        affectedResources: ['agent_expensive'],
        detectedBy: 'cost_monitor',
        containmentActions: [],
        remediationSteps: [],
      });

      auditService.transitionIncident(incident.incidentId, 'CLASSIFIED', 'bot', 'Auto-classified');

      const timeline = auditService.getIncidentTimeline(incident.incidentId);
      expect(timeline.length).toBe(2);
      expect(timeline[0].action).toBe('INCIDENT_DETECTED');
      expect(timeline[1].action).toBe('STATUS_CLASSIFIED');
    });
  });

  // ─── Governance Score ─────────────────────────────────────────────────

  describe('Governance Score', () => {
    it('should calculate composite governance score across all layers', () => {
      const score = auditService.calculateGovernanceScore(
        tenantId,
        { total: 38, withOwners: 35 },
        { totalPolicies: 10, activePolicies: 8 },
        { totalAgents: 38, evaluatedAgents: 36 },
        { trailCoverage: 95 },
      );

      expect(score.tenantId).toBe(tenantId);
      expect(score.inventoryCoverage).toBeGreaterThan(0);
      expect(score.policyCoverage).toBeGreaterThan(0);
      expect(score.evaluationCoverage).toBeGreaterThan(0);
      expect(score.overallScore).toBeGreaterThan(0);
      expect(score.overallScore).toBeLessThanOrEqual(100);
      expect(score.calculatedAt).toBeGreaterThan(0);
    });
  });
});
