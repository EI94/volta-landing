import { NextResponse } from 'next/server';
import { validateData, BessKPISchema } from '@/lib/validators';
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
      'bess-kpi:current',
      async () => {
        const now = new Date();
        return {
          timestamp: now.toISOString(),
          state_of_charge: 40 + Math.random() * 40, // Carica tra 40% e 80%
          efficiency: 85 + Math.random() * 10, // Efficienza tra 85% e 95%
          temperature: 25 + Math.random() * 10, // Temperatura tra 25°C e 35°C
          cycle_count: Math.floor(Math.random() * 50), // Numero di cicli 0-50
          health: 90 + Math.random() * 10 // Salute tra 90% e 100%
        };
      },
      { ttl: 300 } // Cache per 5 minuti
    );

    // Valida i dati
    const validatedData = await validateData(BessKPISchema, data);
    
    // Log e metriche della richiesta riuscita
    await logger.logRequest(request, 200, startTime);
    await metrics.recordRequest(200, performance.now() - startTime);
    
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Errore nel recupero dei KPI del BESS:', error);
    
    // Log e metriche dell'errore
    await logger.logRequest(request, 500, startTime, error as Error);
    await metrics.recordRequest(500, performance.now() - startTime);
    
    return NextResponse.json(
      { error: 'Errore nel recupero dei KPI del BESS' },
      { status: 500 }
    );
  }
} 