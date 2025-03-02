export interface MarketData {
  currentPrice: number;
  timestamp: Date;
  currency: string;
  market: 'DAM' | 'IDM' | 'MSD' | 'MB';  // Day-Ahead, Intraday, Ancillary Services, Balancing
  volume: number;
  trend?: {
    labels: string[];
    prices: number[];
  };
}

export interface MarketForecast {
  timestamp: Date;
  predictedPrice: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

export interface TradingStrategy {
  action: 'buy' | 'sell' | 'hold';
  volume: number;
  price: number;
  market: string;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
} 