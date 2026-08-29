/**
 * ShiVi E2E Governance Flow Tests
 * Verifies the complete vertical integration across all 6 governance layers
 * working together as one system: AI Inventory → Policy → Security → Assurance →
 * Human Oversight → Compliance → Audit.
 */
import { describe, it, expect } from 'vitest';
import { AgentLifecycleManager } from '@shivi/agent-runtime';
import { AIInventoryRegistry, KillSwitchController } from '@shivi/ai-sdk';
import { EvidenceLedger } from '@shivi/security';
import { CapabilityBroker, CapabilityViolationError } from '@shivi/kernel';

describe('E2E Governance Flows', () => {
  const tenantId = 'tenant_e2e_gov';

  // ─── E2E Master Test ─────────────────────────────────────────────────

  describe('E2E Master: Signal → Inventory → Policy → Capability → Audit', () => {
    it('should execute full governance loop from agent registration to evidence chain', () => {
      // Step 1: Register agent in AI Inventory
      const asset = AIInventoryRegistry.registerAsset({
        assetId: 'agent_e2e_deal_risk',
        tenantId,
        type: 'AGENT',
        name: 'Deal Risk Agent',
        description: 'Assesses deal risk for pipeline management',
        owner: {
          businessOwner: 'vp_revops',
          technicalOwner: 'eng_lead',
          securityOwner: 'ciso',
          dataOwner: 'data_steward',
          complianceOwner: 'compliance_officer',
        },
        team: 'revops',
        purpose: 'Real-time deal risk scoring',
        version: '3.0.0',
        status: 'ACTIVE',
        riskTier: 'T2',
        dataScope: ['CRM', 'PIPELINE'],
        permissions: ['crm.read', 'pipeline.read', 'forecast.write'],
        dependencies: ['crm-api', 'gemini-pro'],
        provider: 'shivi-internal',
        environment: 'production',
        shadowClassification: 'APPROVED',
      });

      expect(asset.status).toBe('ACTIVE');

      // Step 2: Register agent in lifecycle manager
      const manifest = AgentLifecycleManager.registerAgent(
        'agent_e2e_deal_risk',
        '3.0.0',
        tenantId,
        'Deal Risk Agent',
        'Assesses deal risk',
        ['crm.read', 'pipeline.read'],
        'T2'
      );

      expect(manifest.state).toBe('DRAFT');

      // Step 3: Progress through lifecycle
      AgentLifecycleManager.transitionState(tenantId, 'agent_e2e_deal_risk', '3.0.0', 'EVALUATING');
      AgentLifecycleManager.transitionState(tenantId, 'agent_e2e_deal_risk', '3.0.0', 'SECURITY_REVIEW');
      AgentLifecycleManager.transitionState(tenantId, 'agent_e2e_deal_risk', '3.0.0', 'STAGING');
      AgentLifecycleManager.transitionState(tenantId, 'agent_e2e_deal_risk', '3.0.0', 'CANARY');
      const activeAgent = AgentLifecycleManager.transitionState(
        tenantId, 'agent_e2e_deal_risk', '3.0.0', 'ACTIVE'
      );

      expect(activeAgent.state).toBe('ACTIVE');

      // Step 4: Issue capability token
      const token = CapabilityBroker.issueToken(tenantId, 'agent_e2e_deal_risk', {
        capabilityId: 'cap_crm_read',
        resource: 'crm:deals',
        operation: 'READ',
        riskLevel: 'T2',
        requiresHumanApproval: false,
        maxDelegationDepth: 2,
      });

      expect(token.tenantId).toBe(tenantId);

      // Step 5: Validate capability execution
      const valid = CapabilityBroker.validateCapabilityExecution(token.tokenId, 'READ');
      expect(valid).toBe(true);

      // Step 6: Record to evidence ledger
      const evidence = EvidenceLedger.appendEvidence(
        tenantId,
        'agent_e2e_deal_risk',
        'ASSESS_DEAL_RISK',
        'T2',
        {
          dealId: 'deal_enterprise_001',
          riskScore: 67,
          factors: ['stage_stagnation', 'missing_champion'],
        }
      );

      expect(evidence.hash).toHaveLength(64);

      // Step 7: Verify evidence chain integrity
      expect(EvidenceLedger.verifyChainIntegrity()).toBe(true);
    });
  });

  // ─── Governance E2E: Unregistered Agent Detection ─────────────────────

  describe('Governance E2E: Unregistered Agent → Detect → Block', () => {
    it('should detect unregistered AI activity via shadow AI detection', () => {
      const shadowResult = AIInventoryRegistry.detectShadowAI(
        tenantId,
        'unregistered_model_provider',
        'rogue-llm-proxy.internal:8080',
        { endpoint: '/v1/completions', detectedAt: Date.now() }
      );

      expect(['UNKNOWN', 'SHADOW']).toContain(shadowResult.classification);
      expect(shadowResult.recommendation).toBeTruthy();
    });

    it('should block unregistered agent via lifecycle — cannot transition to ACTIVE', () => {
      // Register but don't progress through evaluation
      AgentLifecycleManager.registerAgent(
        'agent_unverified',
        '1.0.0',
        tenantId,
        'Unverified Agent',
        'Not evaluated',
        ['*'],
        'T5'
      );

      // Cannot skip directly to ACTIVE
      expect(() => {
        AgentLifecycleManager.transitionState(tenantId, 'agent_unverified', '1.0.0', 'ACTIVE');
      }).toThrow('Invalid lifecycle transition');
    });
  });

  // ─── Adversarial E2E: Kill Switch Emergency ───────────────────────────

  describe('Adversarial E2E: Anomaly → Kill Switch → Safe Mode → Recovery', () => {
    it('should activate kill switch on anomalous agent and enforce safe mode', () => {
      // Step 1: Detect anomaly — agent making excessive tool calls
      const killRecord = KillSwitchController.activate(
        tenantId,
        'AGENT',
        'agent_runaway',
        'Detected 480 tool calls in 60 seconds (normal: 5)',
        'anomaly_detector'
      );

      expect(killRecord.enabled).toBe(true);

      // Step 2: Verify operations blocked
      const writeCheck = KillSwitchController.isOperationAllowed(tenantId, 'WRITE', 'AGENT', 'agent_runaway');
      expect(writeCheck.allowed).toBe(false);

      // Step 3: Activate safe mode for investigation
      KillSwitchController.setSafeMode(tenantId, 'SAFE_MODE', 'Investigating runaway agent', 'security_team');

      // Step 4: Verify safe mode allows read but blocks write
      const readCheck = KillSwitchController.isOperationAllowed(tenantId, 'READ');
      expect(readCheck.allowed).toBe(true);

      const sendCheck = KillSwitchController.isOperationAllowed(tenantId, 'SEND');
      expect(sendCheck.allowed).toBe(false);

      // Step 5: Recovery — deactivate kill switch and restore normal mode
      KillSwitchController.deactivate(tenantId, 'AGENT', 'agent_runaway', 'security_team');
      KillSwitchController.setSafeMode(tenantId, 'NORMAL', 'Investigation complete', 'security_team');

      const normalCheck = KillSwitchController.isOperationAllowed(tenantId, 'WRITE');
      expect(normalCheck.allowed).toBe(true);
    });
  });

  // ─── Failure E2E: Capability Expiration & Revocation ──────────────────

  describe('Failure E2E: Capability Expiration → Denial → Recovery', () => {
    it('should deny operations with expired capability tokens', () => {
      // Issue token with very short TTL (already expired by construction)
      const token = CapabilityBroker.issueToken(
        tenantId,
        'agent_short_lived',
        {
          capabilityId: 'cap_temp',
          resource: 'crm:deals',
          operation: 'READ',
          riskLevel: 'T1',
          requiresHumanApproval: false,
          maxDelegationDepth: 0,
        },
        0 // 0 seconds TTL — expires immediately
      );

      expect(() => {
        CapabilityBroker.validateCapabilityExecution(token.tokenId, 'READ');
      }).toThrow('expired or revoked');
    });

    it('should deny operations after token revocation', () => {
      const token = CapabilityBroker.issueToken(
        tenantId,
        'agent_revocable',
        {
          capabilityId: 'cap_revocable',
          resource: 'crm:contacts',
          operation: 'WRITE',
          riskLevel: 'T2',
          requiresHumanApproval: false,
          maxDelegationDepth: 1,
        },
        3600
      );

      // Revoke the token
      CapabilityBroker.revokeToken(token.tokenId);

      // Attempt to use revoked token
      expect(() => {
        CapabilityBroker.validateCapabilityExecution(token.tokenId, 'WRITE');
      }).toThrow('expired or revoked');
    });

    it('should require human approval for T4/T5 risk operations', () => {
      const token = CapabilityBroker.issueToken(
        tenantId,
        'agent_high_risk',
        {
          capabilityId: 'cap_high_risk',
          resource: 'billing:invoices',
          operation: 'WRITE',
          riskLevel: 'T4',
          requiresHumanApproval: false, // Will be forced to true by broker
          maxDelegationDepth: 0,
        },
        3600
      );

      // T4 should have requiresHumanApproval forced to true
      expect(token.capability.requiresHumanApproval).toBe(true);

      // Without approval, execution should be denied
      expect(() => {
        CapabilityBroker.validateCapabilityExecution(token.tokenId, 'WRITE', false);
      }).toThrow('requires human approval');

      // With approval granted, execution should succeed
      const result = CapabilityBroker.validateCapabilityExecution(token.tokenId, 'WRITE', true);
      expect(result).toBe(true);
    });
  });
});
