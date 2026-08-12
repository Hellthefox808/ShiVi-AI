export interface AgentTask { agentId: string; taskId: string; payload: unknown; }
export class AgentWorker { async process(task: AgentTask): Promise<{ success: boolean }> { return { success: true }; } }
