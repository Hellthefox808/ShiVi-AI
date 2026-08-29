/**
 * ShiVi Data Foundation — Enterprise Data Governance Primitives
 * Source tracking, data lineage, quality scoring, freshness monitoring,
 * schema drift detection, and data contracts.
 */
import { randomUUID } from 'node:crypto';

export type DataSourceStatus = 'ACTIVE' | 'DEGRADED' | 'OFFLINE' | 'DEPRECATED';
export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'PII' | 'PHI';
export type LineageNodeType = 'SOURCE' | 'TRANSFORM' | 'STORAGE' | 'RETRIEVAL' | 'MODEL' | 'AGENT' | 'DECISION' | 'ACTION';
export type FreshnessStatus = 'FRESH' | 'STALE' | 'EXPIRED' | 'UNKNOWN';

export interface DataQualityScore {
  completeness: number;
  accuracy: number;
  consistency: number;
  uniqueness: number;
  validity: number;
  timeliness: number;
  overallScore: number;
  measuredAt: number;
}

export interface DataSource {
  sourceId: string;
  tenantId: string;
  name: string;
  type: 'CRM' | 'ERP' | 'SUPPORT' | 'EMAIL' | 'CALENDAR' | 'DOCUMENTS' | 'KNOWLEDGE_BASE' | 'DATA_WAREHOUSE' | 'PRODUCT_TELEMETRY' | 'EXTERNAL_API' | 'MCP_TOOL';
  owner: string;
  purpose: string;
  schema: Record<string, string>;
  status: DataSourceStatus;
  classification: DataClassification;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  acl: string[];
  retention: { durationDays: number; policy: string };
  qualityScore: DataQualityScore;
  lastSyncAt: number;
  lastIndexedAt: number;
  expectedFreshnessMs: number;
  recordCount: number;
  errorCount: number;
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
}

export interface DataLineageNode {
  nodeId: string;
  tenantId: string;
  type: LineageNodeType;
  name: string;
  sourceId?: string;
  parentNodeIds: string[];
  metadata: Record<string, unknown>;
  timestamp: number;
}

export interface DataContract {
  contractId: string;
  tenantId: string;
  producerId: string;
  consumerId: string;
  schema: Record<string, string>;
  version: number;
  status: 'ACTIVE' | 'DRAFT' | 'BROKEN';
  lastValidatedAt: number;
}

export class DataFoundationRegistry {
  private static sources: Map<string, DataSource> = new Map();
  private static lineageNodes: Map<string, DataLineageNode> = new Map();
  private static contracts: Map<string, DataContract> = new Map();

  static registerSource(source: Omit<DataSource, 'createdAt' | 'updatedAt'>): DataSource {
    const now = Date.now();
    const newSource = { ...source, createdAt: now, updatedAt: now };
    this.sources.set(`${source.tenantId}:${source.sourceId}`, newSource);
    return newSource;
  }

  static getSource(tenantId: string, sourceId: string): DataSource | undefined {
    return this.sources.get(`${tenantId}:${sourceId}`);
  }

  static listSources(tenantId: string): DataSource[] {
    return Array.from(this.sources.values()).filter(s => s.tenantId === tenantId);
  }

  static updateSourceSync(tenantId: string, sourceId: string, recordCount: number, errorCount: number): DataSource {
    const source = this.getSource(tenantId, sourceId);
    if (!source) throw new Error('Source not found');
    source.lastSyncAt = Date.now();
    source.recordCount = recordCount;
    source.errorCount = errorCount;
    source.updatedAt = Date.now();
    return source;
  }

  static measureQuality(tenantId: string, sourceId: string, metrics: Omit<DataQualityScore, 'overallScore' | 'measuredAt'>): DataQualityScore {
    const source = this.getSource(tenantId, sourceId);
    if (!source) throw new Error('Source not found');
    
    const overallScore = 
      metrics.completeness * 0.2 +
      metrics.accuracy * 0.25 +
      metrics.consistency * 0.15 +
      metrics.uniqueness * 0.1 +
      metrics.validity * 0.2 +
      metrics.timeliness * 0.1;

    const score: DataQualityScore = {
      ...metrics,
      overallScore,
      measuredAt: Date.now()
    };
    source.qualityScore = score;
    source.updatedAt = Date.now();
    return score;
  }

