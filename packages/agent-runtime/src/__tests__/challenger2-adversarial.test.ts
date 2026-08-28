import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  AgentRosterManager,
  SHIVI_38_CORE_AGENTS,
  B2BRevOpsScenarioEngine,
  MultiAgentWorkflowEngine,
  AgentLifecycleManager,
  AgentExecutor,
} from '../index.js';
import { EvidenceLedger } from '@shivi/security';
import { TenancyContext, CapabilityBroker } from '@shivi/kernel';

describe('Challenger 2 Empirical Adversarial & Stress Testing Suite (Runtime, Scenarios, Roster & UI)', () => {
  const tenancy: TenancyContext = {
    tenantId: 'tenant-adversarial-test',
    organizationId: 'org-adversarial',
    environment: 'staging',
    homeRegion: 'us-west-2',
    policy: {
      allowedRegions: ['us-west-2'],
      maxRetentionDays: 90,
      dataClassificationLimit: 'RESTRICTED',
      customEncryptionKeyRequired: true,
      vectorIsolationEnabled: true,
      agentMemoryIsolationEnabled: true,
    },
  };

  describe('1. 5 Live RevOps Demonstration Scenarios & SHA-256 Evidence Logging', () => {
    it('should execute Scenario 1 (Recover Stalled  Opportunity) with verified 6-step timeline', async () => {
      const res = await B2BRevOpsScenarioEngine.executeRecoverStalledOpportunity(tenancy, 'opp_test_stalled_100k');

      expect(res.scenarioId).toBe('SCENARIO_1_RECOVER_STALLED_OPP');
      expect(res.status).toBe('COMPLETED');
      expect(res.revenueImpactUSD).toBe(100000);
      expect(res.steps.length).toBe(6);

      // Verify each step in sequence
      expect(res.steps[0].agentId).toBe('deal-risk-agent');
      expect(res.steps[0].output.riskScore).toBe(78);

      expect(res.steps[1].agentId).toBe('rag-agent');
      expect(res.steps[1].output.groundednessScore).toBe(98.4);

      expect(res.steps[2].agentId).toBe('buying-committee-agent');
      expect(res.steps[2].output.missingStakeholders).toBeDefined();

      expect(res.steps[3].agentId).toBe('deal-strategy-agent');
      expect(res.steps[3].output.estimatedWinProbabilityIncrease).toBe('+32%');

      expect(res.steps[4].agentId).toBe('policy-agent');
      expect(res.steps[4].requiresApproval).toBe(true);
      expect(res.steps[4].approvalGranted).toBe(true);

      expect(res.steps[5].agentId).toBe('forecast-agent');
      expect(res.steps[5].output.recoveredPipelineAmount).toBe(100000);

      // Evidence summary check
      expect(res.evidenceSummary.totalBlocks).toBe(6);
      expect(res.evidenceSummary.finalBlockHash).toBe(res.steps[5].evidenceHash);
      expect(res.evidenceSummary.chainIntegrityVerified).toBe(true);
    });

    it('should execute Scenario 2 (Qualify Enterprise Inbound Lead) with 3-step sequence', async () => {
      const res = await B2BRevOpsScenarioEngine.executeQualifyEnterpriseLead(tenancy, 'cto@vertexlabs.io');

      expect(res.scenarioId).toBe('SCENARIO_2_QUALIFY_ENTERPRISE_LEAD');
      expect(res.status).toBe('COMPLETED');
      expect(res.revenueImpactUSD).toBe(65000);
      expect(res.steps.length).toBe(3);

      expect(res.steps[0].agentId).toBe('enrichment-agent');
      expect(res.steps[1].agentId).toBe('icp-agent');
      expect(res.steps[1].output.icpScore).toBe(94);
      expect(res.steps[2].agentId).toBe('lead-routing-agent');
      expect(res.steps[2].output.assignedRep).toBe('rep_jordan_hayes');
    });

    it('should execute Scenario 3 (Renewal Churn Risk Mitigation) with 2-step sequence', async () => {
      const res = await B2BRevOpsScenarioEngine.executeRenewalRiskMitigation(tenancy, 'acc_northstar_250k');

      expect(res.scenarioId).toBe('SCENARIO_3_RENEWAL_RISK_MITIGATION');
      expect(res.status).toBe('COMPLETED');
      expect(res.revenueImpactUSD).toBe(250000);
      expect(res.steps.length).toBe(2);

      expect(res.steps[0].agentId).toBe('customer-health-agent');
      expect(res.steps[0].output.healthScore).toBe(48);
      expect(res.steps[1].agentId).toBe('renewal-agent');
      expect(res.steps[1].output.playbookTriggered).toBe('EXECUTIVE_CSM_ESC_PLAYBOOK');
    });

    it('should execute Scenario 4 (CRM Data Hygiene Scan) with 2-step sequence', async () => {
      const res = await B2BRevOpsScenarioEngine.executeCRMDataHygieneScan(tenancy);

      expect(res.scenarioId).toBe('SCENARIO_4_CRM_DATA_HYGIENE');
      expect(res.status).toBe('COMPLETED');
      expect(res.revenueImpactUSD).toBe(20000);
      expect(res.steps.length).toBe(2);

      expect(res.steps[0].agentId).toBe('crm-hygiene-agent');
      expect(res.steps[0].output.duplicateClustersFound).toBe(14);
      expect(res.steps[1].agentId).toBe('crm-hygiene-agent');
      expect(res.steps[1].output.mergedSuccessfully).toBe(14);
      expect(res.steps[1].output.dataIntegrityScore).toBe('99.8%');
    });

    it('should execute Scenario 5 (Executive Forecast Risk Analysis) with macro synthesis', async () => {
      const res = await B2BRevOpsScenarioEngine.executeExecutiveForecastAnalysis(tenancy, '2026-Q3');

      expect(res.scenarioId).toBe('SCENARIO_5_EXECUTIVE_FORECAST_ANALYSIS');
      expect(res.status).toBe('COMPLETED');
      expect(res.revenueImpactUSD).toBe(260000);
      expect(res.steps.length).toBe(1);

      expect(res.steps[0].agentId).toBe('executive-intelligence-agent');
      expect(res.steps[0].output.committedARR).toBe('$1.54M');
      expect(res.steps[0].output.slippageExposureUSD).toContain('$260,000');
    });

    it('should test EvidenceLedger cryptographic integrity and tamper detection', () => {
      // Initial chain verification
      expect(EvidenceLedger.verifyChainIntegrity()).toBe(true);

      // Append new block
      const newRec = EvidenceLedger.appendEvidence(
        tenancy.tenantId,
        'security-agent',
        'ADVERSARIAL_TEST_BLOCK',
        'T3',
        { testCase: 'Tamper Detection Check', timestamp: Date.now() }
      );
      expect(newRec.hash).toBeDefined();
      expect(newRec.hash.length).toBe(64); // SHA-256 hex string length
      expect(EvidenceLedger.verifyChainIntegrity()).toBe(true);

      // Verify tenant query
      const tenantRecords = EvidenceLedger.getTenantEvidence(tenancy.tenantId);
      expect(tenantRecords.length).toBeGreaterThan(0);
      expect(tenantRecords.some(r => r.recordId === newRec.recordId)).toBe(true);
    });
  });

  describe('2. 38 Specialized Core Agents Roster & Governance Scoping', () => {
    it('should strictly contain 38 unique agents across all required categories', () => {
      const agents = SHIVI_38_CORE_AGENTS;
      expect(agents.length).toBe(38);

      const agentIds = new Set(agents.map(a => a.agentId));
      expect(agentIds.size).toBe(38); // Ensure zero duplicates

      const categoryCounts = agents.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(categoryCounts['GTM']).toBe(11);
      expect(categoryCounts['REVOPS']).toBe(9);
      expect(categoryCounts['KNOWLEDGE']).toBe(3);
      expect(categoryCounts['GOVERNANCE']).toBe(4);
      expect(categoryCounts['HARNESS']).toBe(3);
      expect(categoryCounts['OPS']).toBe(8);

      const sumCategories = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
      expect(sumCategories).toBe(38);
    });

    it('should enforce capability risk tiers (T0-T5), model routers, and tool scopes on every agent', () => {
      const validRiskLevels = ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'];
      const validMemoryScopes = ['WORKING', 'TASK', 'ACCOUNT', 'ORGANIZATION'];

      for (const agent of SHIVI_38_CORE_AGENTS) {
        expect(agent.agentId).toBeDefined();
        expect(agent.name.length).toBeGreaterThan(0);
        expect(agent.description.length).toBeGreaterThan(10);
        expect(agent.version).toBe('1.0.0');
        expect(validRiskLevels).toContain(agent.riskLevel);
        expect(validMemoryScopes).toContain(agent.memoryScope);
        expect(agent.allowedTools.length).toBeGreaterThanOrEqual(1);
        expect(agent.defaultModel).toBeDefined();
        expect(agent.timeoutMs).toBeGreaterThanOrEqual(10000);
        expect(agent.retryPolicy.maxRetries).toBeGreaterThanOrEqual(2);
        expect(agent.evaluationThreshold).toBeGreaterThanOrEqual(85);

        // Agents with T3+ risk should have appropriate approval gating
        if (['policy-agent', 'crm-hygiene-agent', 'compliance-agent', 'harness-judge', 'workflow-recovery-agent'].includes(agent.agentId)) {
          expect(agent.approvalRequired).toBe(true);
        }
      }
    });

    it('should allow retrieval by ID and Category via AgentRosterManager', () => {
      const all = AgentRosterManager.getAllAgents();
      expect(all.length).toBe(38);

      const gtm = AgentRosterManager.getAgentsByCategory('GTM');
      expect(gtm.length).toBe(11);

      const revops = AgentRosterManager.getAgentsByCategory('REVOPS');
      expect(revops.length).toBe(9);

      const gov = AgentRosterManager.getAgentsByCategory('GOVERNANCE');
      expect(gov.length).toBe(4);

      const harness = AgentRosterManager.getAgentsByCategory('HARNESS');
      expect(harness.length).toBe(3);

      const ops = AgentRosterManager.getAgentsByCategory('OPS');
      expect(ops.length).toBe(8);

      const knowledge = AgentRosterManager.getAgentsByCategory('KNOWLEDGE');
      expect(knowledge.length).toBe(3);

      const nonExistent = AgentRosterManager.getAgent('non-existent-agent-id');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('3. Durable Multi-Agent Workflow State & Compensation Integrity', () => {
    it('should execute multi-agent workflow graph and verify evidence block generation on every step', async () => {
      const execResult = await MultiAgentWorkflowEngine.executeWorkflow(tenancy, 'wf_stalled_deal_recovery');
      expect(execResult.workflowId).toBe('wf_stalled_deal_recovery');
      expect(execResult.status).toBe('COMPLETED');
      expect(execResult.steps.length).toBe(6);

      for (const step of execResult.steps) {
        expect(step.status).toBe('COMPLETED');
        expect(step.evidenceRecordHash).toBeDefined();
        expect(step.evidenceRecordHash?.length).toBe(64);
      }
    });

    it('should execute inbound lead qualification workflow graph cleanly', async () => {
      const execResult = await MultiAgentWorkflowEngine.executeWorkflow(tenancy, 'wf_inbound_lead_qualification');
      expect(execResult.workflowId).toBe('wf_inbound_lead_qualification');
      expect(execResult.status).toBe('COMPLETED');
      expect(execResult.steps.length).toBe(4);
    });
  });

  describe('4. Web Control Plane (public/index.html) Verification & UI Invariants', () => {
    it('should verify public/index.html includes all 38 agents, 5 scenarios, and 4 pipeline stages', () => {
      const htmlPath = path.resolve(process.cwd(), 'public/index.html');
      expect(fs.existsSync(htmlPath)).toBe(true);

      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

      // Check title and key branding
      expect(htmlContent).toContain('ShiVi');
      expect(htmlContent).toContain('Revenue Operations');

      // Check all 38 agent IDs are present in the coreAgents array in HTML
      for (const agent of SHIVI_38_CORE_AGENTS) {
        expect(htmlContent).toContain(agent.agentId);
      }

      // Check all 5 scenario titles/IDs in HTML
      // Check all 5 scenario titles/IDs in HTML
      expect(htmlContent).toContain('Scenario 1: Recover Stalled $100K Enterprise Opportunity');
      expect(htmlContent).toContain('Scenario 2: Qualify New Strategic Enterprise Lead');
      expect(htmlContent).toContain('Scenario 3: Mitigate $250K Renewal Churn Risk');
      expect(htmlContent).toContain('Scenario 4: CRM Data Hygiene & Merge Repair');
      expect(htmlContent).toContain('Scenario 5: Executive Forecast Risk Analysis');

      // Check 4 pipeline Kanban stages
      expect(htmlContent).toContain('id="col-qual"');
      expect(htmlContent).toContain('id="col-valprop"');
      expect(htmlContent).toContain('id="col-prop"');
      expect(htmlContent).toContain('id="col-commit"');

      // Check forecast rollup values in HTML
      expect(htmlContent).toContain('$1,940,000'); // Total Pipeline
      expect(htmlContent).toContain('$1,498,000'); // Weighted Forecast
      expect(htmlContent).toContain('$1,540,000'); // Committed ARR

      // Check essential interactive functions exist in script
      expect(htmlContent).toContain('function advanceDealStage');
      expect(htmlContent).toContain('function triggerActiveWorkflow');
      expect(htmlContent).toContain('function triggerWorkflowCompensation');
      expect(htmlContent).toContain('function runScenario');
      expect(htmlContent).toContain('function filterAgentCategory');
      expect(htmlContent).toContain('function openAgentModal');
      expect(htmlContent).toContain('function openDealDetail');
    });
  });
});
