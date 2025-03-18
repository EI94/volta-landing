export interface AssetData {
  id: string;
  type: 'bess' | 'pv';
  location: {
    latitude: number;
    longitude: number;
  };
  capacity: number;
  specifications: Record<string, any>;
}

export interface OptimizationResult {
  timestamp: Date;
  assetId: string;
  recommendations: {
    chargeSchedule?: Array<{
      startTime: Date;
      endTime: Date;
      power: number;
    }>;
    dischargeSchedule?: Array<{
      startTime: Date;
      endTime: Date;
      power: number;
    }>;
    targetSOC?: number;
    productionForecast?: Array<{
      timestamp: Date;
      power: number;
    }>;
    maintenanceSchedule?: Array<{
      timestamp: Date;
      type: string;
      duration: number;
    }>;
  };
  expectedRevenue: number;
  confidence: number;
}

export interface MarketData {
  prices: Array<{
    timestamp: Date;
    price: number;
  }>;
  demand: Array<{
    timestamp: Date;
    value: number;
  }>;
}

export interface WeatherData {
  forecast: Array<{
    timestamp: Date;
    temperature: number;
    humidity: number;
    cloudCover: number;
    windSpeed: number;
  }>;
} 