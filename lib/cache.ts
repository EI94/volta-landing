import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

interface CacheConfig {
  ttl: number;  // Tempo di vita del cache in secondi
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 300     // 5 minuti di default
};

export async function cacheData<T>(
  key: string,
  getData: () => Promise<T>,
  config: CacheConfig = DEFAULT_CONFIG
): Promise<T> {
  try {
    // Prova a recuperare dal cache
    const cachedData = await redis.get<T>(key);
    if (cachedData) {
      console.log(`Cache hit per ${key}`);
      return cachedData;
    }

    // Se non presente nel cache, recupera i dati freschi
    console.log(`Cache miss per ${key}`);
    const freshData = await getData();
    
    // Salva nel cache con TTL
    await redis.setex(key, config.ttl, freshData);
    
    return freshData;
  } catch (error) {
    console.error(`Errore nel caching per ${key}:`, error);
    // In caso di errore del cache, recupera i dati freschi
    return getData();
  }
} 