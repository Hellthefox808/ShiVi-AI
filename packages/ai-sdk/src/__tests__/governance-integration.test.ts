/**
 * ShiVi Governance Integration Tests — AI Inventory, Model Cards, Kill Switch
 * Verifies the AI Governance Fabric modules integrate correctly.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  AIInventoryRegistry,
  ModelCardRegistry,
  KillSwitchController,
} from '@shivi/ai-sdk';

describe('AI Governance Fabric', () => {
  const tenantId = 'tenant_gov_test';

  // ─── AI Inventory Registry ──────────────────────────────────────────────

  describe('AIInventoryRegistry', () => {
    it('should register an AI asset with full ownership', () => {
      const asset = AIInventoryRegistry.registerAsset({
        assetId: 'agent_sales_research',
        tenantId,
        type: 'AGENT',
        name: 'Sales Research Agent',
        description: 'Researches prospect companies',
        owner: {
          businessOwner: 'vp_sales',
          technicalOwner: 'eng_lead',
          securityOwner: 'ciso',
          dataOwner: 'data_steward',
          complianceOwner: 'compliance_officer',
        },
        team: 'revenue',
        purpose: 'Lead research and enrichment',
        version: '2.1.0',
        status: 'ACTIVE',
        riskTier: 'T1',
        dataScope: ['CRM', 'EXTERNAL_API'],
        permissions: ['crm.read', 'enrichment.execute'],
        dependencies: ['crm-api', 'clearbit-api'],
        provider: 'shivi-internal',
        environment: 'production',
        shadowClassification: 'APPROVED',
      });

      expect(asset.assetId).toBe('agent_sales_research');
      expect(asset.createdAt).toBeGreaterThan(0);
      expect(asset.updatedAt).toBeGreaterThan(0);
      expect(asset.owner.businessOwner).toBe('vp_sales');
    });

    it('should retrieve assets by tenant', () => {
      const assets = AIInventoryRegistry.getAssetsByTenant(tenantId);
      expect(assets.length).toBeGreaterThanOrEqual(1);
      expect(assets.every((a) => a.tenantId === tenantId)).toBe(true);
    });

    it('should filter assets by type', () => {
      AIInventoryRegistry.registerAsset({
        assetId: 'model_gemini_pro',
        tenantId,
        type: 'MODEL',
        name: 'Gemini Pro',
        description: 'Google Gemini Pro model',
        owner: {
          businessOwner: 'cto',
          technicalOwner: 'ml_lead',
          securityOwner: 'ciso',
          dataOwner: 'data_steward',
          complianceOwner: 'compliance_officer',
        },
        team: 'platform',
        purpose: 'Complex reasoning tasks',
        version: '2.5',
        status: 'ACTIVE',
        riskTier: 'T2',
        dataScope: ['ALL'],
        permissions: ['model.invoke'],
        dependencies: [],
        provider: 'google',
        environment: 'production',
        shadowClassification: 'APPROVED',
      });

      const models = AIInventoryRegistry.getAssetsByType(tenantId, 'MODEL');
      expect(models.length).toBeGreaterThanOrEqual(1);
      expect(models.every((m) => m.type === 'MODEL')).toBe(true);
    });

    it('should classify AI system risk based on purpose and data sensitivity', () => {
      const classification = AIInventoryRegistry.classifySystem(
        tenantId,
        'agent_sales_research',
        'Lead research and enrichment',
        'INTERNAL',
        'LOW',
        'INFORMATIONAL'
      );

      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(classification);
    });

    it('should classify high-risk system correctly', () => {
      const classification = AIInventoryRegistry.classifySystem(
        tenantId,
        'agent_pricing',
        'Automated pricing decisions',
        'RESTRICTED',
        'HIGH',
        'FINANCIAL'
      );

      expect(['HIGH', 'CRITICAL']).toContain(classification);
    });

    it('should calculate explainable risk assessment', () => {
      const assessment = AIInventoryRegistry.calculateRiskTier({
        dataSensitivity: 8,
        autonomy: 7,
        externalSideEffects: 6,
        financialImpact: 9,
        customerImpact: 5,
        regulatoryExposure: 4,
        scale: 3,
        reversibility: 2,
      });

      expect(assessment.riskScore).toBeGreaterThan(0);
      expect(assessment.riskScore).toBeLessThanOrEqual(10);
      expect(['T0', 'T1', 'T2', 'T3', 'T4', 'T5']).toContain(assessment.riskTier);
      expect(assessment.factors.length).toBeGreaterThan(0);
      expect(assessment.factors[0].explanation).toBeTruthy();
    });

    it('should detect shadow AI from unregistered signal sources', () => {
      const result = AIInventoryRegistry.detectShadowAI(
        tenantId,
        'unregistered_model_provider',
        'unknown-llm-api.example.com',
        { endpoint: '/v1/chat/completions' }
      );

      expect(['UNKNOWN', 'SHADOW']).toContain(result.classification);
      expect(result.recommendation).toBeTruthy();
    });

    it('should identify orphaned assets missing ownership', () => {
      AIInventoryRegistry.registerAsset({
        assetId: 'tool_orphaned',
        tenantId,
        type: 'TOOL',
        name: 'Orphaned Tool',
        description: 'No complete ownership',
        owner: {
          businessOwner: '',
          technicalOwner: 'eng_lead',
          securityOwner: '',
          dataOwner: '',
          complianceOwner: '',
        },
        team: '',
        purpose: 'Unknown',
        version: '1.0',
        status: 'ACTIVE',
        riskTier: 'T0',
        dataScope: [],
        permissions: [],
        dependencies: [],
        provider: 'unknown',
        environment: 'production',
        shadowClassification: 'UNKNOWN',
      });

      const orphaned = AIInventoryRegistry.getOrphanedAssets(tenantId);
      expect(orphaned.length).toBeGreaterThanOrEqual(1);
      expect(orphaned.some((a) => a.assetId === 'tool_orphaned')).toBe(true);
    });

    it('should compute inventory statistics', () => {
      const stats = AIInventoryRegistry.getInventoryStats(tenantId);
      expect(stats.total).toBeGreaterThanOrEqual(3);
      expect(stats.byType).toBeDefined();
      expect(stats.byRisk).toBeDefined();
      expect(stats.byStatus).toBeDefined();
      expect(typeof stats.orphaned).toBe('number');
    });
  });

  // ─── Model Card Registry ───────────────────────────────────────────────

  describe('ModelCardRegistry', () => {
    it('should register a model card with full metadata', () => {
      const card = ModelCardRegistry.registerModelCard({
        modelId: 'gemini-2.5-pro',
        tenantId,
        provider: 'google',
        modelName: 'Gemini 2.5 Pro',
        version: '2.5.0',
        status: 'REVIEWED',
        purpose: 'Complex reasoning, multi-step analysis, code generation',
        capabilities: ['TEXT_GENERATION', 'STRUCTURED_OUTPUT', 'TOOL_USE', 'CODE_GENERATION'],
        limitations: ['May hallucinate on very specific domain knowledge', 'Context window: 1M tokens'],
        knownFailureModes: ['Repetition loops on ambiguous prompts'],
        riskTier: 'T2',
        dataConsiderations: ['No PII retention', 'Data processed in US/EU regions'],
        contextCapacity: 1000000,
        toolSupport: true,
        structuredOutputSupport: true,
        costPer1kInputTokens: 0.00125,
        costPer1kOutputTokens: 0.005,
        averageLatencyMs: 800,
        region: 'us-central1',
        dataPolicy: 'enterprise-data-processing-agreement',
        evaluationResults: [{ suiteId: 'golden-v3', score: 97.2, passedAt: Date.now() }],
        owner: 'platform-team',
        approvedBy: undefined,
        approvedAt: undefined,
      });

      expect(card.modelId).toBe('gemini-2.5-pro');
      expect(card.capabilities).toContain('TOOL_USE');
      expect(card.createdAt).toBeGreaterThan(0);
    });

    it('should validate model suitability for tasks', () => {
      const result = ModelCardRegistry.validateModelForTask(
        tenantId,
        'gemini-2.5-pro',
        ['TEXT_GENERATION', 'TOOL_USE'],
        0.01
      );

      expect(result.suitable).toBe(true);
      expect(result.missingCapabilities).toHaveLength(0);
    });

    it('should detect missing capabilities', () => {
      const result = ModelCardRegistry.validateModelForTask(
        tenantId,
        'gemini-2.5-pro',
        ['TEXT_GENERATION', 'AUDIO', 'VISION'],
      );

      expect(result.missingCapabilities.length).toBeGreaterThan(0);
    });

    it('should approve a reviewed model card', () => {
      const approved = ModelCardRegistry.approveModelCard(tenantId, 'gemini-2.5-pro', 'ciso_reviewer');
      expect(approved.status).toBe('APPROVED');
      expect(approved.approvedBy).toBe('ciso_reviewer');
      expect(approved.approvedAt).toBeGreaterThan(0);
    });

    it('should list model cards for tenant', () => {
      const cards = ModelCardRegistry.listModelCards(tenantId);
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });

    it('should deprecate a model with reason', () => {
      ModelCardRegistry.registerModelCard({
        modelId: 'old-model-v1',
        tenantId,
        provider: 'openai',
        modelName: 'GPT-4 Legacy',
        version: '1.0',
        status: 'ACTIVE',
        purpose: 'Legacy text generation',
        capabilities: ['TEXT_GENERATION'],
        limitations: [],
        knownFailureModes: [],
        riskTier: 'T1',
        dataConsiderations: [],
        contextCapacity: 8192,
        toolSupport: false,
        structuredOutputSupport: false,
        costPer1kInputTokens: 0.03,
        costPer1kOutputTokens: 0.06,
        averageLatencyMs: 2000,
        region: 'us-east-1',
        dataPolicy: 'standard',
        evaluationResults: [],
        owner: 'platform-team',
        approvedBy: undefined,
        approvedAt: undefined,
      });

      const deprecated = ModelCardRegistry.deprecateModel(tenantId, 'old-model-v1', 'End of life');
      expect(deprecated.status).toBe('DEPRECATED');
    });
  });

  // ─── Kill Switch Controller ─────────────────────────────────────────────

  describe('KillSwitchController', () => {
    it('should activate kill switch for a specific agent', () => {
      const record = KillSwitchController.activate(
        tenantId,
        'AGENT',
        'agent_rogue',
        'Detected anomalous tool call volume',
        'security_operator'
      );

      expect(record.enabled).toBe(true);
      expect(record.targetType).toBe('AGENT');
      expect(record.reason).toContain('anomalous');
    });

    it('should report kill switch as active', () => {
      expect(KillSwitchController.isActive(tenantId, 'AGENT', 'agent_rogue')).toBe(true);
    });

    it('should block operations on killed targets', () => {
      const result = KillSwitchController.isOperationAllowed(tenantId, 'WRITE', 'AGENT', 'agent_rogue');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeTruthy();
    });

    it('should deactivate kill switch', () => {
      const record = KillSwitchController.deactivate(tenantId, 'AGENT', 'agent_rogue', 'incident_resolved');
      expect(record.enabled).toBe(false);
    });

    it('should enforce SAFE_MODE — allow read, deny write', () => {
      KillSwitchController.setSafeMode(tenantId, 'SAFE_MODE', 'Incident investigation', 'security_team');

      const readResult = KillSwitchController.isOperationAllowed(tenantId, 'READ');
      expect(readResult.allowed).toBe(true);

      const analyzeResult = KillSwitchController.isOperationAllowed(tenantId, 'ANALYZE');
      expect(analyzeResult.allowed).toBe(true);

      const writeResult = KillSwitchController.isOperationAllowed(tenantId, 'WRITE');
      expect(writeResult.allowed).toBe(false);

      const deleteResult = KillSwitchController.isOperationAllowed(tenantId, 'DELETE');
      expect(deleteResult.allowed).toBe(false);

      const sendResult = KillSwitchController.isOperationAllowed(tenantId, 'SEND');
      expect(sendResult.allowed).toBe(false);

      // Reset
      KillSwitchController.setSafeMode(tenantId, 'NORMAL', 'Incident resolved', 'security_team');
    });

    it('should enforce LOCKDOWN — deny all operations', () => {
      KillSwitchController.setSafeMode(tenantId, 'LOCKDOWN', 'Critical breach', 'ciso');

      const readResult = KillSwitchController.isOperationAllowed(tenantId, 'READ');
      expect(readResult.allowed).toBe(false);

      // Reset
      KillSwitchController.setSafeMode(tenantId, 'NORMAL', 'Lockdown lifted', 'ciso');
    });

    it('should list active kill switches for tenant', () => {
      KillSwitchController.activate(tenantId, 'TOOL', 'tool_risky', 'Under review', 'admin');
      const active = KillSwitchController.getActiveKillSwitches(tenantId);
      expect(active.length).toBeGreaterThanOrEqual(1);
      // Cleanup
      KillSwitchController.deactivate(tenantId, 'TOOL', 'tool_risky', 'admin');
    });
  });
});
