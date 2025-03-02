import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
  AssetConfig, 
  RevenueStreamType, 
  estimateRevenue,
  REVENUE_STREAM_DESCRIPTIONS 
} from '@/lib/models/assetConfig';

// Interfaccia per i dati delle previsioni di mercato
interface MarketForecast {
  marketType: string;
  zone: string;
  forecasts: Array<{
    timestamp: string;
    price: number;
  }>;
  volatility: number; // Deviazione standard dei prezzi
  trend: 'rising' | 'falling' | 'stable';
  seasonalPattern: 'daily' | 'weekly' | 'none';
}

// Interfaccia per i risultati dell'analisi
interface RevenueAnalysis {
  currentStream: {
    type: RevenueStreamType;
    description: string;
    estimatedAnnualRevenue: number;
    riskLevel: 'low' | 'medium' | 'high';
    suitabilityScore: number; // 0-100
  };
  recommendations: Array<{
    type: RevenueStreamType;
    description: string;
    estimatedAnnualRevenue: number;
    riskLevel: 'low' | 'medium' | 'high';
    suitabilityScore: number; // 0-100
    reason: string;
  }>;
  marketInsights: string[];
}

// Funzione per analizzare i dati di mercato e restituire consigli
function analyzeRevenueStreams(
  asset: AssetConfig,
  marketForecasts: MarketForecast[]
): RevenueAnalysis {
  // Calcola la produzione energetica giornaliera stimata
  const dailyEnergyCapacity = asset.capacity.power * 5; // Assumiamo 5 ore di produzione al giorno
  
  // Estrai le previsioni di prezzo medie per ogni mercato
  const marketPrices: Record<string, number> = {};
  const marketVolatilities: Record<string, number> = {};
  const marketTrends: Record<string, string> = {};
  
  marketForecasts.forEach(forecast => {
    const avgPrice = forecast.forecasts.reduce((sum, f) => sum + f.price, 0) / forecast.forecasts.length;
    marketPrices[forecast.marketType] = avgPrice;
    marketVolatilities[forecast.marketType] = forecast.volatility;
    marketTrends[forecast.marketType] = forecast.trend;
  });
  
  // Prezzo medio di mercato MGP (se disponibile, altrimenti usa un valore predefinito)
  const avgMarketPrice = marketPrices['MGP'] || 60;
  
  // Calcola l'entrata annuale stimata per il revenue stream attuale
  const currentAnnualRevenue = estimateRevenue(asset, avgMarketPrice, dailyEnergyCapacity) * 365;
  
  // Assegna punteggi di idoneità per ciascun tipo di revenue stream
  const suitabilityScores: Record<RevenueStreamType, number> = {
    'MERCHANT': 0,
    'PPA': 0,
    'TOLLING': 0,
    'MACSE': 0,
    'CM': 0
  };
  
  // Valuta l'idoneità per il mercato MERCHANT
  if (marketVolatilities['MGP']) {
    // Il mercato merchant beneficia di alta volatilità dei prezzi
    const volatility = marketVolatilities['MGP'];
    suitabilityScores['MERCHANT'] = Math.min(100, Math.max(20, volatility * 2));
    
    // Se i prezzi sono in aumento, il merchant diventa più attraente
    if (marketTrends['MGP'] === 'rising') {
      suitabilityScores['MERCHANT'] += 20;
    }
  } else {
    suitabilityScores['MERCHANT'] = 50; // Valore di default
  }
  
  // Valuta l'idoneità per PPA
  const ppaSuitability = 100 - suitabilityScores['MERCHANT'];
  suitabilityScores['PPA'] = Math.min(100, Math.max(20, ppaSuitability));
  
  // Valuta l'idoneità per TOLLING
  // Maggiore è la capacità della batteria, più adatto è il TOLLING
  suitabilityScores['TOLLING'] = Math.min(100, Math.max(30, asset.capacity.power * 3));
  
  // Valuta l'idoneità per MACSE
  // Basata sull'efficienza della batteria
  suitabilityScores['MACSE'] = Math.min(100, Math.max(20, asset.efficiency));
  
  // Valuta l'idoneità per CM
  // Maggiore è la capacità energetica, più adatto è il CM
  suitabilityScores['CM'] = Math.min(100, Math.max(20, (asset.capacity.energy / asset.capacity.power) * 25));
  
  // Determina il livello di rischio per ogni revenue stream
  const riskLevels: Record<RevenueStreamType, 'low' | 'medium' | 'high'> = {
    'MERCHANT': 'high',    // Alto rischio a causa della volatilità dei prezzi
    'PPA': 'low',         // Basso rischio a causa del prezzo fisso
    'TOLLING': 'medium',  // Rischio medio
    'MACSE': 'medium',    // Rischio medio
    'CM': 'low'           // Basso rischio a causa della remunerazione fissa
  };
  
  // Crea i dati di analisi per il revenue stream attuale
  const currentStreamAnalysis = {
    type: asset.revenueStream.type,
    description: REVENUE_STREAM_DESCRIPTIONS[asset.revenueStream.type],
    estimatedAnnualRevenue: currentAnnualRevenue,
    riskLevel: riskLevels[asset.revenueStream.type],
    suitabilityScore: suitabilityScores[asset.revenueStream.type]
  };
  
  // Simula le entrate annuali per gli altri tipi di revenue stream
  const recommendations = Object.keys(suitabilityScores)
    .filter(type => type !== asset.revenueStream.type)
    .map(type => {
      const revenueType = type as RevenueStreamType;
      
      // Crea un asset ipotetico con questo tipo di revenue stream
      const hypotheticalAsset: AssetConfig = {
        ...asset,
        revenueStream: createHypotheticalRevenueStream(revenueType, asset, avgMarketPrice)
      };
      
      // Stima le entrate annuali
      const annualRevenue = estimateRevenue(hypotheticalAsset, avgMarketPrice, dailyEnergyCapacity) * 365;
      
      // Genera un motivo per la raccomandazione
      const reason = generateRecommendationReason(
        revenueType, 
        asset.revenueStream.type, 
        annualRevenue, 
        currentAnnualRevenue, 
        suitabilityScores[revenueType],
        marketForecasts,
        asset
      );
      
      return {
        type: revenueType,
        description: REVENUE_STREAM_DESCRIPTIONS[revenueType],
        estimatedAnnualRevenue: annualRevenue,
        riskLevel: riskLevels[revenueType],
        suitabilityScore: suitabilityScores[revenueType],
        reason
      };
    })
    // Ordina per punteggio di idoneità decrescente
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  
  // Genera approfondimenti sul mercato
  const marketInsights = generateMarketInsights(marketForecasts, asset);
  
  return {
    currentStream: currentStreamAnalysis,
    recommendations,
    marketInsights
  };
}

