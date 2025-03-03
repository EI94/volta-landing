import { Redis } from '@upstash/redis';
import { mockRedisClient } from './redis-mock';

// Assicuriamoci che Redis venga inizializzato correttamente
export default function getRedisClient() {
  // Se Redis è disabilitato, restituiamo un client fittizio
  if (process.env.REDIS_DISABLED === 'true') {
    console.log('Redis disabilitato, utilizzo mock client');
    return mockRedisClient;
  }
  
  // Verifichiamo che URL e token siano definiti
  if (!process.env.REDIS_URL) {
    console.warn('[Upstash Redis] The \'url\' property is missing or undefined in your Redis config.');
    return mockRedisClient;
  }
  
  if (!process.env.REDIS_TOKEN) {
    console.warn('[Upstash Redis] The \'token\' property is missing or undefined in your Redis config.');
    return mockRedisClient;
  }
  
  // Inizializziamo il client Redis
  try {
    return new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN
    });
  } catch (error) {
    console.error('Errore nell\'inizializzazione di Redis:', error);
    return mockRedisClient;
  }
}

// Implementiamo un client Redis fittizio per quando Redis è disabilitato
function createMockRedisClient() {
  return {
    get: async () => null,
    set: async () => true,
    incr: async () => 1,
    expire: async () => true,
    // Aggiungi altri metodi se necessario
  };
} 