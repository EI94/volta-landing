import redisClient, { isRedisEnabled } from './redis';

// Durata predefinita della cache in secondi (10 minuti)
const DEFAULT_CACHE_DURATION = 600;

/**
 * Cache dei dati utilizzando Redis
 * 
 * Se Redis è disabilitato, esegue la funzione di recupero dati senza caching
 * 
 * @param key Chiave per la cache
 * @param fetchData Funzione per recuperare i dati se non sono in cache
 * @param ttl Tempo di vita della cache in secondi (default: 10 minuti)
 * @returns I dati recuperati (dalla cache o dalla funzione fetchData)
 */
export async function cacheData<T>(
  key: string,
  fetchData: () => Promise<T>,
  ttl: number = DEFAULT_CACHE_DURATION
): Promise<T> {
  // Se Redis è disabilitato, esegui direttamente la funzione
  if (!isRedisEnabled) {
    return fetchData();
  }
  
  // Prova a recuperare dal cache
  try {
    const cachedData = await redisClient.get<T>(key);
    
    if (cachedData) {
      console.log(`[Cache] Hit per ${key}`);
      return cachedData;
    }
  } catch (readError) {
    console.error(`[Cache] Errore nella lettura della cache per ${key}:`, readError);
    // Prosegui con il recupero dei dati freschi
  }
  
  console.log(`[Cache] Miss per ${key}, recupero dati freschi`);
  
  // Recupera i dati attraverso la funzione
  try {
    const data = await fetchData();
    
    // Prova a salvare in cache
    try {
      await redisClient.set(key, data, { ex: ttl });
      console.log(`[Cache] Dati salvati in cache per ${key} (TTL: ${ttl}s)`);
    } catch (writeError) {
      console.error(`[Cache] Errore nel salvataggio in cache per ${key}:`, writeError);
      // Prosegui restituendo i dati recuperati
    }
    
    return data;
  } catch (fetchError) {
    console.error(`[Cache] Errore nel recupero dei dati per ${key}:`, fetchError);
    throw fetchError; // Propaga l'errore di recupero dati
  }
} 