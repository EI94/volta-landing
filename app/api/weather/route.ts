import { NextResponse } from 'next/server';
import { validateData, WeatherSchema } from '@/lib/validators';
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
      'weather:current',
      async () => {
        const now = new Date();
        return {
          timestamp: now.toISOString(),
          temperature: 15 + Math.random() * 20, // °C
          humidity: 40 + Math.random() * 40, // %
          cloud_cover: Math.random() * 100, // %
          solar_irradiance: Math.max(0, 800 - Math.random() * 400), // W/m2
          forecast: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(now.getTime() + i * 3600000).toISOString(),
            temperature: 15 + Math.random() * 20,
            solar_irradiance: Math.max(0, 800 - Math.random() * 400),
          })),
        };
      },
      { ttl: 300 } // Cache per 5 minuti
    );

    // Valida i dati
    const validatedData = await validateData(WeatherSchema, data);
    
    // Log e metriche della richiesta riuscita
    await logger.logRequest(request, 200, startTime);
    await metrics.recordRequest(200, performance.now() - startTime);
    
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Errore nel recupero dei dati meteo:', error);
    
    // Log e metriche dell'errore
    await logger.logRequest(request, 500, startTime, error as Error);
    await metrics.recordRequest(500, performance.now() - startTime);
    
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati meteo' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; 