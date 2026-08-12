/**
 * ShiVi X100+ Ecosystem Architecture — Golden Path Tech Stack Registry
 * Standard: SAD v2.0 §1, TDA v1.1 §1
 */

export type TechnologyTier = 'CORE' | 'SPECIALIZED' | 'EXPERIMENTAL';

export interface TechnologySpec {
  name: string;
  category: string;
  recommendedVersion: string;
  tier: TechnologyTier;
  purpose: string;
}

export class GoldenPathRegistry {
  private static specs: TechnologySpec[] = [
    // Web & Frontend
    { name: 'React', category: 'Web', recommendedVersion: '19.2', tier: 'CORE', purpose: 'Primary UI framework' },
    { name: 'Next.js', category: 'Web', recommendedVersion: '15.x', tier: 'CORE', purpose: 'Primary enterprise web platform' },
    { name: 'TanStack Start', category: 'Web', recommendedVersion: 'RC', tier: 'EXPERIMENTAL', purpose: 'Router-first full-stack TypeScript sandbox' },
    { name: 'TypeScript', category: 'Language', recommendedVersion: '5.5+', tier: 'CORE', purpose: 'Universal typed language' },
    
    // Runtime
    { name: 'Node.js', category: 'Runtime', recommendedVersion: '24 LTS', tier: 'CORE', purpose: 'Production server baseline' },
    { name: 'Python', category: 'AI/ML Runtime', recommendedVersion: '3.13+', tier: 'SPECIALIZED', purpose: 'Agents, ML, evaluation & research' },
    
    // API Services
    { name: 'Fastify', category: 'API', recommendedVersion: '5.10.x', tier: 'CORE', purpose: 'High-performance API gateway & microservices' },
    { name: 'NestJS', category: 'API', recommendedVersion: '10.x', tier: 'SPECIALIZED', purpose: 'Heavy modular enterprise domain services' },
    
    // Persistence & Cache
    { name: 'PostgreSQL', category: 'Database', recommendedVersion: '16+', tier: 'CORE', purpose: 'System of record' },
    { name: 'Drizzle ORM', category: 'ORM', recommendedVersion: '0.30+', tier: 'CORE', purpose: 'Type-safe SQL persistence' },
    { name: 'Redis/Valkey', category: 'Cache', recommendedVersion: '7.x', tier: 'CORE', purpose: 'Cache, locks, rate limits' },
    { name: 'Neo4j', category: 'Graph Database', recommendedVersion: '5.x', tier: 'SPECIALIZED', purpose: 'Knowledge & entity relationship graph' },
    { name: 'OpenSearch', category: 'Search', recommendedVersion: '2.x', tier: 'SPECIALIZED', purpose: 'Enterprise full-text search & discovery' },
    { name: 'ClickHouse', category: 'Analytics', recommendedVersion: '24.x', tier: 'SPECIALIZED', purpose: 'High-volume telemetry & analytics' },
    
    // Workflows & Events
    { name: 'Temporal', category: 'Workflow', recommendedVersion: '1.24+', tier: 'CORE', purpose: 'Durable execution engine' },
    { name: 'NATS', category: 'Messaging', recommendedVersion: '2.10+', tier: 'SPECIALIZED', purpose: 'Ultra-low-latency control plane & agent messaging' },
    { name: 'Kafka/Redpanda', category: 'Streaming', recommendedVersion: '3.x', tier: 'SPECIALIZED', purpose: 'High-volume event streams & durable replay' },
    
    // Observability & Security
    { name: 'OpenTelemetry', category: 'Telemetry', recommendedVersion: '1.25+', tier: 'CORE', purpose: 'Unified distributed tracing & metrics' },
    { name: 'OpenFGA', category: 'Authz', recommendedVersion: '1.5+', tier: 'CORE', purpose: 'Relationship-based access control' },
    { name: 'OPA', category: 'Policy', recommendedVersion: '0.65+', tier: 'CORE', purpose: 'Runtime policy evaluation' }
  ];

  public static getGoldenPaths(tier?: TechnologyTier): TechnologySpec[] {
    if (tier) {
      return this.specs.filter((s) => s.tier === tier);
    }
    return this.specs;
  }

  public static validateTechnologySelection(name: string): TechnologySpec | undefined {
    return this.specs.find((s) => s.name.toLowerCase() === name.toLowerCase());
  }
}
