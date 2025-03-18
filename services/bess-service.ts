import { AssetData } from '../types/asset';

export class BessService {
  async getBessData(assetId: string): Promise<AssetData> {
    // Implementazione mock per il test
    return {
      id: assetId,
      type: 'bess',
      location: {
        latitude: 45.4642,
        longitude: 9.1900
      },
      capacity: 100, // MWh
      specifications: {
        powerRating: 50, // MW
        roundTripEfficiency: 0.95,
        degradationRate: 0.02 // % per anno
      }
    };
  }
} 