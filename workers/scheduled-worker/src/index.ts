export interface ScheduledJob { name: string; cron: string; handler: string; enabled: boolean; }
export class ScheduledWorker { async execute(job: ScheduledJob): Promise<{ success: boolean }> { return { success: true }; } }
