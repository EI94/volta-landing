import { MarketData, MarketForecast } from '../../types/market';

class MarketSimulator {
  private basePrice: number = 50; // €/MWh
  private volatility: number = 0.15; // 15% volatilità
  private timeStep: number = 15; // minuti
  private currentTime: Date;
  private priceHistory: number[] = [];
  
  constructor() {
    this.currentTime = new Date();
    // Inizializza lo storico prezzi
    for (let i = 0; i < 96; i++) { // 24 ore con timestep di 15 minuti
      this.priceHistory.push(this.basePrice);
    }
  }

  private getDailyPattern(hour: number): number {
    // Pattern giornaliero realistico dei prezzi dell'energia
    const morningPeak = Math.exp((-1 * (hour - 9) ** 2) / 10) * 20; // Picco mattutino
    const eveningPeak = Math.exp((-1 * (hour - 19) ** 2) / 10) * 30; // Picco serale
    const baseLoad = 10 * Math.sin(hour * Math.PI / 12); // Carico base
    
    return morningPeak + eveningPeak + baseLoad;
  }

  private getRandomWalk(): number {
    return (Math.random() - 0.5) * 2 * this.volatility * this.basePrice;
  }

  public getCurrentPrice(): MarketData {
    const hour = this.currentTime.getHours();
    const dailyPattern = this.getDailyPattern(hour);
    const randomWalk = this.getRandomWalk();
    
    const currentPrice = Math.max(0, this.basePrice + dailyPattern + randomWalk);
    
    // Aggiorna lo storico
    this.priceHistory.push(currentPrice);
    this.priceHistory.shift();
    
    return {
      currentPrice,
      timestamp: new Date(this.currentTime),
      currency: 'EUR',
      market: 'DAM',
      volume: 100, // MWh
      trend: {
        labels: this.getLast24HoursLabels(),
        prices: [...this.priceHistory]
      }
    };
  }

  private getLast24HoursLabels(): string[] {
    const labels: string[] = [];
    const now = new Date(this.currentTime);
    
    for (let i = 95; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 15 * 60 * 1000);
      labels.push(time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
    }
    
    return labels;
  }

  public getForecast(hoursAhead: number): MarketForecast[] {
    const forecasts: MarketForecast[] = [];
    const now = new Date(this.currentTime);
    
    for (let i = 1; i <= hoursAhead; i++) {
      const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hour = forecastTime.getHours();
      const dailyPattern = this.getDailyPattern(hour);
      
      // Aumenta l'incertezza con l'orizzonte temporale
      const uncertainty = this.volatility * Math.sqrt(i);
      const predictedPrice = this.basePrice + dailyPattern;
      
      forecasts.push({
        timestamp: forecastTime,
        predictedPrice,
        confidence: Math.max(0, 1 - uncertainty),
        upperBound: predictedPrice * (1 + uncertainty),
        lowerBound: predictedPrice * (1 - uncertainty)
      });
    }
    
    return forecasts;
  }

  public simulateTimeStep() {
    // Avanza di un timestep
    this.currentTime = new Date(this.currentTime.getTime() + this.timeStep * 60 * 1000);
    
    // Aggiorna il prezzo base con una leggera deriva casuale
    this.basePrice *= (1 + (Math.random() - 0.5) * 0.01);
  }
}

export default MarketSimulator; 