// Funzione per creare un ipotetico revenue stream di un certo tipo
function createHypotheticalRevenueStream(
  type: RevenueStreamType,
  asset: AssetConfig,
  marketPrice: number
): any {
  switch (type) {
    case 'MERCHANT':
      return {
        type: 'MERCHANT',
        preferredMarkets: ['MGP', 'MI'],
        minimumPrice: marketPrice * 0.9,
        maximumPrice: marketPrice * 0.4
      };
    
    case 'PPA':
      return {
        type: 'PPA',
        contractPrice: marketPrice * 0.85, // Solitamente il PPA è a sconto rispetto al mercato
        contractDuration: 60, // 5 anni
        counterparty: 'Ipotetico Acquirente',
        minimumSupply: asset.capacity.energy * 200, // ~200 giorni di produzione
        penaltyRate: 0.1
      };
    
    case 'TOLLING':
      return {
        type: 'TOLLING',
        feePerMWh: marketPrice * 0.15, // Tariffa per MWh elaborato
        minimumOperation: asset.capacity.energy * 100, // ~100 giorni di operazione
        contractedCapacity: asset.capacity.power
      };
    
    case 'MACSE':
      return {
        type: 'MACSE',
        certificationPrice: 5000, // Valore ipotetico
        certificationPeriod: 12, // 1 anno
        minimumAvailability: 95
      };
    
    case 'CM':
      return {
        type: 'CM',
        capacityPrice: 40000, // €/MW/anno
        contractedCapacity: asset.capacity.power,
        deliveryPeriod: 12, // 1 anno
        penalties: 0.5 // 50% di penale
      };
  }
}

