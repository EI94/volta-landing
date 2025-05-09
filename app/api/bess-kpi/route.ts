import { NextResponse } from 'next/server';
import { validateData, BessKPISchema } from '@/lib/validators';
import { rateLimiter } from '@/lib/rate-limiter';
import { cacheData } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import { fetchBESSPerformance } from '@/lib/bessPerformance';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  try {
    // Controllo rate limiting
    const rateLimitResult = await rateLimiter(request);
    if (!rateLimitResult.success) {
      const error = new Error('Troppe richieste. Riprova più tardi.');
      await logger.logRequest(request, 429, startTime, error);
      await metrics.recordRequest(
        'GET', 
        request.url, 
        429, // o 200 o 500 a seconda del contesto
        performance.now() - startTime, 
        request.headers.get('x-forwarded-for') || 'anonymous',
        request.headers.get('user-agent') || 'unknown'
      );
      return rateLimitResult.response;
    }

    // Recupera i dati dalla cache o chiama l'API
    const cacheKey = 'bess-kpi';
    const data = await cacheData(
      cacheKey,
      async () => fetchBESSPerformance(),
      3600 // Cache per 1 ora
    );

    // Valida i dati
    const validatedData = await validateData(BessKPISchema, data);
    
    // Log e metriche della richiesta riuscita
    await logger.logRequest(request, 200, startTime);
    await metrics.recordRequest(
      'GET', 
      request.url, 
      200, // o 200 o 500 a seconda del contesto
      performance.now() - startTime, 
      request.headers.get('x-forwarded-for') || 'anonymous',
      request.headers.get('user-agent') || 'unknown'
    );
    
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Errore nel recupero dei KPI del BESS:', error);
    
    // Log e metriche dell'errore
    await logger.logRequest(request, 500, startTime, error as Error);
    await metrics.recordRequest(
      'GET', 
      request.url, 
      500, // o 200 o 500 a seconda del contesto
      performance.now() - startTime, 
      request.headers.get('x-forwarded-for') || 'anonymous',
      request.headers.get('user-agent') || 'unknown'
    );
    
    return NextResponse.json(
      { error: 'Errore nel recupero dei KPI del BESS' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; 