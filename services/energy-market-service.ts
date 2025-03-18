import { MarketData } from '../types/asset';

export class EnergyMarketService {
  async getMarketData(): Promise<MarketData> {
    // Implementazione mock per il test
    return {
      prices: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(2024, 0, 1, i),
        price: 50 + Math.random() * 100
      })),
      demand: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(2024, 0, 1, i),
        value: 1000 + Math.random() * 500
      }))
    };
  }
} 