// Funzione per generare una motivazione per una raccomandazione
function generateRecommendationReason(
  recommendedType: RevenueStreamType,
  currentType: RevenueStreamType,
  recommendedRevenue: number,
  currentRevenue: number,
  suitabilityScore: number,
  marketForecasts: MarketForecast[],
  asset: AssetConfig
): string {
  const revenueDiff = recommendedRevenue - currentRevenue;
  const revenuePercentage = (revenueDiff / currentRevenue) * 100;
  
  let reason = '';
  
  // Motivo basato sul confronto delle entrate
  if (revenuePercentage > 15) {
    reason = `Il passaggio a ${recommendedType} potrebbe aumentare i ricavi annuali di circa il ${revenuePercentage.toFixed(1)}%.`;
  } else if (revenuePercentage < -15) {
    reason = `Il passaggio a ${recommendedType} potrebbe ridurre i ricavi annuali di circa il ${Math.abs(revenuePercentage).toFixed(1)}%, ma con minore rischio.`;
  } else {
    reason = `Il passaggio a ${recommendedType} manterrebbe ricavi simili, con una variazione di circa ${revenuePercentage.toFixed(1)}%.`;
  }
  
  // Aggiungi informazioni specifiche per tipo di revenue stream
  switch (recommendedType) {
    case 'MERCHANT':
      const mgpForecast = marketForecasts.find(f => f.marketType === 'MGP');
      if (mgpForecast && mgpForecast.trend === 'rising') {
        reason += ` Con i prezzi di mercato in aumento, la strategia MERCHANT potrebbe essere vantaggiosa.`;
      }
      break;
    
    case 'PPA':
      reason += ` Un PPA offre stabilità dei ricavi nel lungo periodo e protezione dalla volatilità dei prezzi.`;
      break;
    
    case 'TOLLING':
      reason += ` Un contratto di TOLLING potrebbe massimizzare l'utilizzo della capacità dell'impianto.`;
      break;
    
    case 'MACSE':
      reason += ` L'alta efficienza del sistema (${asset.efficiency}%) lo rende adatto per il mercato MACSE.`;
      break;
    
    case 'CM':
      reason += ` Il Capacity Market offre stabilità di ricavi indipendente dalla produzione effettiva.`;
      break;
  }
  
  return reason;
}

// Funzione per generare approfondimenti sul mercato
function generateMarketInsights(marketForecasts: MarketForecast[], asset: AssetConfig): string[] {
  const insights: string[] = [];
  
  // Analisi delle tendenze di mercato
  marketForecasts.forEach(forecast => {
    if (forecast.trend === 'rising') {
      insights.push(`I prezzi nel mercato ${forecast.marketType} sono in aumento nella zona ${forecast.zone}.`);
    } else if (forecast.trend === 'falling') {
      insights.push(`I prezzi nel mercato ${forecast.marketType} sono in calo nella zona ${forecast.zone}.`);
    }
    
    if (forecast.volatility > 15) {
      insights.push(`Alta volatilità nel mercato ${forecast.marketType} potrebbe favorire strategie di arbitraggio.`);
    }
    
    if (forecast.seasonalPattern === 'daily') {
      insights.push(`Il mercato ${forecast.marketType} mostra forti pattern giornalieri, ideali per operazioni di carica/scarica quotidiane.`);
    }
  });
  
  // Approfondimenti specifici sul revenue stream attuale
  switch (asset.revenueStream.type) {
    case 'MERCHANT':
      insights.push(`La strategia MERCHANT attuale è ottimale in mercati volatili. Monitorare continuamente i prezzi per massimizzare i ricavi.`);
      break;
    
    case 'PPA':
      const ppaConfig = asset.revenueStream;
      insights.push(`Il contratto PPA attuale ha un prezzo di ${ppaConfig.contractPrice}€/MWh per altri ${ppaConfig.contractDuration} mesi.`);
      break;
    
    case 'TOLLING':
      insights.push(`Il contratto di TOLLING permette di ottimizzare l'utilizzo della batteria indipendentemente dalle fluttuazioni di prezzo.`);
      break;
    
    case 'MACSE':
      insights.push(`La partecipazione al mercato MACSE valorizza l'efficienza dell'impianto e il contributo alla rete.`);
      break;
    
    case 'CM':
      insights.push(`Il Capacity Market garantisce ricavi stabili, ma potrebbe limitare la partecipazione ad altri mercati più remunerativi.`);
      break;
  }
  
  return insights;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asset, marketForecasts } = body;
    
    if (!asset || !marketForecasts || !Array.isArray(marketForecasts)) {
      return NextResponse.json(
        { error: 'Dati mancanti o in formato non valido' },
        { status: 400 }
      );
    }
    
    const analysis = analyzeRevenueStreams(asset, marketForecasts);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Errore nell\'analisi dei revenue stream:', error);
    return NextResponse.json(
      { 
        error: 'Errore nell\'analisi dei revenue stream',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
} 