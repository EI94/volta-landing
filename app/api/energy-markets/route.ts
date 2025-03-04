import { NextResponse } from 'next/server';
import { validateData } from '@/lib/validators';
import { rateLimiter } from '@/lib/rate-limiter';
import { cacheData } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

// Definisci qui la tua API_KEY per i dati di mercato (es. GME o altri provider)
// Questa API_KEY sarà utilizzata in produzione per le chiamate ai servizi di dati di mercato
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MARKET_API_KEY = process.env.MARKET_API_KEY || '';

// Tipi di mercato disponibili
export type MarketType = 'MGP' | 'MI' | 'MD' | 'MSD';

interface MarketData {
  timestamp: string;
  marketType: MarketType;
  price: number;
  volume: number;
  zone: string;
  forecast?: Array<{
    timestamp: string;
    price: number;
  }>;
}

// Schema Zod per la validazione dei dati di mercato
const MarketSchema = z.object({
  timestamp: z.string().datetime(),
  marketType: z.enum(['MGP', 'MI', 'MD', 'MSD']),
  price: z.number().nonnegative(),
  volume: z.number().nonnegative(),
  zone: z.string(),
  forecast: z.array(
    z.object({
      timestamp: z.string().datetime(),
      price: z.number().nonnegative()
    })
  ).optional()
});

// Funzione per ottenere i dati reali dai mercati (da sostituire con API reali)
async function fetchMarketData(marketType: MarketType, zone: string): Promise<MarketData> {
  // Questo è un placeholder. In futuro, sostituire con chiamate API reali
  // ad esempio, al GME (Gestore Mercati Energetici) o altri provider di dati

  try {
    // Simulazione chiamata API esterna
    // In produzione, dovresti utilizzare fetch() per chiamare l'API reale, per esempio:
    /*
    const response = await fetch(`https://api.energymarket.com/data?marketType=${marketType}&zone=${zone}`, {
      headers: {
        'Authorization': `Bearer ${MARKET_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Errore nella chiamata API: ${response.status}`);
    }
    
    const data = await response.json();
    return data as MarketData;
    */

    // NOTA: Questo è solo un esempio, in produzione dovrai implementare
    // la logica per connetterti all'API del fornitore di dati
    
    // ----- INIZIO SIMULAZIONE DATI -----
    const now = new Date();
    let basePrice = 0;
    
    // Prezzi base per diversi mercati (simulati)
    switch (marketType) {
      case 'MGP': // Mercato del Giorno Prima
        basePrice = 70 + Math.random() * 30;
        break;
      case 'MI': // Mercato Infragiornaliero
        basePrice = 75 + Math.random() * 35;
        break;
      case 'MD': // Mercato del Dispacciamento
        basePrice = 80 + Math.random() * 40;
        break;
      case 'MSD': // Mercato per il Servizio di Dispacciamento
        basePrice = 90 + Math.random() * 50;
        break;
      default:
        basePrice = 60 + Math.random() * 20;
    }
    
    // Fattore zonale (simulato)
    const zoneFactor: Record<string, number> = {
      'NORD': 1.0,
      'CNOR': 1.05,
      'CSUD': 1.1,
      'SUD': 1.15,
      'SICI': 1.2,
      'SARD': 1.25
    };
    
    const zoneMultiplier = zoneFactor[zone] || 1;
    const price = basePrice * zoneMultiplier;
    
    // Genera previsioni per le prossime 24 ore
    const forecast = Array.from({ length: 24 }, (_, i) => {
      // Varia il prezzo in base all'ora del giorno (simulazione pattern intraday)
      const hour = (now.getHours() + i) % 24;
      let hourlyFactor = 1;
      
      // Simulazione pattern intraday
      if (hour >= 8 && hour <= 10) hourlyFactor = 1.2; // Picco mattutino
      else if (hour >= 17 && hour <= 20) hourlyFactor = 1.3; // Picco serale
      else if (hour >= 0 && hour <= 5) hourlyFactor = 0.7; // Bassa domanda notturna
      
      const forecastPrice = price * hourlyFactor * (0.9 + Math.random() * 0.2); // Aggiunge randomicità
      
      return {
        timestamp: new Date(now.getTime() + i * 3600000).toISOString(),
        price: forecastPrice
      };
    });
    
    return {
      timestamp: now.toISOString(),
      marketType,
      price,
      volume: 2000 + Math.random() * 8000, // Volume simulato
      zone,
      forecast
    };
    // ----- FINE SIMULAZIONE DATI -----
    
  } catch (error) {
    console.error(`Errore nel recupero dei dati di mercato ${marketType}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const url = new URL(request.url);
  const marketType = (url.searchParams.get('market') as MarketType) || 'MGP';
  const zone = url.searchParams.get('zone') || 'NORD';
  
  try {
    // Controllo rate limiting
    const rateLimitResult = await rateLimiter(request);
    if (!rateLimitResult.success) {
      const error = new Error('Troppe richieste. Riprova più tardi.');
      await logger.logRequest(request, 429, startTime, error);
      await metrics.recordRequest(
        'GET', 
        request.url, 
        429, 
        performance.now() - startTime, 
        request.headers.get('x-forwarded-for') || 'anonymous',
        request.headers.get('user-agent') || 'unknown'
      );
      return rateLimitResult.response;
    }

    // Recupera i dati dal cache o chiama l'API
    const cacheKey = `energy-market:${marketType}:${zone}`;
    const data = await cacheData(
      cacheKey,
      async () => fetchMarketData(marketType, zone),
      900 // Cache per 15 minuti
    );

    // Valida i dati
    const validatedData = await validateData(MarketSchema, data);
    
    // Log e metriche della richiesta riuscita
    await logger.logRequest(request, 200, startTime);
    await metrics.recordRequest(
      'GET', 
      request.url, 
      200, 
      performance.now() - startTime, 
      request.headers.get('x-forwarded-for') || 'anonymous',
      request.headers.get('user-agent') || 'unknown'
    );
    
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Errore nel recupero dei dati di mercato:', error);
    
    // Log e metriche dell'errore
    await logger.logRequest(request, 500, startTime, error as Error);
    await metrics.recordRequest(
      'GET', 
      request.url, 
      500, 
      performance.now() - startTime, 
      request.headers.get('x-forwarded-for') || 'anonymous',
      request.headers.get('user-agent') || 'unknown'
    );
    
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati di mercato' },
      { status: 500 }
    );
  }
} 