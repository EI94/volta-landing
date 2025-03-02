import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Configurazione Redis per il rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

interface RateLimitConfig {
  limit: number;      // Numero massimo di richieste
  window: number;     // Finestra temporale in secondi
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 100,        // 100 richieste
  window: 60         // per minuto
};

export async function rateLimiter(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
    const key = `rate-limit:${ip}`;

    // Recupera il contatore attuale
    const counter = await redis.get<number>(key) || 0;

    if (counter >= config.limit) {
      return {
        success: false,
        message: 'Limite di richieste superato. Riprova più tardi.'
      };
    }

    // Incrementa il contatore e imposta la scadenza
    await redis.setex(key, config.window, counter + 1);

    return {
      success: true,
      remaining: config.limit - (counter + 1)
    };
  } catch (error) {
    console.error('Errore nel rate limiting:', error);
    // In caso di errore, permettiamo la richiesta
    return { success: true, remaining: 0 };
  }
} 