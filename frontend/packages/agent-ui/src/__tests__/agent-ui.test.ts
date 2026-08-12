import { describe, it, expect } from 'vitest';
import {
  AgentSessionRender,
  AgentMessageRender,
  AgentThoughtStatusRender,
  ToolExecutionRender,
  ToolResultRender,
  EvidencePanelRender,
  CitationRender,
  ApprovalRequestRender,
  CapabilityBadgeRender,
  AgentStateRender,
  WorkflowExecutionRender,
  ExecutionTimelineRender,
  ConfidenceIndicatorRender,
  ContextInspectorRender,
  MemoryInspectorRender,
  PolicyDecisionRender,
  AgentCheckpointRender,
  RecoveryStateRender,
} from '../index.js';

describe('ShiVi 18 AI-Native Component Render Suite', () => {
  it('should render all 18 AI-native UI component props correctly', () => {
    const sessionRes = AgentSessionRender({
      session: {
        sessionId: 's1',
        tenantId: 't1',
        agentId: 'a1',
        agentVersion: 'v1.0.0',
        state: 'ACTIVE',
        riskLevel: 'T1',
        trajectory: [],
        startedAt: Date.now(),
      },
    });
    expect(sessionRes.type).toBe('AgentSession');

    const msgRes = AgentMessageRender({ sender: 'agent', content: 'Hello', timestamp: Date.now() });
    expect(msgRes.type).toBe('AgentMessage');

    const thoughtRes = AgentThoughtStatusRender({ statusText: 'Thinking...', isReasoning: true });
    expect(thoughtRes.type).toBe('AgentThoughtStatus');

    const toolRes = ToolExecutionRender({
      tool: { toolCallId: 'c1', toolName: 'search', parameters: {}, status: 'COMPLETED' },
    });
    expect(toolRes.type).toBe('ToolExecution');

    const resultRes = ToolResultRender({ result: { data: 'ok' }, executionTimeMs: 12 });
    expect(resultRes.type).toBe('ToolResult');

    const evidenceRes = EvidencePanelRender({ recordId: 'e1', previousHash: '000', hash: 'abc', timestamp: Date.now() });
    expect(evidenceRes.type).toBe('EvidencePanel');

    const citationRes = CitationRender({ documentId: 'doc1', classification: 'INTERNAL', similarityScore: 0.92 });
    expect(citationRes.type).toBe('Citation');

    const approvalRes = ApprovalRequestRender({ requestId: 'req1', operation: 'DELETE', riskLevel: 'T4' });
    expect(approvalRes.type).toBe('ApprovalRequest');

    const capRes = CapabilityBadgeRender({ capabilityId: 'cap1', riskLevel: 'T2' });
    expect(capRes.type).toBe('CapabilityBadge');

    const stateRes = AgentStateRender({ state: 'ACTIVE' });
    expect(stateRes.type).toBe('AgentState');

    const wfRes = WorkflowExecutionRender({ workflowId: 'wf1', currentStep: 2, totalSteps: 5, status: 'RUNNING' });
    expect(wfRes.type).toBe('WorkflowExecution');

    const timelineRes = ExecutionTimelineRender({ steps: [] });
    expect(timelineRes.type).toBe('ExecutionTimeline');

    const confRes = ConfidenceIndicatorRender({ score: 0.95 });
    expect(confRes.type).toBe('ConfidenceIndicator');
    expect(confRes.percentage).toBe('95.0%');

    const ctxRes = ContextInspectorRender({ contextQualityScore: 98, itemCount: 5, freshnessGrade: 'FRESH' });
    expect(ctxRes.type).toBe('ContextInspector');

    const memRes = MemoryInspectorRender({ workingMemoryCount: 2, episodicMemoryCount: 5, semanticMemoryCount: 10, proceduralMemoryCount: 1 });
    expect(memRes.type).toBe('MemoryInspector');
    expect(memRes.totalMemories).toBe(18);

    const polRes = PolicyDecisionRender({ action: 'EXECUTE', allowed: true });
    expect(polRes.type).toBe('PolicyDecision');

    const chkRes = AgentCheckpointRender({ checkpointId: 'chk1', stepIndex: 3, timestamp: Date.now() });
    expect(chkRes.type).toBe('AgentCheckpoint');

    const recRes = RecoveryStateRender({ triggerReason: 'GOAL_DRIFT', newState: 'DEGRADED', workingMemoryPurged: true });
    expect(recRes.type).toBe('RecoveryState');
  });
});
