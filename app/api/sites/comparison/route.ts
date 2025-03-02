import { NextResponse } from 'next/server';

// Funzioni di utilità
const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const generateSineWave = (min: number, max: number, phase = 0, timestamp: number) => {
  const frequency = 2 * Math.PI / (24 * 60 * 60 * 1000); // Un ciclo al giorno
  return min + ((max - min) / 2) * (1 + Math.sin(frequency * timestamp + phase));
};

// Genera dati per un periodo specifico
const generateDataForPeriod = (startTime: number, endTime: number, interval: number) => {
  const data = [];
  for (let timestamp = startTime; timestamp <= endTime; timestamp += interval) {
    // Efficienza base con variazione sinusoidale
    const efficiency_siteA = generateSineWave(0.85, 0.95, 0, timestamp);
    const efficiency_siteB = generateSineWave(0.83, 0.93, Math.PI / 4, timestamp);

    // Livello di carica con variazione sinusoidale
    const chargeLevel_siteA = generateSineWave(20, 80, Math.PI / 2, timestamp);
    const chargeLevel_siteB = generateSineWave(25, 75, Math.PI / 3, timestamp);

    // Potenza in uscita con variazione sinusoidale
    const powerOutput_siteA = generateSineWave(0, 4000, Math.PI / 6, timestamp);
    const powerOutput_siteB = generateSineWave(0, 3800, Math.PI / 5, timestamp);

    // Prezzo dell'energia con variazione sinusoidale
    const energyPrice = generateSineWave(30, 70, 0, timestamp);

    // Calcolo dei ricavi basato sulla potenza e sul prezzo
    const revenue_siteA = (powerOutput_siteA * energyPrice) / 1000; // Converti in k€
    const revenue_siteB = (powerOutput_siteB * energyPrice) / 1000;

    data.push({
      timestamp: new Date(timestamp),
      efficiency_siteA,
      efficiency_siteB,
      chargeLevel_siteA,
      chargeLevel_siteB,
      powerOutput_siteA,
      powerOutput_siteB,
      revenue_siteA,
      revenue_siteB
    });
  }
  return data;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || '24h';

  const now = Date.now();
  let startTime: number;
  let interval: number;

  // Determina l'intervallo di tempo basato sul timeRange
  switch (timeRange) {
    case '1h':
      startTime = now - 60 * 60 * 1000;
      interval = 5 * 60 * 1000; // 5 minuti
      break;
    case '6h':
      startTime = now - 6 * 60 * 60 * 1000;
      interval = 15 * 60 * 1000; // 15 minuti
      break;
    case '24h':
      startTime = now - 24 * 60 * 60 * 1000;
      interval = 60 * 60 * 1000; // 1 ora
      break;
    case '7d':
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      interval = 6 * 60 * 60 * 1000; // 6 ore
      break;
    case '30d':
      startTime = now - 30 * 24 * 60 * 60 * 1000;
      interval = 24 * 60 * 60 * 1000; // 1 giorno
      break;
    default:
      startTime = now - 24 * 60 * 60 * 1000;
      interval = 60 * 60 * 1000;
  }

  // Genera i dati per il periodo richiesto
  const data = generateDataForPeriod(startTime, now, interval);

  // Simula un ritardo di rete casuale tra 100ms e 500ms
  await new Promise(resolve => setTimeout(resolve, randomBetween(100, 500)));

  // 2% di probabilità di errore
  if (Math.random() < 0.02) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new NextResponse(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
} 