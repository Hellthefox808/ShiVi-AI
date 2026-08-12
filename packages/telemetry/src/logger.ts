/**
 * ShiVi X100+ Telemetry — Structured Logger
 * Standard: SAD v2.0 §33, TDA v1.1 §91, FTL-KER-008
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogContext {
  tenantId: string;
  correlationId?: string;
  traceId?: string;
  agentId?: string;
  component: string;
}

export interface LogRecord extends Partial<LogContext> {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

export class Logger {
  private context?: LogContext;

  constructor(context?: LogContext) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      message,
      tenantId: this.context?.tenantId,
      correlationId: this.context?.correlationId,
      traceId: this.context?.traceId,
      agentId: this.context?.agentId,
      component: this.context?.component || 'system',
      metadata,
    };

    const jsonOutput = JSON.stringify(record);
    if (level === 'ERROR') {
      console.error(jsonOutput);
    } else if (level === 'WARN') {
      console.warn(jsonOutput);
    } else {
      console.log(jsonOutput);
    }
  }

  public debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('DEBUG', message, metadata);
  }

  public info(message: string, metadata?: Record<string, unknown>): void {
    this.log('INFO', message, metadata);
  }

  public warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('WARN', message, metadata);
  }

  public error(message: string, metadata?: Record<string, unknown>): void {
    this.log('ERROR', message, metadata);
  }

  // Static convenience methods
  public static info(message: string, metadata?: Record<string, unknown>): void {
    new Logger().info(message, metadata);
  }

  public static warn(message: string, metadata?: Record<string, unknown>): void {
    new Logger().warn(message, metadata);
  }

  public static error(message: string, metadata?: Record<string, unknown>): void {
    new Logger().error(message, metadata);
  }

  public static debug(message: string, metadata?: Record<string, unknown>): void {
    new Logger().debug(message, metadata);
  }
}
