export interface WeatherData {
  timestamp: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  precipitation: number;
  solarIrradiance: number;
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
}

export interface WeatherForecast extends WeatherData {
  forecastType: 'short_term' | 'medium_term' | 'long_term';
  confidence: number;
  provider: string;
}

export interface SolarProductionForecast {
  timestamp: Date;
  expectedProduction: number;  // in kWh
  confidence: number;
  weatherImpact: {
    cloudImpact: number;
    temperatureImpact: number;
    otherFactors: string[];
  };
} 