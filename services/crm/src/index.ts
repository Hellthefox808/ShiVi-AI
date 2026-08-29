/**
 * service-crm - Enterprise Data Foundation & CRM Integration
 * Tracks data sources, freshness, data quality scores, data contracts, and CRM objects.
 *
 * @packageDocumentation
 */

export interface ContactRecord {
  contactId: string;
  name: string;
  email: string;
  company: string;
  title: string;
  phone?: string;
  classification?: string;
  freshnessMs?: number;
}

export interface DealRecord {
  dealId: string;
  title: string;
  amountUSD: number;
  stage: string;
  accountName?: string;
  assignedRep?: string;
  daysInStage?: number;
  hasEconomicBuyer?: boolean;
  lastActivityTimestamp?: number;
}

export interface DataSourceDefinition {
  sourceId: string;
  tenantId: string;
  name: string;
  type: 'CRM' | 'ERP' | 'SUPPORT' | 'EMAIL' | 'CALENDAR' | 'DOCUMENTS' | 'DATA_WAREHOUSE' | 'TELEMETRY' | 'EXTERNAL_API' | 'MCP_TOOL';
  owner: string;
  purpose: string;
  status: 'HEALTHY' | 'DEGRADED' | 'SYNCING' | 'ERROR' | 'OFFLINE';
  lastSyncAt: number;
  recordsCount: number;
  errorCount: number;
  schemaVersion: string;
  expectedFreshnessMs: number;
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  aclRoles: string[];
  retentionDays: number;
  qualityScore: number;
}

export interface DataQualityReport {
  sourceId: string;
  tenantId: string;
  completeness: number;
  accuracy: number;
  consistency: number;
  uniqueness: number;
  validity: number;
  timeliness: number;
  overallScore: number;
  calculatedAt: number;
}

export interface FreshnessStatus {
  sourceId: string;
  lastUpdated: number;
  lastIndexed: number;
  expectedFreshnessMs: number;
  currentStalenessMs: number;
  isStale: boolean;
  trustFactor: number; // 0.0 to 1.0
}

export interface DataContractDefinition {
  contractId: string;
  tenantId: string;
  sourceSystem: string;
  targetSystem: string;
  schemaVersion: string;
  fields: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  }>;
  maxStalenessMs: number;
}

export class CRMService {
  private dataSources = new Map<string, DataSourceDefinition>();
  private contracts = new Map<string, DataContractDefinition>();

  constructor(private readonly config: Record<string, unknown> = {}) {
    this.bootstrapDefaultSources('default');
  }

  private bootstrapDefaultSources(tenantId: string): void {
    const defaultSources: DataSourceDefinition[] = [
      {
        sourceId: 'src_salesforce_crm',
        tenantId,
        name: 'Enterprise Salesforce CRM',
        type: 'CRM',
        owner: 'Sales Operations',
        purpose: 'Primary source of truth for accounts, opportunities, and deal pipeline',
        status: 'HEALTHY',
        lastSyncAt: Date.now() - 15 * 60 * 1000, // 15 mins ago
        recordsCount: 14250,
        errorCount: 0,
        schemaVersion: 'v4.2.0',
        expectedFreshnessMs: 3600000, // 1 hour
        classification: 'CONFIDENTIAL',
        aclRoles: ['SALES_REP', 'REVOPS_ADMIN', 'EXECUTIVE'],
        retentionDays: 730,
        qualityScore: 94.5,
      },
      {
        sourceId: 'src_zendesk_support',
        tenantId,
        name: 'Customer Support Tickets',
        type: 'SUPPORT',
        owner: 'Customer Success',
        purpose: 'Support ticket history, CSAT scores, and escalation monitoring',
        status: 'HEALTHY',
        lastSyncAt: Date.now() - 30 * 60 * 1000,
        recordsCount: 8900,
        errorCount: 2,
        schemaVersion: 'v2.1.0',
        expectedFreshnessMs: 7200000, // 2 hours
        classification: 'INTERNAL',
        aclRoles: ['SUPPORT_AGENT', 'CS_MANAGER', 'REVOPS_ADMIN'],
        retentionDays: 365,
        qualityScore: 91.0,
      },
      {
        sourceId: 'src_product_telemetry',
        tenantId,
        name: 'Product Usage Telemetry',
        type: 'TELEMETRY',
        owner: 'Data Engineering',
        purpose: 'Feature adoption, active users, session counts, API quota consumption',
        status: 'HEALTHY',
        lastSyncAt: Date.now() - 5 * 60 * 1000,
        recordsCount: 2450000,
        errorCount: 0,
        schemaVersion: 'v5.0.1',
        expectedFreshnessMs: 900000, // 15 mins
        classification: 'INTERNAL',
        aclRoles: ['PRODUCT_MANAGER', 'DATA_SCIENTIST', 'REVOPS_ADMIN'],
        retentionDays: 90,
        qualityScore: 98.2,
      },
    ];

    for (const src of defaultSources) {
      this.dataSources.set(`${tenantId}:${src.sourceId}`, src);
    }
  }

