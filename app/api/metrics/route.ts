import { NextResponse } from 'next/server';
import { metrics } from '@/lib/metrics';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const metricsData = await metrics.getMetrics();
    const recentLogs = logger.getLogs(10);
    const recentErrors = logger.getErrorLogs(10);

    return NextResponse.json({
      metrics: metricsData,
      recentRequests: recentLogs,
      recentErrors: recentErrors
    });
  } catch (error) {
    console.error('Errore nel recupero delle metriche:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle metriche' },
      { status: 500 }
    );
  }
} 