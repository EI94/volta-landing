/**
 * Interfaccia comune per i client Redis, sia reali che mock
 * Questo ci permette di utilizzare la stessa implementazione indipendentemente 
 * dalla disponibilità di Redis
 */

// Tipo per le opzioni di Redis con il parametro 'ex'
export type RedisSetOptions = {
  ex?: number;
};

export interface RedisInterface {
  // Metodi base di Redis
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, options?: RedisSetOptions) => Promise<string | null>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  
  // Pipeline per operazioni batch
  pipeline: () => RedisPipeline;
  
  // Url è necessario per evitare errori con alcune librerie
  url: string;
  
  // Metodo per verificare se il client è funzionante
  isAvailable: () => boolean;
}

export interface RedisPipeline {
  get: (key: string) => RedisPipeline;
  set: (key: string, value: unknown, options?: RedisSetOptions) => RedisPipeline;
  incr: (key: string) => RedisPipeline;
  expire: (key: string, seconds: number) => RedisPipeline;
  exec: () => Promise<Array<[Error | null, unknown]>>;
}

// Configurazione per inizializzare Redis
export interface RedisConfig {
  url?: string;
  token?: string;
  disableRedis?: boolean;
} 