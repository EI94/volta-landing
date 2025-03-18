import { OptimizationResult } from '../types/asset';

export class MetricsCollector {
  async recordOptimization(assetId: string, result: OptimizationResult): Promise<void> {
    // Implementazione mock per il test
    console.log(`Metriche registrate per asset ${assetId}:`, {
      timestamp: new Date(),
      expectedRevenue: result.expectedRevenue,
      confidence: result.confidence
    });
  }
} 