"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import MultiSiteSelector from "./MultiSiteSelector";
import EnergyMarketDashboard from "./EnergyMarketDashboard";
import WeatherOpen from "./WeatherOpen";
import BessStateChart from './BessStateChart';
import ForecastChart from './ForecastChart';
import NotificationSystem from './NotificationSystem';
import ChargeScheduleTable from './ChargeScheduleTable';
import TimeRangeFilter from './TimeRangeFilter';
import MetricsSelector from './MetricsSelector';
import SiteComparisonChart from './SiteComparisonChart';
import AIAgent from './AIAgent';
import PvProductionTable from './PvProductionTable';

// Tipi di dati
interface SimulationData {
  currentState: {
    assetType: 'bess' | 'pv';
    bess?: {
      data: {
        capacityMW: number;
        capacityMWh: number;
        currentChargePercent: number;
        batteryHealthPercent: number;
        temperatureC: number;
        cycleCount: number;
        efficiency: number;
        stateOfHealth: number;
        revenueToday?: number;
        roiPercent?: number;
      };
      status: {
        isOperational: boolean;
        faultCodes: string[];
        warnings: string[];
      };
    };
    pv?: {
      data: {
        capacityMW: number;
        actualOutputMW: number;
        expectedOutputMW: number;
        currentEfficiency: number;
        specificYield: number;
        performanceRatio: number;
        inverterEfficiency: number;
        temperatureC: number;
        soilingRatio: number;
        moduleHealth: number;
        revenueToday?: number;
        roiPercent?: number;
        availabilityPercent: number;
      };
      status: {
        isOperational: boolean;
        faultCodes: string[];
        warnings: string[];
      };
      details: {
        inverters: {
          count: number;
          operational: number;
          status: string;
          efficiency: number;
        };
        modules: {
          count: number;
          underperforming: number;
          hotspots: number;
        };
        strings: {
          count: number;
          underperforming: number;
        };
        degradation: {
          annual: number;
          lifetime: number;
        };
      };
    };
    market: {
      currentPrice: number;
      trend: {
        labels: string[];
        prices: number[];
      };
    };
    weather: {
      temperature: number;
      humidity: number;
      cloudCover: number;
      solarIrradiance: number;
    };
  };
  forecasts: {
    market: Array<{
      timestamp: Date;
      predictedPrice: number;
      upperBound: number;
      lowerBound: number;
    }>;
    weather: Array<{
      timestamp: Date;
      cloudCover: number;
      solarIrradiance: number;
    }>;
  };
  ai: {
    recommendations: {
      shouldCharge?: boolean;
      shouldDischarge?: boolean;
      shouldClean?: boolean;
      optimizeInverters?: boolean; 
      maintenanceNeeded: boolean;
      tradingAction: string;
      explanation: string;
    };
    chargeSchedule?: Array<{
      timestamp: Date;
      action: string;
      power: number;
      expectedPrice: number;
      confidence: number;
    }>;
    productionSchedule?: Array<{
      timestamp: Date;
      action: string;
      expectedPower: number;
      solarIrradiance?: number;
      cloudCover?: number;
      expectedPrice: number;
      confidence: number;
    }>;
    maintenancePrediction: {
      needsMaintenance: boolean;
      predictedDate: Date | null;
      confidence: number;
      reason: string;
    };
  };
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

// Memoizzazione dei componenti che non necessitano di frequenti ri-render
const MemoizedMultiSiteSelector = React.memo(MultiSiteSelector);
const MemoizedEnergyMarketDashboard = React.memo(EnergyMarketDashboard);
const MemoizedWeatherOpen = React.memo(WeatherOpen);
const MemoizedBessStateChart = React.memo(BessStateChart);
const MemoizedForecastChart = React.memo(ForecastChart);
const MemoizedChargeScheduleTable = React.memo(ChargeScheduleTable);
const MemoizedPvProductionTable = React.memo(PvProductionTable);
const MemoizedTimeRangeFilter = React.memo(TimeRangeFilter);
const MemoizedMetricsSelector = React.memo(MetricsSelector);
const MemoizedSiteComparisonChart = React.memo(SiteComparisonChart);

// Costanti per l'intervallo di refresh e la dimensione dello storico
const REFRESH_INTERVAL = 15000;

// Costanti per la gestione degli errori e retry
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

// Utility per gestire i retry
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await wait(delay);
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

const metricColors = {
  efficiency_siteA: '#4CAF50',
  efficiency_siteB: '#81C784',
  powerOutput_siteA: '#2196F3',
  powerOutput_siteB: '#64B5F6',
  revenue_siteA: '#FFC107',
  revenue_siteB: '#FFD54F'
};

// Funzione per generare dati storici per i grafici
const generateHistoricalData = (hours: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now.getTime() - (hours - i) * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      dailyRevenue: Math.random() * 1000 + 500,
      roi: Math.random() * 10 + 5,
      healthScore: Math.random() * 10 + 85,
      averageEfficiency: Math.random() * 15 + 80,
      cycleCount: Math.floor(Math.random() * 5) + i,
      id: `metric_${timestamp.getTime()}`
    });
  }
  
  return data;
};

