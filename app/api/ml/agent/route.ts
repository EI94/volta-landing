import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Definizione degli stati del sistema
interface SystemState {
  batteryCharge: number;      // Livello di carica attuale (%)
  marketPrice: number;        // Prezzo attuale dell'energia (€/MWh)
  solarIrradiance: number;    // Irraggiamento solare (W/m²)
  temperature: number;        // Temperatura della batteria (°C)
  timeOfDay: number;         // Ora del giorno (0-23)
  dayOfWeek: number;         // Giorno della settimana (0-6)
  efficiency: number;        // Efficienza attuale della batteria (%)
}

interface Action {
  type: 'CHARGE' | 'DISCHARGE' | 'HOLD';
  power: number;             // Potenza in MW
  expectedRevenue: number;   // Ricavo atteso in €
  confidence: number;        // Confidenza della decisione (0-1)
}

// Parametri di configurazione
const CONFIG = {
  MIN_CHARGE: 20,           // Livello minimo di carica (%)
  MAX_CHARGE: 80,           // Livello massimo di carica (%)
  MAX_POWER: 10,           // Potenza massima (MW)
  PRICE_THRESHOLD_LOW: 45,  // Soglia prezzo basso (€/MWh)
  PRICE_THRESHOLD_HIGH: 55, // Soglia prezzo alto (€/MWh)
  MAX_TEMPERATURE: 35,      // Temperatura massima (°C)
  EFFICIENCY_THRESHOLD: 85, // Soglia minima efficienza (%)
  LEARNING_RATE: 0.1,      // Tasso di apprendimento per i pesi
};

// Pesi iniziali del modello
let MODEL_WEIGHTS = {
  revenueWeight: 0.4,
  healthWeight: 0.3,
  efficiencyWeight: 0.3
};

// Carica i pesi salvati se esistono
const WEIGHTS_PATH = path.join(process.cwd(), 'data', 'model_weights.json');
if (fs.existsSync(WEIGHTS_PATH)) {
  try {
    MODEL_WEIGHTS = JSON.parse(fs.readFileSync(WEIGHTS_PATH, 'utf-8'));
  } catch (error) {
    console.error('Errore nel caricamento dei pesi:', error);
  }
}

// Funzioni di utilità per il calcolo dei punteggi
const calculatePriceScore = (price: number, state: SystemState): number => {
  const avgPrice = (CONFIG.PRICE_THRESHOLD_HIGH + CONFIG.PRICE_THRESHOLD_LOW) / 2;
  const baseScore = (price - avgPrice) / avgPrice;
  
  // Considera l'efficienza nella valutazione del prezzo
  const efficiencyFactor = state.efficiency / 100;
  return baseScore * efficiencyFactor;
};

const calculateTimeScore = (hour: number, state: SystemState): number => {
  // Favorisce la carica durante la notte (0-6) e la scarica durante il picco (9-20)
  let baseScore = 0;
  if (hour >= 0 && hour <= 6) baseScore = -0.5;  // Favorisce la carica
  if (hour >= 9 && hour <= 20) baseScore = 0.5;  // Favorisce la scarica

  // Considera il giorno della settimana (weekend vs giorni lavorativi)
  const isWeekend = state.dayOfWeek === 0 || state.dayOfWeek === 6;
  return isWeekend ? baseScore * 0.7 : baseScore;
};

const calculateSolarScore = (irradiance: number, state: SystemState): number => {
  // Normalizza l'irraggiamento solare (0-1000 W/m²)
  const baseScore = irradiance / 1000;
  
  // Considera la temperatura nella valutazione solare
  const temperatureFactor = Math.max(0, 1 - (state.temperature / CONFIG.MAX_TEMPERATURE));
  return baseScore * temperatureFactor;
};

const calculateHealthScore = (state: SystemState, action: Action['type']): number => {
  // Calcola l'impatto sulla salute della batteria
  const cycleImpact = action === 'HOLD' ? 0 : -0.1;
  const temperatureImpact = Math.max(0, 1 - (state.temperature / CONFIG.MAX_TEMPERATURE));
  const chargeImpact = Math.abs(state.batteryCharge - 50) / 50; // Ottimale intorno al 50%
  
  return (cycleImpact + temperatureImpact - chargeImpact) * MODEL_WEIGHTS.healthWeight;
};

