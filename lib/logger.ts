import { NextRequest } from 'next/server';

interface LogEntry {
  timestamp: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  responseTime: number;
  statusCode: number;
  error?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  async logRequest(
    request: NextRequest,
    statusCode: number,
    startTime: number,
    error?: Error
  ) {
    const endTime = performance.now();
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.nextUrl.pathname,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      responseTime: Math.round(endTime - startTime),
      statusCode,
      error: error?.message
    };

    // Aggiungi il log alla memoria
    this.logs.unshift(logEntry);
    
    // Mantieni solo gli ultimi MAX_LOGS
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Log su console per debugging
    console.log(JSON.stringify(logEntry, null, 2));
  }

  getLogs(limit = 100): LogEntry[] {
    return this.logs.slice(0, limit);
  }

  getErrorLogs(limit = 100): LogEntry[] {
    return this.logs
      .filter(log => log.statusCode >= 400)
      .slice(0, limit);
  }
}

export const logger = Logger.getInstance(); 