// Definisce un componente Tab per il sistema di navigazione a schede
const Tab = ({ 
  active, 
  label, 
  icon, 
  onClick, 
  hasAlert = false 
}: { 
  active: boolean; 
  label: string; 
  icon: string; 
  onClick: () => void; 
  hasAlert?: boolean 
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-4 py-3 rounded-t-lg text-lg font-medium
      transition-all duration-300 relative
      ${active 
        ? 'bg-white text-blue-600 border-t-2 border-l-2 border-r-2 border-blue-600 border-b-0' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
    `}
  >
    <span>{icon}</span>
    <span>{label}</span>
    {hasAlert && (
      <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
    )}
  </button>
);

// Definisce un componente Card per visualizzare le sezioni dell'interfaccia
const Card = ({
  title,
  children,
  collapsible = false,
  initiallyExpanded = true,
  actionButton = null
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  initiallyExpanded?: boolean;
  actionButton?: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 transition-all duration-300">
      <div className="bg-blue-50 px-4 py-3 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-blue-800">{title}</h3>
        <div className="flex space-x-2">
          {actionButton}
          {collapsible && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-800"
            >
              {expanded ? '🔼' : '🔽'}
            </button>
          )}
        </div>
      </div>
      <div 
        className={`transition-all duration-300 ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Componente per i KPI
const KPICard = ({ title, value, unit, onClick, clickable = false, icon = null }: any) => (
  <div 
    className={`bg-blue-50 p-4 rounded-lg ${clickable ? 'cursor-pointer hover:bg-blue-100' : ''}`}
    onClick={clickable ? onClick : undefined}
  >
    <div className="text-center">
      <div className="flex items-center justify-center mb-2">
        {icon && <span className="mr-2 text-xl">{icon}</span>}
        <p className="text-lg font-semibold">{title}</p>
      </div>
      <p className="text-2xl font-bold text-blue-600">{value}{unit}</p>
      {clickable && (
        <p className="text-sm text-gray-600 mt-1">Click per dettagli</p>
      )}
    </div>
  </div>
);

export default function DemoInterface(): JSX.Element {
  const [selectedSite, setSelectedSite] = useState<string>("siteA");
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [showMarketGraph, setShowMarketGraph] = useState<boolean>(false);
  const [showWeatherDetail, setShowWeatherDetail] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [bessHistory, setBessHistory] = useState<Array<{
    timestamp: Date;
    chargePercent: number;
    healthPercent: number;
    temperature: number;
  }>>([]);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['efficiency', 'chargeLevel']);
  const [comparisonData, setComparisonData] = useState<Array<{
    timestamp: Date;
    efficiency_siteA: number;
    efficiency_siteB: number;
    chargeLevel_siteA: number;
    chargeLevel_siteB: number;
    powerOutput_siteA: number;
    powerOutput_siteB: number;
    revenue_siteA: number;
    revenue_siteB: number;
  }>>([]);
  
  // Nuovo stato per gestire la navigazione a schede
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Nuovi stati per il controllo delle sezioni espandibili
  const [showAIAgent, setShowAIAgent] = useState<boolean>(false);
  const [showBessDetails, setShowBessDetails] = useState<boolean>(true);
  const [showRevenueAdvisor, setShowRevenueAdvisor] = useState<boolean>(false);
  
  // Nuovo stato per memorizzare i consigli di revenue
  const [revenueAdvice, setRevenueAdvice] = useState<any>(null);

  // Memoizzazione dei dati formattati per evitare ricalcoli non necessari
  const formattedBessData = useMemo(() => {
    if (!simulationData) return null;
    
    if (simulationData.currentState.assetType === 'bess' && simulationData.currentState.bess) {
      const bessData = simulationData.currentState.bess.data;
      return {
        chargePercent: bessData.currentChargePercent.toFixed(1),
        temperature: bessData.temperatureC.toFixed(1),
        healthPercent: bessData.batteryHealthPercent.toFixed(1),
        cycleCount: bessData.cycleCount.toFixed(0),
        efficiency: (bessData.efficiency * 100).toFixed(1),
        currentPrice: simulationData.currentState.market.currentPrice.toFixed(2),
        solarIrradiance: simulationData.currentState.weather.solarIrradiance.toFixed(0)
      };
    } else if (simulationData.currentState.assetType === 'pv' && simulationData.currentState.pv) {
      const pvData = simulationData.currentState.pv.data;
      return {
        outputMW: pvData.actualOutputMW.toFixed(2),
        expectedMW: pvData.expectedOutputMW.toFixed(2),
        temperature: pvData.temperatureC.toFixed(1),
        performanceRatio: (pvData.performanceRatio * 100).toFixed(1),
        moduleHealth: pvData.moduleHealth.toFixed(1),
        efficiency: pvData.currentEfficiency.toFixed(1),
        specificYield: pvData.specificYield.toFixed(1),
        inverterEfficiency: pvData.inverterEfficiency.toFixed(1),
        currentPrice: simulationData.currentState.market.currentPrice.toFixed(2),
        solarIrradiance: simulationData.currentState.weather.solarIrradiance.toFixed(0)
      };
    }
    
    return null;
  }, [simulationData]);

  // Memoizzazione delle callback per evitare ri-render non necessari
  const handleSiteSelect = useCallback((site: string) => {
    setSelectedSite(site);
  }, []);

  const handleTimeRangeChange = useCallback((range: string) => {
    setTimeRange(range);
  }, []);

  const handleMetricsChange = useCallback((metrics: string[]) => {
    setSelectedMetrics(metrics);
  }, []);

  // Funzione per rimuovere una notifica
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Funzione per aggiungere una notifica
  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);

    // Rimuovi automaticamente la notifica dopo 5 secondi
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 5000);
  }, [dismissNotification]);

  // Funzione per recuperare i dati dalla simulazione con retry
  const fetchSimulationData = useCallback(async () => {
    try {
      const data = await retryWithBackoff(async () => {
        // Determina il tipo di asset in base al sito selezionato
        const assetType = selectedSite === "siteA" ? "bess" : "pv";
        
        const response = await fetch(`/api/simulation?assetType=${assetType}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });

      setSimulationData(data);

      // Validazione dei dati
      if (data.currentState.assetType === 'bess' && !data.currentState?.bess?.data) {
        throw new Error('Dati BESS mancanti o non validi');
      } else if (data.currentState.assetType === 'pv' && !data.currentState?.pv?.data) {
        throw new Error('Dati fotovoltaici mancanti o non validi');
      }

      // Controlla le condizioni per le notifiche
      if (data.currentState.assetType === 'bess') {
        if (data.currentState.bess.status.warnings.length > 0) {
          data.currentState.bess.status.warnings.forEach((warning: string) => {
            addNotification('warning', `Avviso BESS: ${warning}`);
          });
        }

        if (data.ai.recommendations.maintenanceNeeded) {
          addNotification('info', `Manutenzione programmata consigliata - Confidenza: ${
            (data.ai.maintenancePrediction.confidence * 100).toFixed(1)
          }%`);
        }

        if (data.currentState.bess.data.batteryHealthPercent < 90) {
          addNotification('warning', `Stato di salute della batteria critico: ${
            data.currentState.bess.data.batteryHealthPercent.toFixed(1)
          }%`);
        }
      } else if (data.currentState.assetType === 'pv') {
        // Notifiche per l'impianto fotovoltaico
        if (data.currentState.pv.status.warnings && data.currentState.pv.status.warnings.length > 0) {
          data.currentState.pv.status.warnings.forEach((warning: string) => {
            addNotification('warning', `Avviso PV: ${warning}`);
          });
        }
        
        if (data.ai.recommendations.maintenanceNeeded) {
          addNotification('info', `Manutenzione fotovoltaico consigliata - Confidenza: ${
            (data.ai.maintenancePrediction.confidence * 100).toFixed(1)
          }%`);
        }
        
        if (data.currentState.pv.details.inverters.status === 'warning') {
          addNotification('warning', `Anomalia inverter rilevata`);
        }
        
        if (data.ai.recommendations.shouldClean) {
          addNotification('info', `Pulizia pannelli consigliata - Perdita per sporcizia: ${
            ((1 - data.currentState.pv.data.soilingRatio) * 100).toFixed(1)
          }%`);
        }
      }
      } catch (error) {
      console.error("Errore dettagliato nel recupero dei dati della simulazione:", error);
      addNotification('error', `Errore nel recupero dei dati: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      throw error; // Propaga l'errore per gestirlo nei livelli superiori se necessario
    }
  }, [addNotification, selectedSite]);

  // Funzione per recuperare i dati di confronto con retry
  const fetchComparisonData = useCallback(async () => {
    try {
      const data = await retryWithBackoff(async () => {
        const response = await fetch(`/api/sites/comparison?timeRange=${timeRange}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });

      // Validazione dei dati
      if (!Array.isArray(data)) {
        throw new Error('Formato dati di confronto non valido');
      }

      setComparisonData(data);
    } catch (error) {
      console.error("Errore dettagliato nel recupero dei dati di confronto:", error);
      addNotification('error', `Errore nel recupero dei dati di confronto: ${
        error instanceof Error ? error.message : 'Errore sconosciuto'
      }`);
      // Non propagare l'errore qui per mantenere l'interfaccia utilizzabile
    }
  }, [timeRange, addNotification]);

  // Funzione per recuperare i consigli di revenue stream
  const fetchRevenueAdvice = useCallback(async () => {
    try {
      // Ottieni prima i dati dell'asset
      const assetResponse = await fetch('/api/assets');
      if (!assetResponse.ok) {
        throw new Error(`HTTP error! status: ${assetResponse.status}`);
      }
      const assets = await assetResponse.json();
      
      if (!assets || !assets.length) {
        throw new Error('Nessun asset trovato');
      }
      
      const asset = assets[0]; // Usa il primo asset
      
      // Ottieni i dati di mercato
      const marketResponse = await fetch('/api/energy-markets?market=MGP&zone=NORD');
      if (!marketResponse.ok) {
        throw new Error(`HTTP error! status: ${marketResponse.status}`);
      }
      const marketData = await marketResponse.json();
      
      // Crea le previsioni di mercato
      const marketForecasts = [{
        marketType: 'MGP',
        zone: 'NORD',
        forecasts: marketData.forecast || [],
        volatility: 10 + Math.random() * 5,
        trend: Math.random() > 0.5 ? 'rising' : 'falling',
        seasonalPattern: 'daily'
      }];
      
      // Richiedi i consigli di revenue
      const adviceResponse = await fetch('/api/ml/revenue-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asset,
          marketForecasts
        })
      });
      
      if (!adviceResponse.ok) {
        throw new Error(`HTTP error! status: ${adviceResponse.status}`);
      }
      
      const adviceData = await adviceResponse.json();
      setRevenueAdvice(adviceData);
      
      // Notifica l'utente
      if (adviceData.recommendations && adviceData.recommendations.length > 0) {
        const topRecommendation = adviceData.recommendations[0];
        if (topRecommendation.suitabilityScore > 70) {
          addNotification('info', `Consiglio: Considera ${topRecommendation.type} come revenue stream (${topRecommendation.suitabilityScore}% adatto)`);
        }
      }
    } catch (error) {
      console.error("Errore nel recupero dei consigli di revenue:", error);
      addNotification('error', `Errore nel recupero dei consigli di revenue: ${
        error instanceof Error ? error.message : 'Errore sconosciuto'
      }`);
    }
  }, [addNotification]);

  // Effetto per il refresh automatico con gestione degli errori
  useEffect(() => {
    if (autoRefresh) {
      let isSubscribed = true;
      const intervalId = setInterval(async () => {
        try {
          if (isSubscribed) {
            await fetchSimulationData();
            await fetchRevenueAdvice();
          }
        } catch (error) {
          console.error("Errore durante l'aggiornamento automatico:", error);
          // Disattiva l'autorefresh in caso di errori persistenti
          setAutoRefresh(false);
          addNotification('error', 'Aggiornamento automatico disattivato a causa di errori');
        }
      }, REFRESH_INTERVAL);

      return () => {
        isSubscribed = false;
        clearInterval(intervalId);
      };
    }
  }, [autoRefresh, fetchSimulationData, fetchRevenueAdvice, addNotification]);

  // Effetto per aggiornare i dati di confronto quando cambia il timeRange
  useEffect(() => {
    fetchComparisonData();
  }, [fetchComparisonData]);

  // Carica i dati iniziali
  useEffect(() => {
    fetchSimulationData();
    fetchRevenueAdvice();
  }, [fetchSimulationData, fetchRevenueAdvice]);

  // Aggiorna lo storico quando arrivano nuovi dati
  useEffect(() => {
    if (simulationData) {
      if (simulationData.currentState.assetType === 'bess' && simulationData.currentState.bess) {
        const bessData = simulationData.currentState.bess.data;
        const newEntry = {
          timestamp: new Date(),
          chargePercent: bessData.currentChargePercent,
          healthPercent: bessData.batteryHealthPercent,
          temperature: bessData.temperatureC
        };
        
        setBessHistory(prev => {
          const updatedHistory = [...prev, newEntry];
          return updatedHistory.slice(-48);
        });
      } else if (simulationData.currentState.assetType === 'pv' && simulationData.currentState.pv) {
        const pvData = simulationData.currentState.pv.data;
        // Per il fotovoltaico, memorizziamo l'output e il performance ratio
        const newEntry = {
          timestamp: new Date(),
          outputMW: pvData.actualOutputMW,
          performanceRatio: pvData.performanceRatio * 100,
          temperature: pvData.temperatureC
        };
        
        // Riutilizziamo lo stesso stato per la semplicità
        setBessHistory(prev => {
          const updatedHistory = [...prev, newEntry as any];
          return updatedHistory.slice(-48);
        });
      }
    }
  }, [simulationData]);

  // Memoizzazione delle funzioni di toggle
  const toggleMarketGraph = useCallback(() => {
    setShowMarketGraph(prev => !prev);
  }, []);

  const toggleWeatherDetail = useCallback(() => {
    setShowWeatherDetail(prev => !prev);
  }, []);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Memoizzazione dei dati per i grafici
  const chartData = useMemo(() => {
    if (!simulationData?.forecasts) return null;
    return {
      marketForecast: simulationData.forecasts.market,
      weatherForecast: simulationData.forecasts.weather
    };
  }, [simulationData?.forecasts]);

  // Memoizzazione delle condizioni di visualizzazione
  const displayConditions = useMemo(() => {
    if (!simulationData) return null;
    
    // Utilizzo di !! per convertire i valori potenzialmente undefined in booleani
    const hasWarnings = simulationData.currentState.assetType === 'bess' && 
      !!(simulationData.currentState.bess?.status?.warnings?.length);
    
    const hasChargeSchedule = Array.isArray(simulationData.ai.chargeSchedule) && 
      simulationData.ai.chargeSchedule.length > 0;
    
    return {
      hasWarnings,
      needsMaintenance: simulationData.ai.recommendations.maintenanceNeeded,
      hasExplanation: Boolean(simulationData.ai.recommendations.explanation),
      hasChargeSchedule
    };
  }, [simulationData]);

  // Memoizzazione della città selezionata per il meteo
  const selectedCity = useMemo(() => 
    selectedSite === "siteA" ? "Viterbo,IT" : "Rome,IT"
  , [selectedSite]);

  if (!simulationData) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] bg-white">
        <div className="text-2xl text-gray-600">Caricamento dati...</div>
      </div>
    );
  }

  const { currentState, ai } = simulationData;
  
  // Verifica se ci sono avvisi o raccomandazioni importanti
  const hasAlerts = (currentState.assetType === 'bess' && 
    !!(currentState.bess?.status?.warnings?.length)) || 
    ai.recommendations.maintenanceNeeded;
  const hasRevenueAdvice = revenueAdvice && revenueAdvice.recommendations && revenueAdvice.recommendations.length > 0;

  return (
    <>
      <div className={`transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'min-h-[90vh]'
      } bg-gray-100 rounded-2xl shadow-2xl overflow-hidden`}>
        
        {/* Header con pulsanti di controllo */}
        <header className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h2 className="text-3xl font-bold text-blue-800">
                BESS Commander
              </h2>
              <span className="ml-3 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {selectedSite === "siteA" ? "Sito Viterbo" : "Sito Roma"}
              </span>
            </div>
            <div className="flex space-x-3">
              <MemoizedMultiSiteSelector onSelect={handleSiteSelect} />
              <button
                onClick={toggleAutoRefresh}
                className={`px-4 py-2 rounded-lg ${
                  autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {autoRefresh ? '🔄 Aggiornamento Attivo' : '🔄 Aggiorna Auto'}
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                {isFullscreen ? '🔙 Esci' : '📋 Full Screen'}
              </button>
            </div>
          </div>
        </header>
        
        {/* Navigazione a schede */}
        <div className="px-6 pt-6 bg-gray-100">
          <div className="flex space-x-1 border-b border-gray-300">
            <Tab 
              active={activeTab === 'dashboard'} 
              label="Dashboard"
              icon="📊"
              onClick={() => setActiveTab('dashboard')}
            />
            <Tab 
              active={activeTab === 'ai'} 
              label="Agente AI"
              icon="🤖"
              onClick={() => setActiveTab('ai')}
              hasAlert={hasAlerts}
            />
            <Tab 
              active={activeTab === 'analysis'} 
              label="Analisi"
              icon="📈"
              onClick={() => setActiveTab('analysis')}
            />
            <Tab 
              active={activeTab === 'revenue'} 
              label="Revenue Advisor"
              icon="💰"
              onClick={() => setActiveTab('revenue')}
              hasAlert={hasRevenueAdvice}
            />
          </div>
        </div>
        
        {/* Contenuto Principale */}
        <main className="p-6 bg-gray-100">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Pannello KPI */}
                <Card title="KPI Principali" collapsible={false}>
                  <div className="grid grid-cols-2 gap-4">
                    {simulationData.currentState.assetType === 'bess' ? (
                      <>
                        <KPICard 
                          title="Carica" 
                          value={`${formattedBessData?.chargePercent}%`} 
                          icon="🔋"
                        />
                        <KPICard 
                          title="Temperatura" 
                          value={`${formattedBessData?.temperature}°C`} 
                          icon="🌡️"
                        />
                        <KPICard 
                          title="Salute" 
                          value={`${formattedBessData?.healthPercent}%`} 
                          icon="💪"
                        />
                        <KPICard 
                          title="Cicli" 
                          value={formattedBessData?.cycleCount} 
                          icon="🔄"
                        />
                      </>
                    ) : (
                      <>
                        <KPICard 
                          title="Output Attuale" 
                          value={`${formattedBessData?.outputMW} MW`} 
                          icon="⚡"
                        />
                        <KPICard 
                          title="Temperatura" 
                          value={`${formattedBessData?.temperature}°C`} 
                          icon="🌡️"
                        />
                        <KPICard 
                          title="Perf. Ratio" 
                          value={`${formattedBessData?.performanceRatio}%`} 
                          icon="📊"
                        />
                        <KPICard 
                          title="Efficienza" 
                          value={`${formattedBessData?.efficiency}%`} 
                          icon="⚙️"
                        />
                      </>
                    )}
                  </div>
                </Card>
                
                {/* Pannello Mercato */}
                <Card 
                  title="Mercato Energia" 
                  collapsible={true}
                  actionButton={
                    <button
                      onClick={toggleMarketGraph}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                    >
                      {showMarketGraph ? 'Nascondi Grafico' : 'Mostra Grafico'}
                    </button>
                  }
                >
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600 mb-2">€{formattedBessData?.currentPrice}/MWh</p>
                    <p className="text-gray-600">Prezzo attuale energia</p>
                  </div>
                  
                  {showMarketGraph && (
                    <div className="mt-4">
                      <MemoizedEnergyMarketDashboard />
                    </div>
                  )}
                </Card>
                
                {/* Pannello Meteo */}
                <Card 
                  title="Condizioni Meteo" 
                  collapsible={true}
                  actionButton={
                    <button
                      onClick={toggleWeatherDetail}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                    >
                      {showWeatherDetail ? 'Nascondi Dettagli' : 'Mostra Dettagli'}
                    </button>
                  }
                >
                  <div>
                    <p className="text-center text-4xl font-bold text-orange-500 mb-2">{formattedBessData?.solarIrradiance} W/m²</p>
                    <p className="text-center text-gray-600">Irraggiamento solare</p>
                    
                    {showWeatherDetail && (
                      <div className="mt-4">
                        <MemoizedWeatherOpen city={selectedCity} />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
              
              {/* Grafici di stato */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={simulationData.currentState.assetType === 'bess' ? "Storico Stato Batteria" : "Storico Produzione"}>
                  {bessHistory.length > 0 ? (
                    <MemoizedBessStateChart 
                      data={bessHistory} 
                      assetType={simulationData.currentState.assetType}
                    />
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      Nessun dato storico disponibile
                    </div>
                  )}
                </Card>
                
                <Card title="Previsioni">
                  {chartData ? (
                    <MemoizedForecastChart
                      marketForecast={chartData.marketForecast}
                      weatherForecast={chartData.weatherForecast}
                    />
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      Nessuna previsione disponibile
                    </div>
                  )}
                </Card>
              </div>
              
              {/* Pianificazione carica o pianificazione produzione */}
              {simulationData.currentState.assetType === 'bess' && 
               Array.isArray(simulationData.ai.chargeSchedule) && 
               simulationData.ai.chargeSchedule.length > 0 && (
                <div className="mt-6">
                  <Card title="Pianificazione Carica/Scarica">
                    <MemoizedChargeScheduleTable schedule={simulationData.ai.chargeSchedule} />
                  </Card>
                </div>
              )}
              
              {simulationData.currentState.assetType === 'pv' && simulationData.ai.productionSchedule && (
                <div className="mt-6">
                  <Card title="Previsione Produzione">
                    <MemoizedPvProductionTable 
                      schedule={simulationData.ai.productionSchedule.map((item: any) => ({
                        timestamp: item.timestamp,
                        expectedPower: item.expectedPower,
                        solarIrradiance: item.solarIrradiance,
                        cloudCover: item.cloudCover,
                        confidence: item.confidence
                      }))} 
                    />
                  </Card>
                </div>
              )}
            </div>
          )}
          
          {/* Agente AI Tab */}
          {activeTab === 'ai' && (
            <div>
              <Card 
                title="Assistente AI per l'Ottimizzazione Energetica" 
                collapsible={false}
              >
                {simulationData && (
                  <AIAgent
                    batteryCharge={simulationData.currentState.assetType === 'bess' && simulationData.currentState.bess
                      ? simulationData.currentState.bess.data.currentChargePercent
                      : 0}
                    marketPrice={simulationData.currentState.market.currentPrice}
                    solarIrradiance={simulationData.currentState.weather.solarIrradiance}
                    temperature={simulationData.currentState.assetType === 'bess' && simulationData.currentState.bess
                      ? simulationData.currentState.bess.data.temperatureC
                      : simulationData.currentState.assetType === 'pv' && simulationData.currentState.pv
                        ? simulationData.currentState.pv.data.temperatureC
                        : 0}
                    efficiency={simulationData.currentState.assetType === 'bess' && simulationData.currentState.bess
                      ? simulationData.currentState.bess.data.efficiency * 100
                      : simulationData.currentState.assetType === 'pv' && simulationData.currentState.pv
                        ? simulationData.currentState.pv.data.currentEfficiency
                        : 0}
                    assetType={simulationData.currentState.assetType}
                    pvData={simulationData.currentState.assetType === 'pv' && simulationData.currentState.pv
                      ? {
                          actualOutputMW: simulationData.currentState.pv.data.actualOutputMW,
                          expectedOutputMW: simulationData.currentState.pv.data.expectedOutputMW,
                          performanceRatio: simulationData.currentState.pv.data.performanceRatio,
                          specificYield: simulationData.currentState.pv.data.specificYield,
                          soilingRatio: simulationData.currentState.pv.data.soilingRatio,
                          inverterEfficiency: simulationData.currentState.pv.data.inverterEfficiency / 100,
                          moduleHealth: simulationData.currentState.pv.data.moduleHealth
                        }
                      : undefined}
                    currentState={simulationData.currentState.assetType === 'bess' && simulationData.currentState.bess 
                      ? {
                          bess: {
                            data: {
                              efficiency: simulationData.currentState.bess.data.efficiency * 100,
                              health: simulationData.currentState.bess.data.batteryHealthPercent,
                              cycle_count: simulationData.currentState.bess.data.cycleCount,
                              revenue_today: simulationData.currentState.bess.data.revenueToday || 0,
                              roi_percent: simulationData.currentState.bess.data.roiPercent || 0
                            }
                          }
                        } 
                      : undefined}
                    metrics={{
                      metrics: generateHistoricalData(24)
                    }}
                    onExecute={() => {
                      console.log('Esecuzione automatica');
                    }}
                    onActionExecute={(action) => {
                      // Aggiungi una notifica per l'azione eseguita
                      addNotification(
                        'info',
                        `Azione eseguita: ${action.type} a ${action.power.toFixed(2)} MW`
                      );
                    }}
                  />
                )}
              </Card>
              
              {/* Raccomandazioni AI */}
              <Card title="Raccomandazioni e Avvisi" collapsible={false}>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${
                    simulationData.ai.recommendations.explanation ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <p className="text-gray-800">{simulationData.ai.recommendations.explanation || 'Nessuna raccomandazione al momento'}</p>
                  </div>
                  
                  {simulationData.ai.recommendations.maintenanceNeeded && (
                    <div className="p-3 rounded-lg bg-yellow-100">
                      <p className="text-yellow-800">⚠️ Manutenzione consigliata</p>
                      <p className="text-sm text-yellow-700">
                        Confidenza: {(simulationData.ai.maintenancePrediction.confidence * 100).toFixed(1)}%
                        {simulationData.ai.maintenancePrediction.reason && ` - ${simulationData.ai.maintenancePrediction.reason}`}
                      </p>
                    </div>
                  )}
                  
                  {/* Avvisi se ci sono */}
                  {simulationData.currentState.assetType === 'bess' && 
                    !!(simulationData.currentState.bess?.status?.warnings?.length) && (
                    <div className="p-3 rounded-lg bg-red-100">
                      <p className="text-red-800">🚨 Avvisi:</p>
                      <ul className="list-disc list-inside">
                        {simulationData.currentState.bess?.status?.warnings?.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {simulationData.currentState.assetType === 'pv' && 
                    !!(simulationData.currentState.pv?.details?.modules?.underperforming) && (
                    <div className="p-3 rounded-lg bg-red-100">
                      <p className="text-red-800">⚠️ Moduli sottoperformanti rilevati</p>
                      <p className="text-sm text-red-700">
                        {simulationData.currentState.pv?.details?.modules?.underperforming} moduli su {simulationData.currentState.pv?.details?.modules?.count || 0} stanno producendo meno del previsto
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
          
          {/* Analisi Tab */}
          {activeTab === 'analysis' && (
            <div>
              <Card 
                title="Confronto Siti" 
                collapsible={false}
                actionButton={
                  <MemoizedTimeRangeFilter
                    timeRange={timeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                  />
                }
              >
                <div className="mb-4">
                  <MemoizedMetricsSelector
                    selectedMetrics={selectedMetrics}
                    onMetricsChange={handleMetricsChange}
                  />
                </div>
                
                {comparisonData.length > 0 ? (
                  <MemoizedSiteComparisonChart
                    data={comparisonData}
                    timeRange={timeRange}
                    metrics={selectedMetrics}
                    colors={metricColors}
                    yAxisLabel="Valore"
                  />
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    Nessun dato disponibile per il confronto
                  </div>
                )}
              </Card>
            </div>
          )}
          
          {/* Revenue Advisor Tab */}
          {activeTab === 'revenue' && (
            <div>
              <Card title="Analisi Revenue Stream" collapsible={false}>
                {revenueAdvice ? (
                  <div>
                    {/* Revenue Stream Attuale */}
                    <div className="mb-6">
                      <h4 className="text-xl font-semibold mb-3">Revenue Stream Attuale</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-bold">{revenueAdvice.currentStream.type}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            revenueAdvice.currentStream.riskLevel === 'low' 
                              ? 'bg-green-100 text-green-800' 
                              : revenueAdvice.currentStream.riskLevel === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            Rischio: {revenueAdvice.currentStream.riskLevel === 'low' 
                              ? 'Basso' 
                              : revenueAdvice.currentStream.riskLevel === 'medium' 
                                ? 'Medio' 
                                : 'Alto'}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{revenueAdvice.currentStream.description}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600">Ricavo annuale stimato</p>
                            <p className="text-xl font-bold text-blue-600">
                              €{revenueAdvice.currentStream.estimatedAnnualRevenue.toLocaleString('it-IT', {
                                maximumFractionDigits: 0
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Punteggio di idoneità</p>
                            <div className="flex items-center">
                              <div className="w-32 h-3 bg-gray-200 rounded-full">
                                <div
                                  className="h-3 bg-blue-600 rounded-full"
                                  style={{ width: `${revenueAdvice.currentStream.suitabilityScore}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-blue-600 font-semibold">
                                {revenueAdvice.currentStream.suitabilityScore}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Raccomandazioni Alternative */}
                    <div>
                      <h4 className="text-xl font-semibold mb-3">Raccomandazioni Alternative</h4>
                      <div className="space-y-4">
                        {revenueAdvice.recommendations.map((rec: any, index: number) => (
                          <div 
                            key={`rec-${index}`} 
                            className={`p-4 rounded-lg ${
                              index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-lg font-bold">
                                {index === 0 && '⭐ '}{rec.type}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                rec.riskLevel === 'low' 
                                  ? 'bg-green-100 text-green-800' 
                                  : rec.riskLevel === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                Rischio: {rec.riskLevel === 'low' 
                                  ? 'Basso' 
                                  : rec.riskLevel === 'medium' 
                                    ? 'Medio' 
                                    : 'Alto'}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{rec.description}</p>
                            <p className="text-gray-600 mb-3 italic">{rec.reason}</p>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-gray-600">Ricavo annuale stimato</p>
                                <p className="text-xl font-bold text-blue-600">
                                  €{rec.estimatedAnnualRevenue.toLocaleString('it-IT', {
                                    maximumFractionDigits: 0
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Punteggio di idoneità</p>
                                <div className="flex items-center">
                                  <div className="w-32 h-3 bg-gray-200 rounded-full">
                                    <div
                                      className="h-3 bg-blue-600 rounded-full"
                                      style={{ width: `${rec.suitabilityScore}%` }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-blue-600 font-semibold">
                                    {rec.suitabilityScore}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Approfondimenti sul mercato */}
                    <div className="mt-6">
                      <h4 className="text-xl font-semibold mb-3">Approfondimenti sul Mercato</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <ul className="space-y-2">
                          {revenueAdvice.marketInsights.map((insight: string, index: number) => (
                            <li key={`insight-${index}`} className="flex items-start">
                              <span className="text-blue-600 mr-2">📊</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-xl text-gray-600">Caricamento analisi revenue stream...</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Sistema di Notifiche */}
      <NotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </>
  );
}