// Funzione principale per il calcolo del Q-value
const calculateQValue = (state: SystemState, action: Action['type']): number => {
  let qValue = 0;

  // Punteggio basato sul prezzo
  const priceScore = calculatePriceScore(state.marketPrice, state) * MODEL_WEIGHTS.revenueWeight;
  
  // Punteggio basato sul tempo
  const timeScore = calculateTimeScore(state.timeOfDay, state) * MODEL_WEIGHTS.efficiencyWeight;
  
  // Punteggio basato sull'irraggiamento solare
  const solarScore = calculateSolarScore(state.solarIrradiance, state) * MODEL_WEIGHTS.efficiencyWeight;

  // Punteggio basato sulla salute della batteria
  const healthScore = calculateHealthScore(state, action);

  // Calcola il Q-value in base all'azione
  switch (action) {
    case 'CHARGE':
      qValue = -priceScore * MODEL_WEIGHTS.revenueWeight    // Prezzo basso → carica
              - timeScore * MODEL_WEIGHTS.efficiencyWeight   // Notte → carica
              - solarScore * MODEL_WEIGHTS.efficiencyWeight  // Sole alto → non caricare
              + healthScore;                                 // Considera la salute
      break;
    
    case 'DISCHARGE':
      qValue = priceScore * MODEL_WEIGHTS.revenueWeight     // Prezzo alto → scarica
              + timeScore * MODEL_WEIGHTS.efficiencyWeight   // Giorno → scarica
              + solarScore * MODEL_WEIGHTS.efficiencyWeight  // Sole alto → scarica
              + healthScore;                                 // Considera la salute
      break;
    
    case 'HOLD':
      // HOLD è più favorevole quando la batteria è in condizioni non ottimali
      qValue = healthScore * 2;  // Doppio peso per la salute in HOLD
      break;
  }

  return qValue;
};

// Funzione per determinare l'azione ottimale
const determineOptimalAction = (state: SystemState): Action => {
  // Controlli di sicurezza
  if (state.temperature >= CONFIG.MAX_TEMPERATURE) {
    return {
      type: 'HOLD',
      power: 0,
      expectedRevenue: 0,
      confidence: 0.9
    };
  }

  if (state.efficiency < CONFIG.EFFICIENCY_THRESHOLD) {
    return {
      type: 'HOLD',
      power: 0,
      expectedRevenue: 0,
      confidence: 0.85
    };
  }

  // Calcola Q-value per ogni azione
  const qValues = {
    CHARGE: calculateQValue(state, 'CHARGE'),
    DISCHARGE: calculateQValue(state, 'DISCHARGE'),
    HOLD: calculateQValue(state, 'HOLD')
  };

  // Trova l'azione con il Q-value più alto
  let bestAction: Action['type'] = 'HOLD';
  let maxQValue = qValues.HOLD;

  if (qValues.CHARGE > maxQValue && state.batteryCharge < CONFIG.MAX_CHARGE) {
    bestAction = 'CHARGE';
    maxQValue = qValues.CHARGE;
  }

  if (qValues.DISCHARGE > maxQValue && state.batteryCharge > CONFIG.MIN_CHARGE) {
    bestAction = 'DISCHARGE';
    maxQValue = qValues.DISCHARGE;
  }

  // Calcola la potenza ottimale e il ricavo atteso
  let power = 0;
  let expectedRevenue = 0;

  if (bestAction === 'CHARGE') {
    power = Math.min(
      CONFIG.MAX_POWER,
      (CONFIG.MAX_CHARGE - state.batteryCharge) * CONFIG.MAX_POWER / 100
    );
    expectedRevenue = -power * state.marketPrice;
  } else if (bestAction === 'DISCHARGE') {
    power = Math.min(
      CONFIG.MAX_POWER,
      (state.batteryCharge - CONFIG.MIN_CHARGE) * CONFIG.MAX_POWER / 100
    );
    expectedRevenue = power * state.marketPrice * (state.efficiency / 100);
  }

  // Calcola la confidenza basata sulla differenza tra i Q-value
  const qValueRange = Math.max(...Object.values(qValues)) - Math.min(...Object.values(qValues));
  const confidence = Math.min(0.95, 0.6 + (qValueRange * 0.35));

  return {
    type: bestAction,
    power: Math.abs(power),
    expectedRevenue: Math.abs(expectedRevenue),
    confidence
  };
};

