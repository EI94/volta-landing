import { z } from 'zod';

// Schema per i dati del mercato dell'energia
export const EnergyMarketSchema = z.object({
  timestamp: z.string().datetime(),
  price: z.number().min(0).max(1000),
  demand: z.number().min(0).max(10000),
  renewable_percentage: z.number().min(0).max(100)
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