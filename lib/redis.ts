import { RedisInterface, RedisConfig } from './redis-interface';
import RedisMockClient from './redis-mock';
import RedisRealClient from './redis-client';

// Determina se Redis è disabilitato dalle variabili d'ambiente
export const isRedisDisabled = process.env.REDIS_DISABLED === 'true';
export const isRedisEnabled = !isRedisDisabled;

/**
 * Factory per creare un client Redis appropriato
 * Seleziona automaticamente tra client reale e mock in base alle condizioni
 */
function createRedisClient(): RedisInterface {
  // Se Redis è esplicitamente disabilitato via env, usa sempre il mock
  if (isRedisDisabled) {
    console.log('[Redis Factory] Redis è disabilitato via env. Utilizzo del client mock.');
    return RedisMockClient;
  }

  // Verifica che le credenziali Redis siano disponibili
  const redisUrl = process.env.REDIS_URL;
  const redisToken = process.env.REDIS_TOKEN;

  // Messaggi informativi sul motivo del fallback al mock
  if (!redisUrl && !redisToken) {
    console.log('[Redis Factory] URL e token Redis mancanti. Utilizzo del client mock.');
    return RedisMockClient;
  }
  
  if (!redisUrl) {
    console.warn('[Redis Factory] URL Redis mancante nella configurazione.');
  }
  
  if (!redisToken) {
    console.warn('[Redis Factory] Token Redis mancante nella configurazione.');
  }
  
  // Se manca uno dei due parametri, usa il mock
  if (!redisUrl || !redisToken) {
    console.log('[Redis Factory] Credenziali Redis incomplete. Utilizzo del client mock.');
    return RedisMockClient;
  }
  
  // Prova a inizializzare il client reale
  const config: RedisConfig = {
    url: redisUrl,
    token: redisToken
  };
  
  const realClient = new RedisRealClient(config);
  
  // Se l'inizializzazione fallisce, usa il mock
  if (!realClient.isAvailable()) {
    console.log('[Redis Factory] Inizializzazione del client reale fallita. Utilizzo del client mock.');
    return RedisMockClient;
  }
  
  return realClient;
}

// Inizializza il client Redis
const redisClient = createRedisClient();

// Esporta il client Redis come default export
export default redisClient; 