// Funzione per aggiornare i pesi del modello
const updateWeights = async (weights: typeof MODEL_WEIGHTS) => {
  MODEL_WEIGHTS = {
    revenueWeight: MODEL_WEIGHTS.revenueWeight * (1 - CONFIG.LEARNING_RATE) + weights.revenueWeight * CONFIG.LEARNING_RATE,
    healthWeight: MODEL_WEIGHTS.healthWeight * (1 - CONFIG.LEARNING_RATE) + weights.healthWeight * CONFIG.LEARNING_RATE,
    efficiencyWeight: MODEL_WEIGHTS.efficiencyWeight * (1 - CONFIG.LEARNING_RATE) + weights.efficiencyWeight * CONFIG.LEARNING_RATE
  };

  // Normalizza i pesi
  const sum = Object.values(MODEL_WEIGHTS).reduce((a, b) => a + b, 0);
  Object.keys(MODEL_WEIGHTS).forEach(key => {
    MODEL_WEIGHTS[key as keyof typeof MODEL_WEIGHTS] /= sum;
  });

  // Salva i nuovi pesi
  try {
    fs.writeFileSync(WEIGHTS_PATH, JSON.stringify(MODEL_WEIGHTS, null, 2));
  } catch (error) {
    console.error('Errore nel salvataggio dei pesi:', error);
  }
};

export async function POST(request: Request) {
  try {
    const state: SystemState = await request.json();

    // Validazione dei dati di input
    if (!state || 
        typeof state.batteryCharge !== 'number' ||
        typeof state.marketPrice !== 'number' ||
        typeof state.solarIrradiance !== 'number' ||
        typeof state.temperature !== 'number' ||
        typeof state.timeOfDay !== 'number' ||
        typeof state.dayOfWeek !== 'number' ||
        typeof state.efficiency !== 'number') {
      return new NextResponse(JSON.stringify({ error: 'Dati di input non validi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Recupera le metriche recenti per l'apprendimento
    try {
      const response = await fetch('http://localhost:3000/api/ml/history');
      if (response.ok) {
        const data = await response.json();
        if (data.weights) {
          await updateWeights(data.weights);
        }
      }
    } catch (error) {
      console.error('Errore nel recupero delle metriche:', error);
    }

    // Calcola l'azione ottimale
    const action = determineOptimalAction(state);

    // Aggiungi spiegazione in italiano
    let explanation = '';
    switch (action.type) {
      case 'CHARGE':
        explanation = `Consigliato caricare a ${action.power.toFixed(2)} MW. ` +
                     `Il prezzo attuale di ${state.marketPrice}€/MWh è favorevole per la carica. ` +
                     `Costo previsto: ${(-action.expectedRevenue).toFixed(2)}€. ` +
                     `Impatto sulla salute della batteria: ${(calculateHealthScore(state, action.type) * 100).toFixed(1)}%`;
        break;
      case 'DISCHARGE':
        explanation = `Consigliato scaricare a ${action.power.toFixed(2)} MW. ` +
                     `Il prezzo attuale di ${state.marketPrice}€/MWh è favorevole per la vendita. ` +
                     `Ricavo previsto: ${action.expectedRevenue.toFixed(2)}€. ` +
                     `Impatto sulla salute della batteria: ${(calculateHealthScore(state, action.type) * 100).toFixed(1)}%`;
        break;
      case 'HOLD':
        explanation = `Consigliato mantenere lo stato attuale. ` +
                     `Le condizioni di mercato e del sistema non sono ottimali per operazioni di carica/scarica. ` +
                     `Questo aiuta a preservare la salute della batteria.`;
        break;
    }

    return new NextResponse(JSON.stringify({
      action,
      explanation,
      systemState: state,
      modelWeights: MODEL_WEIGHTS,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Errore nel servizio ML:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Errore interno del servizio ML',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 