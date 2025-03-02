import { NextResponse } from 'next/server';
import { validateData, EnergyMarketSchema } from '@/lib/validators';
import { rateLimiter } from '@/lib/rate-limiter';
import { cacheData } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  try {
    // Controllo rate limiting
    const rateLimitResult = await rateLimiter(request);
    if (!rateLimitResult.success) {
      const error = new Error('Troppe richieste. Riprova più tardi.');
      await logger.logRequest(request, 429, startTime, error);
      await metrics.recordRequest(429, performance.now() - startTime);
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }

    // Recupera i dati dal cache o genera nuovi dati
    const data = await cacheData(
      'energy-market:current',
      async () => {
        const now = new Date();
        return {
          timestamp: now.toISOString(),
          price: 50 + Math.random() * 100, // €/MWh
          demand: 1000 + Math.random() * 5000, // MW
          renewable_percentage: Math.random() * 100, // %
          trend: Math.random() > 0.5 ? 'up' : 'down',
          forecast: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(now.getTime() + i * 3600000).toISOString(),
            price: 50 + Math.random() * 100,
          })),
        };
      },
      { ttl: 300 } // Cache per 5 minuti
    );

    // Valida i dati
    const validatedData = await validateData(EnergyMarketSchema, data);
    
    // Log e metriche della richiesta riuscita
    await logger.logRequest(request, 200, startTime);
    await metrics.recordRequest(200, performance.now() - startTime);
    
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Errore nel recupero dei dati del mercato:', error);
    
    // Log e metriche dell'errore
    await logger.logRequest(request, 500, startTime, error as Error);
    await metrics.recordRequest(500, performance.now() - startTime);
    
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati del mercato' },
      { status: 500 }
    );
  }
} 