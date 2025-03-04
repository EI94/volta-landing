/**
 * Interfaccia per i dati del mercato energetico
 */
export interface EnergyMarketData {
  timestamp: string;
  currentPrice: number;
  dayAheadPrice: number;
  volume: number;
  marketTrend: 'up' | 'down' | 'stable';
  volatilityIndex: number;
  peakHourPrice: number;
  offPeakPrice: number;
  renewablePercentage: number;
  demandForecast: number;
  supplyForecast: number;
  congestionZones: {
    north: number;
    central: number;
    south: number;
    islands: number;
  };
  tradingVolume: number;
  lastUpdate: string;
}

/**
 * Funzione che recupera lo stato attuale del mercato energetico
 * Questa funzione può essere modificata per connettersi a un'API esterna reale 
 * o utilizzare dati simulati
 */
export async function fetchMarketStatus(): Promise<EnergyMarketData> {
  console.log("Recupero dati del mercato energetico");
  
  // Per ora, restituiamo dati simulati
  const currentDate = new Date();
  
  // Genera un trend casuale
  const trends = ['up', 'down', 'stable'] as const;
  const randomTrend = trends[Math.floor(Math.random() * trends.length)];
  
  // Base price con variazione casuale
  const basePrice = 65 + (Math.random() * 20 - 10);  // Valore tra 55 e 75
  
  // Dati di simulazione per il mercato energetico
  const marketData: EnergyMarketData = {
    timestamp: currentDate.toISOString(),
    currentPrice: basePrice,
    dayAheadPrice: basePrice * (1 + (Math.random() * 0.1 - 0.05)),  // ±5% rispetto al prezzo base
    volume: 12000 + (Math.random() * 2000 - 1000),  // Valore tra 11000 e 13000 MWh
    marketTrend: randomTrend,
    volatilityIndex: 0.15 + (Math.random() * 0.1 - 0.05),  // Valore tra 0.1 e 0.2
    peakHourPrice: basePrice * 1.2 + (Math.random() * 10 - 5),  // Circa 20% più alto del prezzo base
    offPeakPrice: basePrice * 0.8 + (Math.random() * 8 - 4),  // Circa 20% più basso del prezzo base
    renewablePercentage: 35 + (Math.random() * 10 - 5),  // Valore tra 30% e 40%
    demandForecast: 45000 + (Math.random() * 5000 - 2500),  // Valore tra 42500 e 47500 MWh
    supplyForecast: 46000 + (Math.random() * 4000 - 2000),  // Valore tra 44000 e 48000 MWh
    congestionZones: {
      north: basePrice * (1 + (Math.random() * 0.06 - 0.03)),  // ±3% rispetto al prezzo base
      central: basePrice * (1 + (Math.random() * 0.04 - 0.02)),  // ±2% rispetto al prezzo base
      south: basePrice * (1 + (Math.random() * 0.08 - 0.04)),  // ±4% rispetto al prezzo base
      islands: basePrice * (1 + (Math.random() * 0.1 - 0.05)),  // ±5% rispetto al prezzo base
    },
    tradingVolume: 8500 + (Math.random() * 1500 - 750),  // Valore tra 7750 e 9250 transazioni
    lastUpdate: currentDate.toISOString()
  };
  
  console.log("Dati del mercato energetico generati:", marketData);
  
  return marketData;
} 