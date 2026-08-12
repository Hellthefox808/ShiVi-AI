export interface NotificationJob { channel: string; recipient: string; template: string; }
export class NotificationWorker { async deliver(job: NotificationJob): Promise<{ delivered: boolean }> { return { delivered: true }; } }
