import redisClient, { isRedisEnabled } from './redis';
import { NextRequest, NextResponse } from 'next/server';

// Configurazione di default per il rate limiting
const DEFAULT_CONFIG = {
  limit: 100,         // Numero massimo di richieste
  window: 60,         // Finestra di tempo in secondi
  headers: true       // Includi headers X-RateLimit nei response
};

/**
 * Rate limiter basato su Redis per le API routes
 * 
 * Se Redis è disabilitato, tutte le richieste sono consentite
 * 
 * @param req NextRequest
 * @param config Configurazione del rate limiter
 * @returns Oggetto con proprietà success, e opzionale response se il limite è superato
 */
export async function rateLimiter(
  req: NextRequest,
  config: typeof DEFAULT_CONFIG = DEFAULT_CONFIG
): Promise<{ success: boolean, response?: NextResponse }> {
  // Se Redis è disabilitato, non applicare rate limiting
  if (!isRedisEnabled) {
    // console.log('[Rate Limiter] Redis disabilitato, limite non applicato');
    return { success: true };
  }

  // Crea una chiave unica per l'IP
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const key = `rate-limit:${ip}`;

  try {
    // Recupera il contatore attuale
    let counter = 0;
    try {
      const result = await redisClient.get<string>(key);
      counter = Number(result || 0);
    } catch (getError) {
      console.error('[Rate Limiter] Errore nel recupero del contatore:', getError);
      // Se c'è un errore nel recupero, non blocchiamo la richiesta
      return { success: true };
    }

    // Verifica se il limite è stato superato
    if (counter >= config.limit) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            error: 'Troppe richieste', 
            message: 'Hai superato il limite di richieste consentite. Riprova più tardi.' 
          },
          { status: 429 }
        )
      };
    }

    // Incrementa il contatore
    try {
      await redisClient.incr(key);
    } catch (incrError) {
      console.error('[Rate Limiter] Errore nell\'incremento del contatore:', incrError);
      // Se c'è un errore nell'incremento, non blocchiamo la richiesta
    }
    
    // Imposta la scadenza se è la prima richiesta
    if (counter === 0) {
      try {
        await redisClient.expire(key, config.window);
      } catch (expireError) {
        console.error('[Rate Limiter] Errore nell\'impostazione della scadenza:', expireError);
        // Se c'è un errore nell'impostazione della scadenza, non blocchiamo la richiesta
      }
    }

    return { success: true };
  } catch (error) {
    // In caso di errore generico, non blocchiamo la richiesta
    console.error('[Rate Limiter] Errore generale:', error);
    return { success: true };
  }
} 