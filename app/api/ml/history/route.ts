import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'ml_history.json');

// Assicurati che la directory esista
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Assicurati che il file esista
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ actions: [], metrics: [] }));
}

interface ActionRecord {
  timestamp: string;
  state: {
    batteryCharge: number;
    marketPrice: number;
    solarIrradiance: number;
    temperature: number;
    timeOfDay: number;
    dayOfWeek: number;
    efficiency: number;
  };
  action: {
    type: 'CHARGE' | 'DISCHARGE' | 'HOLD';
    power: number;
  };
  result: {
    revenue: number;
    efficiencyDelta: number;
    healthDelta: number;
    temperatureDelta: number;
  };
}

interface PerformanceMetrics {
  timestamp: string;
  dailyRevenue: number;
  averageEfficiency: number;
  cycleCount: number;
  healthScore: number;
  roi: number;
}

// Funzione per calcolare le metriche di performance
const calculatePerformanceMetrics = (actions: ActionRecord[]): PerformanceMetrics => {
  const last24Hours = actions.filter(a => 
    new Date(a.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
  );

  return {
    timestamp: new Date().toISOString(),
    dailyRevenue: last24Hours.reduce((sum, a) => sum + a.result.revenue, 0),
    averageEfficiency: last24Hours.reduce((sum, a) => sum + a.result.efficiencyDelta, 0) / last24Hours.length,
    cycleCount: last24Hours.filter(a => a.action.type !== 'HOLD').length,
    healthScore: last24Hours.reduce((sum, a) => sum + a.result.healthDelta, 0) / last24Hours.length,
    roi: last24Hours.reduce((sum, a) => sum + a.result.revenue / Math.abs(a.result.healthDelta || 1), 0)
  };
};

// Funzione per aggiornare i pesi del modello
const updateModelWeights = (metrics: PerformanceMetrics[]) => {
  if (metrics.length < 2) return null;

  const latest = metrics[metrics.length - 1];
  const previous = metrics[metrics.length - 2];

  // Calcola i cambiamenti nelle metriche
  const revenueChange = (latest.dailyRevenue - previous.dailyRevenue) / previous.dailyRevenue;
  const healthChange = (latest.healthScore - previous.healthScore) / previous.healthScore;
  const roiChange = (latest.roi - previous.roi) / previous.roi;

  // Aggiorna i pesi in base alle performance
  return {
    revenueWeight: 0.4 * (1 + revenueChange),
    healthWeight: 0.3 * (1 + healthChange),
    efficiencyWeight: 0.3 * (1 + roiChange)
  };
};

// GET: Recupera lo storico e le metriche
export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    return new NextResponse(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Errore nel recupero della cronologia:', err);
    return NextResponse.json(
      { error: 'Errore nel recupero della cronologia' },
      { status: 500 }
    );
  }
}

// POST: Registra una nuova azione e aggiorna le metriche
export async function POST(request: Request) {
  try {
    const newAction: ActionRecord = await request.json();
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

    // Aggiungi la nuova azione
    data.actions.push(newAction);

    // Mantieni solo le ultime 1000 azioni
    if (data.actions.length > 1000) {
      data.actions = data.actions.slice(-1000);
    }

    // Calcola e aggiungi le nuove metriche
    const newMetrics = calculatePerformanceMetrics(data.actions);
    data.metrics.push(newMetrics);

    // Mantieni solo le ultime 100 metriche
    if (data.metrics.length > 100) {
      data.metrics = data.metrics.slice(-100);
    }

    // Calcola i nuovi pesi del modello
    const newWeights = updateModelWeights(data.metrics);

    // Salva i dati aggiornati
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

    return new NextResponse(JSON.stringify({ 
      success: true,
      metrics: newMetrics,
      weights: newWeights
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ 
      error: 'Errore nel salvataggio dei dati',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 