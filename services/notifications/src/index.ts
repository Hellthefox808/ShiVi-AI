export interface Notification { channel: 'email' | 'sms' | 'push' | 'slack'; recipient: string; template: string; data: Record<string, unknown>; }
export class NotificationService { send(n: Notification): { sent: boolean } { return { sent: true }; } }
