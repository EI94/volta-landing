import { RedisInterface, RedisPipeline, RedisSetOptions } from './redis-interface';

/**
 * Mock client di Redis per l'utilizzo quando Redis è disabilitato
 * Implementa l'interfaccia RedisInterface per compatibilità con il client reale
 */

// Tipo per i valori memorizzati
type StoredValue = {
  value: unknown;
  expiry?: number;
};

// Creiamo un store in-memory per simulare il comportamento di Redis
const inMemoryStore: Record<string, StoredValue> = {};

/**
 * Implementazione di un client Redis mock che usa uno store in-memory
 */
class RedisMockClient implements RedisInterface {
  // Proprietà URL impostata per evitare errori
  url: string = 'mock://redis.mock';
  
  constructor() {
    console.log('[Redis Mock] Client mock inizializzato');
  }
  
  /**
   * Verifica se un valore in cache è ancora valido
   */
  private isValidEntry(key: string): boolean {
    if (!inMemoryStore[key]) return false;
    
    if (inMemoryStore[key].expiry && inMemoryStore[key].expiry < Date.now()) {
      // Valore scaduto, rimuoviamolo
      delete inMemoryStore[key];
      return false;
    }
    
    return true;
  }
  
  /**
   * Recupera un valore dalla cache
   */
  async get<T>(key: string): Promise<T | null> {
    console.log(`[Redis Mock] GET: ${key}`);
    
    if (this.isValidEntry(key)) {
      return inMemoryStore[key].value as T;
    }
    
    return null;
  }
  
  /**
   * Salva un valore in cache
   */
  async set<T>(key: string, value: T, options?: RedisSetOptions): Promise<string> {
    console.log(`[Redis Mock] SET: ${key}`);
    
    inMemoryStore[key] = {
      value,
      expiry: options?.ex ? Date.now() + options.ex * 1000 : undefined
    };
    
    return 'OK';
  }
  
  /**
   * Incrementa un contatore
   */
  async incr(key: string): Promise<number> {
    console.log(`[Redis Mock] INCR: ${key}`);
    
    if (!this.isValidEntry(key) || typeof inMemoryStore[key].value !== 'number') {
      inMemoryStore[key] = { value: 0 };
    }
    
    inMemoryStore[key].value = (inMemoryStore[key].value as number) + 1;
    return inMemoryStore[key].value as number;
  }
  
  /**
   * Imposta il tempo di scadenza per un valore
   */
  async expire(key: string, seconds: number): Promise<number> {
    console.log(`[Redis Mock] EXPIRE: ${key}`);
    
    if (inMemoryStore[key]) {
      inMemoryStore[key].expiry = Date.now() + seconds * 1000;
      return 1;
    }
    
    return 0;
  }
  
  /**
   * Crea una pipeline per eseguire più comandi in batch
   */
  pipeline(): RedisPipeline {
    const commands: Array<() => Promise<unknown>> = [];
    
    const pipelineInstance: RedisPipeline = {
      get: (key: string) => {
        console.log(`[Redis Mock] Pipeline GET: ${key}`);
        commands.push(() => this.get(key));
        return pipelineInstance;
      },
      
      set: (key: string, value: unknown, options?: RedisSetOptions) => {
        console.log(`[Redis Mock] Pipeline SET: ${key}`);
        commands.push(() => this.set(key, value, options));
        return pipelineInstance;
      },
      
      incr: (key: string) => {
        console.log(`[Redis Mock] Pipeline INCR: ${key}`);
        commands.push(() => this.incr(key));
        return pipelineInstance;
      },
      
      expire: (key: string, seconds: number) => {
        console.log(`[Redis Mock] Pipeline EXPIRE: ${key}`);
        commands.push(() => this.expire(key, seconds));
        return pipelineInstance;
      },
      
      exec: async (): Promise<Array<[Error | null, unknown]>> => {
        console.log(`[Redis Mock] Pipeline EXEC con ${commands.length} comandi`);
        
        const results: Array<[Error | null, unknown]> = [];
        for (const command of commands) {
          try {
            const result = await command();
            results.push([null, result]);
          } catch (error) {
            results.push([error instanceof Error ? error : new Error('Unknown error'), null]);
          }
        }
        
        return results;
      }
    };
    
    return pipelineInstance;
  }
  
  /**
   * Verifica se il client è disponibile
   */
  isAvailable(): boolean {
    return true; // Il mock client è sempre disponibile
  }
}

// Esporta un'istanza singleton del client mock
const redisMockClient = new RedisMockClient();
export default redisMockClient; 