  static checkFreshness(tenantId: string, sourceId: string): { status: FreshnessStatus; lastUpdated: number; expectedFreshnessMs: number; stalenessMs: number } {
    const source = this.getSource(tenantId, sourceId);
    if (!source) throw new Error('Source not found');

    const stalenessMs = Date.now() - source.lastSyncAt;
    const expected = source.expectedFreshnessMs;
    let status: FreshnessStatus = 'UNKNOWN';
    
    if (expected > 0) {
      if (stalenessMs <= expected) status = 'FRESH';
      else if (stalenessMs <= expected * 3) status = 'STALE';
      else status = 'EXPIRED';
    }

    return {
      status,
      lastUpdated: source.lastSyncAt,
      expectedFreshnessMs: expected,
      stalenessMs
    };
  }

  static trackLineage(node: Omit<DataLineageNode, 'timestamp'>): DataLineageNode {
    const newNode = { ...node, timestamp: Date.now() };
    this.lineageNodes.set(`${node.tenantId}:${node.nodeId}`, newNode);
    return newNode;
  }

  static getLineageChain(tenantId: string, nodeId: string): DataLineageNode[] {
    const result: DataLineageNode[] = [];
    const visited = new Set<string>();

    const traverse = (currentId: string) => {
      const key = `${tenantId}:${currentId}`;
      if (visited.has(key)) return;
      visited.add(key);

      const node = this.lineageNodes.get(key);
      if (node) {
        result.push(node);
        for (const parentId of node.parentNodeIds) {
          traverse(parentId);
        }
      }
    };

    traverse(nodeId);
    return result;
  }

  static registerContract(contract: Omit<DataContract, 'lastValidatedAt'>): DataContract {
    const newContract = { ...contract, lastValidatedAt: Date.now() };
    this.contracts.set(`${contract.tenantId}:${contract.contractId}`, newContract);
    return newContract;
  }

  static detectSchemaDrift(tenantId: string, contractId: string, currentSchema: Record<string, string>): { drifted: boolean; addedFields: string[]; removedFields: string[]; changedFields: string[] } {
    const contract = this.contracts.get(`${tenantId}:${contractId}`);
    if (!contract) throw new Error('Contract not found');

    const expected = contract.schema;
    const addedFields: string[] = [];
    const removedFields: string[] = [];
    const changedFields: string[] = [];

    for (const key of Object.keys(currentSchema)) {
      if (!expected[key]) addedFields.push(key);
      else if (expected[key] !== currentSchema[key]) changedFields.push(key);
    }

    for (const key of Object.keys(expected)) {
      if (!currentSchema[key]) removedFields.push(key);
    }

    return {
      drifted: addedFields.length > 0 || removedFields.length > 0 || changedFields.length > 0,
      addedFields,
      removedFields,
      changedFields
    };
  }

  static getFoundationStats(tenantId: string): { totalSources: number; freshSources: number; staleSources: number; averageQuality: number; totalContracts: number; brokenContracts: number } {
    let freshSources = 0;
    let staleSources = 0;
    let totalQuality = 0;
    let qualityCount = 0;

    const sources = this.listSources(tenantId);
    for (const source of sources) {
      if (source.expectedFreshnessMs) {
        const { status } = this.checkFreshness(tenantId, source.sourceId);
        if (status === 'FRESH') freshSources++;
        else if (status === 'STALE' || status === 'EXPIRED') staleSources++;
      }
      if (source.qualityScore) {
        totalQuality += source.qualityScore.overallScore;
        qualityCount++;
      }
    }

    const tenantContracts = Array.from(this.contracts.values()).filter(c => c.tenantId === tenantId);
    const brokenContracts = tenantContracts.filter(c => c.status === 'BROKEN').length;

    return {
      totalSources: sources.length,
      freshSources,
      staleSources,
      averageQuality: qualityCount > 0 ? totalQuality / qualityCount : 0,
      totalContracts: tenantContracts.length,
      brokenContracts
    };
  }
}
