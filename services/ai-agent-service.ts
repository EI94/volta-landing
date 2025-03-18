import { RedisClient } from './redis-client';
import { EnergyMarketService } from './energy-market-service';
import { WeatherService } from './weather-service';
import { BessService } from './bess-service';
import { PvService } from './pv-service';
import { MetricsCollector } from './metrics-collector';
import { AssetData, OptimizationResult, MarketData, WeatherData } from '../types/asset';

export class AIAgentService {
  private redis: RedisClient;
  private marketService: EnergyMarketService;
  private weatherService: WeatherService;
  private bessService: BessService;
  private pvService: PvService;
  private metrics: MetricsCollector;

  constructor() {
    this.redis = new RedisClient();
    this.marketService = new EnergyMarketService();
    this.weatherService = new WeatherService();
    this.bessService = new BessService();
    this.pvService = new PvService();
    this.metrics = new MetricsCollector();
  }

  async optimizeAsset(assetId: string): Promise<OptimizationResult> {
    try {
      // Recupera i dati dell'asset
      const assetData = await this.getAssetData(assetId);
      if (!assetData) {
        throw new Error(`Asset ${assetId} non trovato`);
      }

      // Recupera i dati di mercato
      const marketData = await this.marketService.getMarketData();
      
      // Recupera i dati meteo
      const weatherData = await this.weatherService.getWeatherData(assetData.location);

      // Ottimizza in base al tipo di asset
      let optimizationResult: OptimizationResult;
      if (assetData.type === 'bess') {
        optimizationResult = await this.optimizeBESS(assetData, marketData);
      } else {
        optimizationResult = await this.optimizePV(assetData, marketData, weatherData);
      }

      // Salva il risultato
      await this.saveOptimizationResult(assetId, optimizationResult);

      // Registra le metriche
      this.metrics.recordOptimization(assetId, optimizationResult);

      return optimizationResult;
    } catch (error) {
      console.error('Errore durante l\'ottimizzazione:', error);
      throw error;
    }
  }

  private async getAssetData(assetId: string): Promise<AssetData | null> {
    const data = await this.redis.get(`asset:${assetId}`);
    return data ? JSON.parse(data) : null;
  }

  private async optimizeBESS(
    assetData: AssetData,
    marketData: MarketData
  ): Promise<OptimizationResult> {
    // Implementa la logica di ottimizzazione per BESS
    return {
      timestamp: new Date(),
      assetId: assetData.id,
      recommendations: {
        chargeSchedule: [],
        dischargeSchedule: [],
        targetSOC: 0
      },
      expectedRevenue: 0,
      confidence: 0
    };
  }

  private async optimizePV(
    assetData: AssetData,
    marketData: MarketData,
    weatherData: WeatherData
  ): Promise<OptimizationResult> {
    // Implementa la logica di ottimizzazione per PV
    return {
      timestamp: new Date(),
      assetId: assetData.id,
      recommendations: {
        productionForecast: [],
        maintenanceSchedule: []
      },
      expectedRevenue: 0,
      confidence: 0
    };
  }

  private async saveOptimizationResult(
    assetId: string,
    result: OptimizationResult
  ): Promise<void> {
    await this.redis.set(
      `optimization:${assetId}`,
      JSON.stringify(result),
      'EX',
      3600 // Scade dopo 1 ora
    );
  }

  async getOptimizationHistory(assetId: string): Promise<OptimizationResult[]> {
    const history = await this.redis.get(`optimization:history:${assetId}`);
    return history ? JSON.parse(history) : [];
  }
} 