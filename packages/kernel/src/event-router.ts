/**
 * ShiVi X100+ Ecosystem Architecture — Polyglot Event Router
 * Standard: SAD v2.0 §14, TDA v1.1 §14
 */

export type EventRoutingTarget = 'NATS' | 'KAFKA' | 'TEMPORAL';

export interface EventRoutingPolicy {
  eventType: string;
  targetBus: EventRoutingTarget;
  rationale: string;
}

export interface DispatchEnvelope {
  tenantId: string;
  eventType: string;
  payload: Record<string, unknown>;
  traceId: string;
  targetBus: EventRoutingTarget;
  dispatchedAt: number;
}

export class PolyglotEventRouter {
  private static policies = new Map<string, EventRoutingPolicy>([
    ['agent.command', { eventType: 'agent.command', targetBus: 'NATS', rationale: 'Ultra-low latency control signal' }],
    ['agent.telemetry', { eventType: 'agent.telemetry', targetBus: 'KAFKA', rationale: 'Durable high-volume stream & analytics' }],
    ['workflow.execution', { eventType: 'workflow.execution', targetBus: 'TEMPORAL', rationale: 'Durable state machine workflow' }],
    ['tenant.audit', { eventType: 'tenant.audit', targetBus: 'KAFKA', rationale: 'Audit trail event replay' }]
  ]);

  /**
   * Route event to appropriate messaging substrate based on latency and durability requirements
   */
  public static routeEvent(tenantId: string, eventType: string, payload: Record<string, unknown>, traceId: string): DispatchEnvelope {
    let policy = this.policies.get(eventType);
    if (!policy) {
      // Default rule: low latency for commands, Kafka for telemetry/streams
      const targetBus: EventRoutingTarget = eventType.includes('command') ? 'NATS' : 'KAFKA';
      policy = { eventType, targetBus, rationale: 'Default routing rule' };
    }

    return {
      tenantId,
      eventType,
      payload,
      traceId,
      targetBus: policy.targetBus,
      dispatchedAt: Date.now()
    };
  }
}
