import { WeatherData, WeatherForecast } from '../../types/weather';

class WeatherSimulator {
  private currentTime: Date;
  private timeStep: number = 15; // minuti
  private location = {
    latitude: 42.4254,  // Viterbo
    longitude: 12.0446,
    altitude: 326
  };
  
  private baseConditions = {
    temperature: 20,
    humidity: 60,
    windSpeed: 5,
    windDirection: 180,
    cloudCover: 30,
    precipitation: 0,
    solarIrradiance: 500
  };

  constructor() {
    this.currentTime = new Date();
  }

  private getDailyTemperaturePattern(hour: number): number {
    // Modello di temperatura giornaliera
    const amplitude = 5; // Variazione di ±5°C
    return amplitude * Math.sin((hour - 6) * Math.PI / 12); // Minimo alle 6, massimo alle 18
  }

  private getSolarIrradiancePattern(hour: number): number {
    // Modello di irraggiamento solare
    if (hour < 6 || hour > 20) return 0; // Notte
    
    const maxIrradiance = 1000; // W/m²
    const dayLength = 14; // ore
    const peakHour = 13; // ora del picco
    
    return maxIrradiance * Math.exp((-1 * (hour - peakHour) ** 2) / (dayLength / 2));
  }

  private getRandomVariation(base: number, volatility: number): number {
    return base * (1 + (Math.random() - 0.5) * volatility);
  }

  public getCurrentWeather(): WeatherData {
    const hour = this.currentTime.getHours();
    
    // Applica pattern giornalieri e variazioni casuali
    const temperature = this.baseConditions.temperature + 
      this.getDailyTemperaturePattern(hour) +
      (Math.random() - 0.5) * 2;
    
    const solarIrradiance = this.getSolarIrradiancePattern(hour);
    
    // Correlazione tra nuvolosità e irraggiamento
    const cloudCover = this.getRandomVariation(this.baseConditions.cloudCover, 0.3);
    const actualIrradiance = solarIrradiance * (1 - cloudCover / 100);
    
    // Correlazione tra umidità e temperatura
    const humidity = this.getRandomVariation(
      this.baseConditions.humidity * (1 + (20 - temperature) / 40),
      0.2
    );
    
    return {
      timestamp: new Date(this.currentTime),
      temperature,
      humidity: Math.min(100, Math.max(0, humidity)),
      windSpeed: this.getRandomVariation(this.baseConditions.windSpeed, 0.4),
      windDirection: (this.baseConditions.windDirection + Math.random() * 20 - 10) % 360,
      cloudCover,
      precipitation: cloudCover > 70 ? Math.random() * 5 : 0,
      solarIrradiance: actualIrradiance,
      location: { ...this.location }
    };
  }

  public getForecast(hoursAhead: number): WeatherForecast[] {
    const forecasts: WeatherForecast[] = [];
    const now = new Date(this.currentTime);
    
    for (let i = 1; i <= hoursAhead; i++) {
      const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
      const hour = forecastTime.getHours();
      
      // Aumenta l'incertezza con l'orizzonte temporale
      const uncertainty = 0.1 * Math.sqrt(i);
      
      const baseWeather = {
        timestamp: forecastTime,
        temperature: this.baseConditions.temperature + this.getDailyTemperaturePattern(hour),
        humidity: this.baseConditions.humidity,
        windSpeed: this.baseConditions.windSpeed,
        windDirection: this.baseConditions.windDirection,
        cloudCover: this.baseConditions.cloudCover,
        precipitation: 0,
        solarIrradiance: this.getSolarIrradiancePattern(hour),
        location: { ...this.location }
      };
      
      // Applica incertezza alle previsioni
      const forecast: WeatherForecast = {
        ...baseWeather,
        forecastType: i <= 24 ? 'short_term' : i <= 72 ? 'medium_term' : 'long_term',
        confidence: Math.max(0, 1 - uncertainty),
        provider: 'WeatherSim v1.0'
      };
      
      forecasts.push(forecast);
    }
    
    return forecasts;
  }

  public simulateTimeStep() {
    // Avanza di un timestep
    this.currentTime = new Date(this.currentTime.getTime() + this.timeStep * 60 * 1000);
    
    // Aggiorna condizioni base con leggere variazioni
    this.baseConditions.windDirection = (this.baseConditions.windDirection + Math.random() * 10 - 5) % 360;
    this.baseConditions.windSpeed *= (1 + (Math.random() - 0.5) * 0.1);
    this.baseConditions.cloudCover = Math.min(100, Math.max(0, 
      this.baseConditions.cloudCover + (Math.random() - 0.5) * 10
    ));
  }
}

export default WeatherSimulator; 