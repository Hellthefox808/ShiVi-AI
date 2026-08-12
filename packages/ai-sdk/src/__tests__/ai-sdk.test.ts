import { describe, it, expect } from 'vitest';
import { ModelRouter, ModelCostTracker, VectorRetrievalEngine, VectorDocumentChunk } from '../index.js';
import { TenancyContext } from '@shivi/kernel';

describe('ShiVi AI SDK & AI Gateway Suite', () => {
  const sampleTenant: TenancyContext = {
    tenantId: 'tenant-beta',
    organizationId: 'org-globex',
    environment: 'staging',
    homeRegion: 'eu-west-1',
    policy: {
      allowedRegions: ['eu-west-1'],
      maxRetentionDays: 30,
      dataClassificationLimit: 'CONFIDENTIAL',
      customEncryptionKeyRequired: false,
      vectorIsolationEnabled: true,
      agentMemoryIsolationEnabled: true,
    },
  };

  describe('Model Router & Decision Engine', () => {
    it('should route simple task to Flash model', () => {
      const decision = ModelRouter.selectRoute({
        tenantId: 'tenant-beta',
        agentId: 'agent-support-01',
        taskComplexity: 'SIMPLE',
      });
      expect(decision.primaryModel).toBe('gemini-1.5-flash');
    });

    it('should route complex task to Gemini 1.5 Pro model', () => {
      const decision = ModelRouter.selectRoute({
        tenantId: 'tenant-beta',
        agentId: 'agent-finance-01',
        taskComplexity: 'COMPLEX',
      });
      expect(decision.primaryModel).toBe('gemini-1.5-pro');
    });

    it('should route privacy restricted task to local Ollama instance', () => {
      const decision = ModelRouter.selectRoute({
        tenantId: 'tenant-beta',
        agentId: 'agent-sec-01',
        taskComplexity: 'COMPLEX',
        privacyRestricted: true,
      });
      expect(decision.primaryModel).toBe('ollama-llama3');
    });

    it('should execute primary model and failover to fallback model if primary fails', async () => {
      const decision = ModelRouter.selectRoute({
        tenantId: 'tenant-beta',
        agentId: 'agent-01',
        taskComplexity: 'MEDIUM',
      });

      const res = await ModelRouter.executeWithFallback(
        decision,
        async () => {
          throw new Error('Primary model rate limited');
        },
        async (fallbackModel) => `Success via ${fallbackModel}`
      );

      expect(res.isFallback).toBe(true);
      expect(res.modelUsed).toBe('gemini-1.5-pro');
      expect(res.result).toContain('gemini-1.5-pro');
    });
  });

  describe('Model Cost Tracker & FinOps Governance', () => {
    it('should calculate input and output token costs accurately', () => {
      const cost = ModelCostTracker.calculateCost('gemini-1.5-pro', 1000, 1000);
      expect(cost).toBe(0.00625);
    });

    it('should enforce monthly tenant AI spend budgets', () => {
      ModelCostTracker.resetLedger();
      ModelCostTracker.setTenantBudget('tenant-beta', 0.01);
      ModelCostTracker.recordUsage('tenant-beta', 'agent-01', 'gemini-1.5-pro', 1000, 1000);

      // Second usage should exceed $0.01 budget limit
      expect(() => {
        ModelCostTracker.recordUsage('tenant-beta', 'agent-01', 'gemini-1.5-pro', 1000, 1000);
      }).toThrow();
    });
  });

  describe('Vector Retrieval & ACL Security Engine', () => {
    it('should calculate cosine similarity accurately and rank results', () => {
      const sim = VectorRetrievalEngine.calculateCosineSimilarity([1, 0, 0], [1, 0, 0]);
      expect(sim).toBe(1.0);

      const simOrtho = VectorRetrievalEngine.calculateCosineSimilarity([1, 0, 0], [0, 1, 0]);
      expect(simOrtho).toBe(0);
    });

    it('should retrieve authorized document chunks and filter out unauthorized roles or tenant IDs', () => {
      VectorRetrievalEngine.resetIndex();
      const chunk1: VectorDocumentChunk = {
        documentId: 'doc-01',
        chunkId: 'chk-01',
        tenantId: 'tenant-beta',
        classification: 'INTERNAL',
        allowedRoles: ['sales', 'admin'],
        content: 'Q3 Sales Report Content',
        vectorEmbedding: [0.1, 0.2, 0.3],
      };

      const chunkUnauthorizedTenant: VectorDocumentChunk = {
        ...chunk1,
        chunkId: 'chk-02',
        tenantId: 'tenant-other',
      };

      const chunkUnauthorizedRole: VectorDocumentChunk = {
        ...chunk1,
        chunkId: 'chk-03',
        allowedRoles: ['executive-only'],
      };

      VectorRetrievalEngine.indexDocument(chunk1);
      VectorRetrievalEngine.indexDocument(chunkUnauthorizedTenant);
      VectorRetrievalEngine.indexDocument(chunkUnauthorizedRole);

      const results = VectorRetrievalEngine.queryVectorIndex(sampleTenant, ['sales'], [0.1, 0.2, 0.3]);
      expect(results.length).toBe(1);
      expect(results[0].chunkId).toBe('chk-01');
      expect(results[0].similarityScore).toBeGreaterThan(0.9);
    });
  });
});