  public registerDataSource(source: DataSourceDefinition): DataSourceDefinition {
    this.dataSources.set(`${source.tenantId}:${source.sourceId}`, source);
    return source;
  }

  public listDataSources(tenantId: string): DataSourceDefinition[] {
    const list = Array.from(this.dataSources.values()).filter((s) => s.tenantId === tenantId || s.tenantId === 'default');
    return list;
  }

  public checkFreshness(tenantId: string, sourceId: string): FreshnessStatus {
    const source = this.dataSources.get(`${tenantId}:${sourceId}`) || this.dataSources.get(`default:${sourceId}`);
    const now = Date.now();
    const lastUpdated = source ? source.lastSyncAt : now - 1000;
    const expectedFreshnessMs = source ? source.expectedFreshnessMs : 3600000;
    const currentStalenessMs = now - lastUpdated;
    const isStale = currentStalenessMs > expectedFreshnessMs;
    const trustFactor = isStale ? Math.max(0.2, Number((expectedFreshnessMs / currentStalenessMs).toFixed(2))) : 1.0;

    return {
      sourceId,
      lastUpdated,
      lastIndexed: lastUpdated,
      expectedFreshnessMs,
      currentStalenessMs,
      isStale,
      trustFactor,
    };
  }

  public evaluateDataQuality(tenantId: string, sourceId: string): DataQualityReport {
    const source = this.dataSources.get(`${tenantId}:${sourceId}`) || this.dataSources.get(`default:${sourceId}`);
    const baseScore = source ? source.qualityScore : 90;

    return {
      sourceId,
      tenantId,
      completeness: Math.min(100, baseScore + 2),
      accuracy: Math.min(100, baseScore + 1),
      consistency: Math.min(100, baseScore - 1),
      uniqueness: 99.4,
      validity: Math.min(100, baseScore),
      timeliness: this.checkFreshness(tenantId, sourceId).isStale ? 65.0 : 96.5,
      overallScore: baseScore,
      calculatedAt: Date.now(),
    };
  }

  public registerDataContract(contract: DataContractDefinition): DataContractDefinition {
    this.contracts.set(`${contract.tenantId}:${contract.contractId}`, contract);
    return contract;
  }

  public validateDataContract(
    tenantId: string,
    contractId: string,
    payload: Record<string, unknown>
  ): { valid: boolean; missingFields: string[]; typeErrors: string[]; schemaDriftDetected: boolean } {
    const contract = this.contracts.get(`${tenantId}:${contractId}`);
    if (!contract) {
      return { valid: true, missingFields: [], typeErrors: [], schemaDriftDetected: false };
    }

    const missingFields: string[] = [];
    const typeErrors: string[] = [];

    for (const field of contract.fields) {
      if (field.required && (payload[field.name] === undefined || payload[field.name] === null)) {
        missingFields.push(field.name);
      } else if (payload[field.name] !== undefined && typeof payload[field.name] !== field.type) {
        typeErrors.push(`Field '${field.name}' expected type '${field.type}' but received '${typeof payload[field.name]}'`);
      }
    }

    const valid = missingFields.length === 0 && typeErrors.length === 0;
    return {
      valid,
      missingFields,
      typeErrors,
      schemaDriftDetected: !valid,
    };
  }

  public async getContact(tenantId: string, contactId: string): Promise<ContactRecord | null> {
    return {
      contactId,
      name: 'John Doe',
      email: 'john.doe@enterprise.com',
      company: 'Acme MegaCorp',
      title: 'VP of Engineering',
      phone: '+1 (555) 234-5678',
      classification: 'CONFIDENTIAL',
      freshnessMs: 60000,
    };
  }

  public async listDeals(tenantId: string, filter?: Record<string, unknown>): Promise<DealRecord[]> {
    return [
      {
        dealId: 'deal_101',
        title: 'ShiVi Enterprise 500 Seats',
        amountUSD: 250000,
        stage: 'negotiation',
        accountName: 'Acme MegaCorp',
        assignedRep: 'Sarah Jenkins',
        daysInStage: 12,
        hasEconomicBuyer: true,
        lastActivityTimestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
      {
        dealId: 'deal_102',
        title: 'ShiVi AI Platform Upgrade',
        amountUSD: 120000,
        stage: 'proposal',
        accountName: 'CyberDyne Systems',
        assignedRep: 'David Miller',
        daysInStage: 34,
        hasEconomicBuyer: false,
        lastActivityTimestamp: Date.now() - 16 * 24 * 60 * 60 * 1000,
      },
    ];
  }
}

export default CRMService;

