import { Redis, SetCommandOptions } from '@upstash/redis';
import { RedisInterface, RedisPipeline, RedisConfig } from './redis-interface';

// Definiamo un tipo per le opzioni di Redis con il parametro 'ex'
type RedisSetOptions = {
  ex?: number;
};

/**
 * Classe che implementa l'interfaccia RedisInterface utilizzando il client Redis reale
 */
class RedisRealClient implements RedisInterface {
  private client: Redis;
  private isInitialized: boolean = false;
  readonly url: string;
  
  constructor(config: RedisConfig) {
    const { url, token } = config;
    
    if (!url || !token) {
      this.isInitialized = false;
      this.url = '';
      this.client = {} as Redis;
      return;
    }
    
    try {
      this.client = new Redis({
        url,
        token,
      });
      
      this.url = url;
      this.isInitialized = true;
      console.log('[Redis] Client reale inizializzato correttamente');
    } catch (error) {
      console.error('[Redis] Errore nell\'inizializzazione del client Redis:', error);
      this.isInitialized = false;
      this.url = '';
      this.client = {} as Redis;
    }
  }
  
  /**
   * Verifica se il client è disponibile
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Recupera un valore dalla cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isInitialized) {
      return null;
    }
    
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`[Redis] Errore nel recupero della chiave ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Salva un valore in cache
   */
  async set<T>(key: string, value: T, options?: RedisSetOptions): Promise<string | null> {
    if (!this.isInitialized) {
      return null;
    }
    
    try {
      // Convertiamo le opzioni nel formato richiesto da Upstash Redis
      const redisOptions: SetCommandOptions | undefined = options?.ex 
        ? { ex: options.ex } 
        : undefined;
        
      // Upstash Redis restituisce "OK" o un altro valore per alcune operazioni
      // Convertiamo il risultato in stringa per rispettare l'interfaccia
      const result = await this.client.set(key, value, redisOptions);
      return result?.toString() || 'OK';
    } catch (error) {
      console.error(`[Redis] Errore nel salvataggio della chiave ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Incrementa un contatore
   */
  async incr(key: string): Promise<number> {
    if (!this.isInitialized) {
      return 0;
    }
    
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`[Redis] Errore nell'incremento della chiave ${key}:`, error);
      return 0;
    }
  }
  
  /**
   * Imposta il tempo di scadenza per un valore
   */
  async expire(key: string, seconds: number): Promise<number> {
    if (!this.isInitialized) {
      return 0;
    }
    
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.error(`[Redis] Errore nell'impostazione della scadenza per la chiave ${key}:`, error);
      return 0;
    }
  }
  
  /**
   * Crea una pipeline per eseguire più comandi in batch
   */
  pipeline(): RedisPipeline {
    if (!this.isInitialized) {
      // Se non inizializzato, restituisci una pipeline mock che non fa nulla
      return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        get: (_unused: string) => this.pipeline(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set: (_unused: string, _value: unknown, _opts?: RedisSetOptions) => this.pipeline(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        incr: (_unused: string) => this.pipeline(),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expire: (_unused: string, _seconds: number) => this.pipeline(),
        exec: async () => []
      };
    }
    
    // Crea una pipeline reale
    const pipeline = this.client.pipeline();
    
    return {
      get: (key: string) => {
        pipeline.get(key);
        return this.pipeline();
      },
      set: (key: string, value: unknown, options?: RedisSetOptions) => {
        // Convertiamo le opzioni nel formato richiesto da Upstash Redis
        const redisOptions: SetCommandOptions | undefined = options?.ex 
          ? { ex: options.ex } 
          : undefined;
          
        pipeline.set(key, value, redisOptions);
        return this.pipeline();
      },
      incr: (key: string) => {
        pipeline.incr(key);
        return this.pipeline();
      },
      expire: (key: string, seconds: number) => {
        pipeline.expire(key, seconds);
        return this.pipeline();
      },
      exec: async () => {
        try {
          return await pipeline.exec();
        } catch (error) {
          console.error('[Redis] Errore nell\'esecuzione della pipeline:', error);
          return [];
        }
      }
    };
  }
}

export default RedisRealClient; 