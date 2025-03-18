import { AssetData } from '../types/asset';

export class PvService {
  async getPvData(assetId: string): Promise<AssetData> {
    // Implementazione mock per il test
    return {
      id: assetId,
      type: 'pv',
      location: {
        latitude: 45.4642,
        longitude: 9.1900
      },
      capacity: 50, // MWp
      specifications: {
        panelType: 'monocrystalline',
        efficiency: 0.21,
        degradationRate: 0.005 // % per anno
      }
    };
  }
} 