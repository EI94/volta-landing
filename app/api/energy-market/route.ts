import { NextResponse } from 'next/server';
import { validateData, EnergyMarketSchema } from '@/lib/validators';
import { rateLimiter } from '@/lib/rate-limiter';
import { cacheData } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import { fetchMarketStatus } from '@/lib/marketData';
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
        429, 
        performance.now() - startTime, 
        request.headers.get('x-forwarded-for') || 'anonymous',
        request.headers.get('user-agent') || 'unknown'
      );
      return rateLimitResult.response;
    }

    // Recupera i dati dal cache o chiama l'API
    const cacheKey = 'energy-market-status';
    const data = await cacheData(
      cacheKey,
      async () => fetchMarketStatus(),
      3600 // Cache per 1 ora
    );

    // Valida i dati
    const validatedData = await validateData(EnergyMarketSchema, data);
    
    // Log e metriche della richiesta riuscita
    await logger.logRequest(request, 200, startTime);
    await metrics.recordRequest(
      'GET', 
      request.url, 
      200, 
      performance.now() - startTime, 
      request.headers.get('x-forwarded-for') || 'anonymous',
      request.headers.get('user-agent') || 'unknown'
    );
    
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Errore nel recupero dei dati del mercato:', error);
    
    // Log e metriche dell'errore
    await logger.logRequest(request, 500, startTime, error as Error);
    await metrics.recordRequest(
      'GET', 
      request.url, 
      500, 
      performance.now() - startTime, 
      request.headers.get('x-forwarded-for') || 'anonymous',
      request.headers.get('user-agent') || 'unknown'
    );
    
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati del mercato' },
      { status: 500 }
    );
  }
} 