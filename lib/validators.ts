import { z } from 'zod';

// Schema per i dati del mercato dell'energia
export const EnergyMarketSchema = z.object({
  timestamp: z.string().datetime(),
  currentPrice: z.number().min(0).max(1000),
  dayAheadPrice: z.number().min(0).max(1000),
  volume: z.number().min(0),
  marketTrend: z.enum(['up', 'down', 'stable']),
  volatilityIndex: z.number().min(0).max(1),
  peakHourPrice: z.number().min(0).max(1000),
  offPeakPrice: z.number().min(0).max(1000),
  renewablePercentage: z.number().min(0).max(100),
  demandForecast: z.number().min(0),
  supplyForecast: z.number().min(0),
  congestionZones: z.object({
    north: z.number().min(0).max(1000),
    central: z.number().min(0).max(1000),
    south: z.number().min(0).max(1000),
    islands: z.number().min(0).max(1000)
  }),
  tradingVolume: z.number().min(0),
  lastUpdate: z.string().datetime()
});

// Schema per i dati meteo
export const WeatherSchema = z.object({
  timestamp: z.string().datetime(),
  temperature: z.number().min(-20).max(50),
  solar_irradiance: z.number().min(0).max(1500),
  cloud_cover: z.number().min(0).max(100),
  wind_speed: z.number().min(0).max(50)
});

// Schema per i KPI del BESS
export const BessKPISchema = z.object({
  timestamp: z.string().datetime(),
  state_of_charge: z.number().min(0).max(100),
  efficiency: z.number().min(0).max(100),
  temperature: z.number().min(0).max(60),
  cycle_count: z.number().int().min(0),
  health: z.number().min(0).max(100)
});

// Funzione generica per la validazione
export async function validateData<T extends z.ZodType>(schema: T, data: unknown): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Errore di validazione: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
} 