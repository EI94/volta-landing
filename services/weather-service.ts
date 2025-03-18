import { WeatherData } from '../types/asset';

export class WeatherService {
  async getWeatherData(location: { latitude: number; longitude: number }): Promise<WeatherData> {
    // Implementazione mock per il test
    return {
      forecast: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(2024, 0, 1, i),
        temperature: 20 + Math.random() * 15,
        humidity: 40 + Math.random() * 30,
        cloudCover: Math.random() * 100,
        windSpeed: 5 + Math.random() * 15
      }))
    };
  }
} 