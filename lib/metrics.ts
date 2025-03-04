import { RedisInterface } from './redis-interface';
import redisClient, { isRedisEnabled } from './redis';

/**
 * Classe per la raccolta delle metriche delle API
 */
export class MetricsCollector {
  private redis: RedisInterface;
  private readonly WINDOW_SIZE = 3600;

  constructor(redis: RedisInterface) {
    this.redis = redis;
    
    // Messaggio log iniziale
    if (!isRedisEnabled) {
      console.log('[MetricsCollector] Redis disabilitato, metriche saranno solo in console');
    }
  }

  /**
   * Registra una richiesta API
   * @param method Metodo HTTP
   * @param path Percorso dell'API
   * @param statusCode Codice di stato HTTP
   * @param responseTime Tempo di risposta in ms
   * @param ip Indirizzo IP del client
   * @param userAgent User agent del client
   */
  async recordRequest(
    method: string,
    path: string,
    statusCode: number,
    responseTime: number,
    ip: string,
    userAgent: string
  ): Promise<void> {
    // Crea oggetto con i dettagli della richiesta
    const requestInfo = {
      timestamp: new Date().toISOString(),
      method,
      path,
      ip,
      userAgent,
      responseTime,
      statusCode
    };

    // Registra sempre i dettagli in console
    console.log(requestInfo);

    // Se Redis è disabilitato, termina qui
    if (!isRedisEnabled) {
      return;
    }

    try {
      // Calcola il minuto corrente
      const currentMinute = Math.floor(Date.now() / 60000);
      
      // Incrementa il contatore delle richieste per il minuto corrente
      const requestCountKey = `api:requests:${currentMinute}`;
      await this.redis.incr(requestCountKey)
        .catch(err => {
          console.log(`[Metrics] Errore incremento contatore: ${err.message}`);
        });
      
      await this.redis.expire(requestCountKey, this.WINDOW_SIZE)
        .catch(err => {
          console.log(`[Metrics] Errore impostazione TTL: ${err.message}`);
        });

      // Aggiorna le metriche globali
      await this.redis.incr('api:total_requests')
        .catch(err => {
          console.log(`[Metrics] Errore incremento totale: ${err.message}`);
        });
    } catch (error) {
      console.error('[Metrics] Errore nel salvataggio delle metriche:', error);
      // Non serve fare altro, le metriche sono opzionali
    }
  }

  /**
   * Recupera le metriche delle richieste API
   * @returns Metriche delle richieste API
   */
  async getMetrics(): Promise<{
    totalRequests: number;
    requestsLastHour: number;
    requestsLastMinute: number;
  }> {
    // Se Redis è disabilitato, restituisci metriche vuote
    if (!isRedisEnabled) {
      return {
        totalRequests: 0,
        requestsLastHour: 0,
        requestsLastMinute: 0
      };
    }

    try {
      // Prova a recuperare il totale delle richieste
      let totalRequests = 0;
      let requestsLastHour = 0;
      let requestsLastMinute = 0;
      
      const totalRequestsResult = await this.redis.get<string>('api:total_requests')
        .catch(err => {
          console.log(`[Metrics] Errore recupero totale: ${err.message}`);
          return null;
        });
      
      totalRequests = Number(totalRequestsResult || 0);
      
      // Calcola le richieste nell'ultima ora
      const currentMinute = Math.floor(Date.now() / 60000);
      
      for (let i = 0; i < 60; i++) {
        const minute = currentMinute - i;
        try {
          const count = Number(
            await this.redis.get<string>(`api:requests:${minute}`)
              .catch(err => {
                console.log(`[Metrics] Errore recupero minuto ${minute}: ${err.message}`);
                return null;
              }) || 0
          );
          
          requestsLastHour += count;
          
          if (i === 0) {
            requestsLastMinute = count;
          }
        } catch (minuteError) {
          console.error(`[Metrics] Errore nel recupero dati per minuto ${minute}:`, minuteError);
        }
      }

      return {
        totalRequests,
        requestsLastHour,
        requestsLastMinute
      };
    } catch (error) {
      console.error('[Metrics] Errore nel recupero delle metriche:', error);
      return {
        totalRequests: 0,
        requestsLastHour: 0,
        requestsLastMinute: 0
      };
    }
  }
}

// Crea un'istanza singleton per l'intera applicazione
export const metricsCollector = new MetricsCollector(redisClient);

// Per compatibilità con il codice esistente
export const metrics = metricsCollector; 