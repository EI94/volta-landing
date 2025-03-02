import { NextResponse } from 'next/server';
import { validateData, WeatherSchema } from '@/lib/validators';
import { rateLimiter } from '@/lib/rate-limiter';
import { cacheData } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';
import type { NextRequest } from 'next/server';

// Definisci qui la tua API_KEY di OpenWeatherMap
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';

if (!OPENWEATHER_API_KEY) {
  console.warn('API Key OpenWeatherMap non configurata. La funzionalità meteo potrebbe non funzionare correttamente.');
}

// Funzione per ottenere i dati meteo da OpenWeatherMap
async function fetchWeatherData(city: string) {
  try {
    // Fetch dei dati meteo attuali
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!currentResponse.ok) {
      throw new Error(`OpenWeatherMap API error: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    
    // Fetch delle previsioni orarie per le prossime 24 ore
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`OpenWeatherMap Forecast API error: ${forecastResponse.status}`);
    }
    
    const forecastData = await forecastResponse.json();
    
    // Estrai i dati rilevanti dalle previsioni (prossime 24 ore)
    const forecastHourly = forecastData.list.slice(0, 8); // OpenWeatherMap fornisce previsioni ogni 3 ore
    
    // Funzione per calcolare l'irraggiamento solare in base alle condizioni meteo
    const calculateSolarIrradiance = (weatherId: number, clouds: number, timeOfDay: number) => {
      // Valore massimo potenziale
      const maxIrradiance = 1000; // W/m2
      
      // Fattore ora del giorno (0 di notte, massimo durante le ore centrali)
      let dayFactor = 0;
      if (timeOfDay >= 6 && timeOfDay <= 18) {
        dayFactor = Math.sin(((timeOfDay - 6) / 12) * Math.PI);
      }
      
      // Fattore nuvolosità
      const cloudFactor = 1 - (clouds / 100);
      
      // Fattore condizioni meteo
      let weatherFactor = 1;
      if (weatherId >= 200 && weatherId < 600) { // Pioggia, temporali, neve
        weatherFactor = 0.2;
      } else if (weatherId >= 600 && weatherId < 700) { // Neve
        weatherFactor = 0.5;
      } else if (weatherId >= 700 && weatherId < 800) { // Atmosfera (nebbia, ecc.)
        weatherFactor = 0.6;
      } else if (weatherId === 800) { // Cielo sereno
        weatherFactor = 1;
      } else if (weatherId > 800) { // Nuvoloso
        weatherFactor = 0.7;
      }
      
      return Math.max(0, maxIrradiance * dayFactor * cloudFactor * weatherFactor);
    };
    
    // Converti i dati al formato utilizzato dall'applicazione
    const now = new Date();
    const currentHour = now.getHours();
    
    const weatherData = {
      timestamp: now.toISOString(),
      temperature: currentData.main.temp,
      humidity: currentData.main.humidity,
      cloud_cover: currentData.clouds.all,
      wind_speed: currentData.wind ? currentData.wind.speed : 0,
      solar_irradiance: calculateSolarIrradiance(
        currentData.weather[0].id,
        currentData.clouds.all,
        currentHour
      ),
      forecast: forecastHourly.map((item: any, index: number) => {
        const itemDate = new Date(item.dt * 1000);
        const itemHour = itemDate.getHours();
        
        return {
          timestamp: itemDate.toISOString(),
          temperature: item.main.temp,
          solar_irradiance: calculateSolarIrradiance(
            item.weather[0].id,
            item.clouds.all,
            itemHour
          ),
        };
      }),
    };
    
    return weatherData;
  } catch (error) {
    console.error('Errore nel recupero dei dati meteo:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  const url = new URL(request.url);
  const city = url.searchParams.get('city') || 'Roma,IT';
  
  try {
    // Controllo rate limiting
    const rateLimitResult = await rateLimiter(request);
    if (!rateLimitResult.success) {
      const error = new Error('Troppe richieste. Riprova più tardi.');
      await logger.logRequest(request, 429, startTime, error);
      await metrics.recordRequest(429, performance.now() - startTime);
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }

    // Recupera i dati dal cache o chiama l'API
    const cacheKey = `weather:${city}`;
    const data = await cacheData(
      cacheKey,
      async () => fetchWeatherData(city),
      { ttl: 1800 } // Cache per 30 minuti
    );

    // Valida i dati
    const validatedData = await validateData(WeatherSchema, data);
    
    // Log e metriche della richiesta riuscita
    await logger.logRequest(request, 200, startTime);
    await metrics.recordRequest(200, performance.now() - startTime);
    
    return NextResponse.json(validatedData);
  } catch (error) {
    console.error('Errore nel recupero dei dati meteo:', error);
    
    // Log e metriche dell'errore
    await logger.logRequest(request, 500, startTime, error as Error);
    await metrics.recordRequest(500, performance.now() - startTime);
    
    return NextResponse.json(
      { error: 'Errore nel recupero dei dati meteo' },
      { status: 500 }
    );
  }
} 