import { NextResponse } from 'next/server';

// Funzioni di utilità per generare dati realistici
const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const generateSineWave = (min: number, max: number, phase = 0) => {
  const now = Date.now();
  const frequency = 2 * Math.PI / (24 * 60 * 60 * 1000); // Un ciclo al giorno
  return min + ((max - min) / 2) * (1 + Math.sin(frequency * now + phase));
};

// Genera dati simulati per il BESS
const generateBessData = () => {
  const baseEfficiency = 0.92; // 92% efficienza base
  const chargePercent = generateSineWave(20, 80); // Varia tra 20% e 80%
  const healthDecayRate = 0.001; // Decremento dello 0.1% al giorno
  const daysInOperation = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  
  return {
    data: {
      capacityMW: 10,
      capacityMWh: 40,
      currentChargePercent: chargePercent,
      batteryHealthPercent: 100 - (daysInOperation * healthDecayRate),
      temperatureC: generateSineWave(18, 35, Math.PI / 4), // Temperatura varia tra 18°C e 35°C
      cycleCount: Math.floor(daysInOperation * 1.5), // Media di 1.5 cicli al giorno
      efficiency: baseEfficiency - (randomBetween(0, 0.05)), // Varia tra 87-92%
      stateOfHealth: 95 - (daysInOperation * healthDecayRate)
    },
    status: {
      isOperational: Math.random() > 0.02, // 98% di uptime
      faultCodes: [],
      warnings: Math.random() > 0.8 ? ['Temperatura elevata'] : [] // 20% di probabilità di warning
    }
  };
};

// Rimuovi la variabile basePrice se non viene utilizzata
const simulateMarketPrice = (hour: number) => {
  const peakHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const isPeakHour = peakHours.includes(hour);
  
  // Prezzo base variabile tra 40-60 €/MWh
  const price = 40 + Math.random() * 20;
  
  // Aumenta il prezzo del 30-50% durante le ore di punta
  return isPeakHour ? price * (1.3 + Math.random() * 0.2) : price;
};

// Specifica i tipi per any
interface SimulationResult {
  timestamp: string;
  marketPrice: number;
  batteryAction: 'charge' | 'discharge' | 'idle';
  stateOfCharge: number;
  revenue: number;
}

// Genera dati di mercato
const generateMarketData = () => {
  const currentPrice = generateSineWave(30, 70);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return {
    currentPrice,
    trend: {
      labels: hours.map(h => `${h}:00`),
      prices: hours.map(h => generateSineWave(30, 70, h * Math.PI / 12))
    }
  };
};

// Genera dati meteo
const generateWeatherData = () => {
  const hour = new Date().getHours();
  const isDaytime = hour >= 6 && hour <= 20;
  
  return {
    temperature: generateSineWave(15, 30),
    humidity: generateSineWave(40, 80),
    cloudCover: randomBetween(0, 100),
    solarIrradiance: isDaytime ? generateSineWave(0, 1000) : 0
  };
};

// Genera previsioni
const generateForecasts = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const now = new Date();
  
  return {
    market: hours.map(h => ({
      timestamp: new Date(now.getTime() + h * 3600000),
      predictedPrice: generateSineWave(30, 70, h * Math.PI / 12),
      upperBound: generateSineWave(40, 80, h * Math.PI / 12),
      lowerBound: generateSineWave(20, 60, h * Math.PI / 12)
    })),
    weather: hours.map(h => ({
      timestamp: new Date(now.getTime() + h * 3600000),
      cloudCover: randomBetween(0, 100),
      solarIrradiance: (h >= 6 && h <= 20) ? generateSineWave(0, 1000, h * Math.PI / 12) : 0
    }))
  };
};

// Genera raccomandazioni AI
const generateAIRecommendations = (bess: any, market: any) => {
  const shouldCharge = market.currentPrice < 45 && bess.data.currentChargePercent < 70;
  const shouldDischarge = market.currentPrice > 55 && bess.data.currentChargePercent > 30;
  
  return {
    recommendations: {
      shouldCharge,
      shouldDischarge,
      maintenanceNeeded: bess.data.batteryHealthPercent < 90,
      tradingAction: shouldCharge ? 'CHARGE' : shouldDischarge ? 'DISCHARGE' : 'HOLD',
      explanation: shouldCharge 
        ? 'Prezzo energia basso, consigliato caricare'
        : shouldDischarge 
        ? 'Prezzo energia alto, consigliato scaricare'
        : 'Mantenere stato attuale'
    },
    chargeSchedule: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() + i * 3600000),
      action: Math.random() > 0.5 ? 'CHARGE' : 'DISCHARGE',
      power: randomBetween(0, 10),
      expectedPrice: generateSineWave(30, 70, i * Math.PI / 12),
      confidence: randomBetween(0.6, 0.95)
    })),
    maintenancePrediction: {
      needsMaintenance: bess.data.batteryHealthPercent < 90,
      predictedDate: bess.data.batteryHealthPercent < 90 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : null,
      confidence: 0.85,
      reason: 'Degradazione batteria superiore alla norma'
    }
  };
};

export async function GET() {
  // Genera i dati base
  const bess = generateBessData();
  const market = generateMarketData();
  const weather = generateWeatherData();
  const forecasts = generateForecasts();
  const ai = generateAIRecommendations(bess, market);

  // Costruisci la risposta
  const simulationData = {
    currentState: {
      bess,
      market,
      weather
    },
    forecasts,
    ai
  };

  // Simula un ritardo di rete casuale tra 100ms e 500ms
  await new Promise(resolve => setTimeout(resolve, randomBetween(100, 500)));

  // 2% di probabilità di errore
  if (Math.random() < 0.02) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new NextResponse(JSON.stringify(simulationData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
} 