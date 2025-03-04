import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea, TooltipProps } from 'recharts';
import Notification from './Notification';

interface ModelWeights {
  revenueWeight: number;
  healthWeight: number;
  efficiencyWeight: number;
}

interface Action {
  type: 'CHARGE' | 'DISCHARGE' | 'HOLD';
  power: number;
  expectedRevenue: number;
  confidence: number;
}

interface AIAgentProps {
  batteryCharge: number;
  marketPrice: number;
  solarIrradiance: number;
  temperature: number;
  efficiency: number;
  hasAlert?: boolean;
  onActionExecute: (action: Action) => void;
  autoExecuteEnabled: boolean;
  metrics: {
    metrics: {
      timestamp: string;
      dailyRevenue: number;
      roi: number;
      healthScore: number;
      averageEfficiency: number;
      cycleCount: number;
      id?: string;
      key?: string;
    }[];
  };
}

interface AgentDecision {
  action: Action;
  explanation: string;
  modelWeights: ModelWeights;
  timestamp: string;
}

interface MetricsHistory {
  metrics: Array<{
    timestamp: string;
    dailyRevenue: number;
    roi: number;
    healthScore: number;
    averageEfficiency: number;
    cycleCount: number;
    id?: string;
    key?: string;
  }>;
}

interface NotificationType {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'success';
}

interface Thresholds {
  MIN_EFFICIENCY: number;
  MIN_HEALTH: number;
  MIN_REVENUE: number;
  MIN_ROI: number;
  MAX_CYCLES: number;
}

interface MetricData {
  timestamp: string;
  dailyRevenue?: number;
  roi?: number;
  healthScore?: number;
  averageEfficiency?: number;
  cycleCount?: number;
  id?: string;
  key?: string;
}

const AIAgent: React.FC<AIAgentProps> = ({
  batteryCharge,
  marketPrice,
  solarIrradiance,
  temperature,
  efficiency,
  hasAlert,
  onActionExecute,
  autoExecuteEnabled,
  metrics: initialMetrics
}) => {
  const [decision, setDecision] = useState<AgentDecision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExecutionTime, setLastExecutionTime] = useState<Date | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<MetricsHistory['metrics']>([]);
  const [currentMetrics, setCurrentMetrics] = useState(initialMetrics?.metrics?.[0] || null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // Costanti per le soglie di allarme
  const THRESHOLDS: Thresholds = {
    MIN_REVENUE: 100,    // Ricavo minimo giornaliero in €
    MIN_ROI: 1.5,       // ROI minimo accettabile
    MIN_HEALTH: 70,     // Salute minima della batteria in %
    MIN_EFFICIENCY: 85, // Efficienza minima in %
    MAX_CYCLES: 50      // Numero massimo di cicli giornalieri
  };

  // Funzione per aggiungere una notifica - SPOSTATA QUI SOPRA
  const addNotification = useCallback((message: string, type: 'warning' | 'error' | 'success') => {
    try {
      const id = Date.now().toString(); // Uso timestamp per garantire unicità
      setNotifications(prev => [...prev, { id, message, type }]);

      // Rimuovi la notifica dopo 5 secondi
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    } catch (error) {
      console.error('Errore nell\'aggiunta della notifica:', error);
    }
  }, []);

  // Funzione per rimuovere una notifica
  const removeNotification = useCallback((id: string) => {
    try {
      if (!id) return;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Errore nella rimozione della notifica:', error);
    }
  }, []);

  // Inizializza le metriche se disponibili
  useEffect(() => {
    if (initialMetrics?.metrics?.length > 0) {
      setCurrentMetrics(initialMetrics.metrics[0]);
      setMetricsHistory(initialMetrics.metrics);
    }
  }, [initialMetrics]);

  const fetchDecision = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Controllo più robusto dei dati di input
      if (!batteryCharge || !marketPrice || !temperature) {
        console.warn("Dati incompleti per fetchDecision:", { 
          batteryCharge, 
          marketPrice, 
          temperature 
        });
        throw new Error("Dati di input mancanti o incompleti");
      }

      const response = await fetch('/api/ml/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batteryCharge,
          marketPrice,
          solarIrradiance: solarIrradiance || 0,
          temperature,
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          efficiency: efficiency || 0
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('Risposta API vuota');
      }
      
      setDecision(data);

      // Esegui automaticamente l'azione se in modalità auto
      if (autoExecuteEnabled && onActionExecute && data.action) {
        onActionExecute(data.action);
        setLastExecutionTime(new Date());
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      console.error('Errore nel recupero della decisione:', err);
    } finally {
      setIsLoading(false);
    }
  }, [batteryCharge, marketPrice, solarIrradiance, temperature, efficiency, autoExecuteEnabled, onActionExecute]);

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/ml/history');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data?.metrics?.length > 0) {
        setCurrentMetrics(data.metrics[data.metrics.length - 1] || null);
      }
    } catch (err) {
      console.error('Errore nel recupero delle metriche:', err);
    }
  }, []);

  // Funzione per aggiungere ID univoci ai dati delle metriche
  const addUniqueIdsToMetrics = useCallback((metrics: MetricData[]): MetricsHistory['metrics'] => {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) return [];
    
    const baseTimestamp = Date.now();
    
    const uniqueMetrics = metrics.map((metric, index) => {
      let metricTimestamp;
      try {
        if (metric.timestamp) {
          const parsedTime = new Date(metric.timestamp).getTime();
          metricTimestamp = isNaN(parsedTime) ? 
            (baseTimestamp - (metrics.length - index) * 1000) : 
            (parsedTime + (index * 100));
        } else {
          metricTimestamp = baseTimestamp - (metrics.length - index) * 1000;
        }
      } catch {
        metricTimestamp = baseTimestamp - (metrics.length - index) * 1000;
      }
      
      const uniqueId = `metric_${index}_${metricTimestamp}`;
      
      return {
        ...metric,
        id: uniqueId,
        key: uniqueId,
        timestamp: new Date(metricTimestamp).toISOString(),
        dailyRevenue: metric.dailyRevenue ?? 0,
        roi: metric.roi ?? 0,
        healthScore: metric.healthScore ?? 0,
        averageEfficiency: metric.averageEfficiency ?? 0,
        cycleCount: metric.cycleCount ?? 0
      };
    });
    
    return uniqueMetrics.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateA - dateB;
    });
  }, []);

  // Memoizza i dati delle metriche per evitare ri-render inutili
  const memoizedMetricsHistory = useMemo(() => {
    if (!metricsHistory || metricsHistory.length === 0) return [];
    
    // Crea un timestamp base per evitare duplicazioni
    const baseTimestamp = Date.now();
    
    // Crea un array di metriche con ID univoci
    return metricsHistory.map((metric, index) => ({
      ...metric,
      // Usa l'indice e il timestamp della metrica per creare un ID stabile
      uniqueId: `metric_${index}_${metric.timestamp ? new Date(metric.timestamp).getTime() : baseTimestamp}`
    }));
  }, [metricsHistory]);

  const fetchMetricsHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/ml/history');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data?.metrics) {
        // Aggiungi ID univoci ai dati
        const metricsWithIds = addUniqueIdsToMetrics(data.metrics || []);
        setMetricsHistory(metricsWithIds);
      }
    } catch (err) {
      console.error('Errore nel recupero dello storico metriche:', err);
    }
  }, [addUniqueIdsToMetrics]);

  // Effetto per controllare le soglie e inviare notifiche
  useEffect(() => {
    const checkThresholds = () => {
      if (!currentMetrics) return;

      const { efficiency, health, cycle_count } = currentMetrics;
      const { revenue_today, roi_percent } = currentMetrics;

      if (efficiency && efficiency < THRESHOLDS.MIN_EFFICIENCY) {
        addNotification(`Efficienza sotto la soglia (${THRESHOLDS.MIN_EFFICIENCY}%)`, 'warning');
      }
      if (health && health < THRESHOLDS.MIN_HEALTH) {
        addNotification(`Salute batteria sotto la soglia (${THRESHOLDS.MIN_HEALTH}%)`, 'warning');
      }
      if (cycle_count && cycle_count > THRESHOLDS.MAX_CYCLES) {
        addNotification(`Cicli sopra la soglia (${THRESHOLDS.MAX_CYCLES})`, 'warning');
      }
      if (revenue_today && revenue_today < THRESHOLDS.MIN_REVENUE) {
        addNotification(`Ricavi sotto la soglia (${THRESHOLDS.MIN_REVENUE}€)`, 'warning');
      }
      if (roi_percent && roi_percent < THRESHOLDS.MIN_ROI) {
        addNotification(`ROI sotto la soglia (${THRESHOLDS.MIN_ROI}%)`, 'warning');
      }
    };

    checkThresholds();
  }, [currentMetrics, THRESHOLDS.MIN_EFFICIENCY, THRESHOLDS.MIN_HEALTH, THRESHOLDS.MAX_CYCLES, THRESHOLDS.MIN_REVENUE, THRESHOLDS.MIN_ROI, addNotification]);

  // Custom Tooltip per i grafici
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length || !payload[0]) {
      return null;
    }
    
    const data = payload[0].payload as MetricData;
    const metric = payload[0].dataKey;
    
    if (!data || !metric) {
      return null;
    }
    
    let threshold = 0;
    let message = '';
    const value = data[metric as keyof MetricData];
    
    if (typeof value !== 'number') {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-gray-600">{formatTimestamp(label || '')}</p>
          <p className="font-semibold">{payload[0].name}: Dato non disponibile</p>
        </div>
      );
    }

    switch (metric) {
      case 'dailyRevenue':
        threshold = THRESHOLDS.MIN_REVENUE;
        message = `Distanza dalla soglia: ${(value - threshold).toFixed(2)}€`;
        break;
      case 'roi':
        threshold = THRESHOLDS.MIN_ROI;
        message = `Distanza dalla soglia: ${(value - threshold).toFixed(2)}x`;
        break;
      case 'healthScore':
        threshold = THRESHOLDS.MIN_HEALTH / 100;
        message = `Distanza dalla soglia: ${((value - threshold) * 100).toFixed(1)}%`;
        break;
      case 'averageEfficiency':
        threshold = THRESHOLDS.MIN_EFFICIENCY / 100;
        message = `Distanza dalla soglia: ${((value - threshold) * 100).toFixed(1)}%`;
        break;
      case 'cycleCount':
        threshold = THRESHOLDS.MAX_CYCLES;
        message = `Distanza dalla soglia: ${(threshold - value).toFixed(0)} cicli`;
        break;
      default:
        return null;
    }

    const isBelow = metric === 'cycleCount' ? value > threshold : value < threshold;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-gray-600">{formatTimestamp(label || '')}</p>
        <p className="font-semibold">
          {payload[0].name}: {value.toFixed(2)}
          {metric.includes('Score') || metric.includes('Efficiency') ? '%' : ''}
        </p>
        <p className={isBelow ? 'text-red-500' : 'text-green-500'}>
          {message}
        </p>
      </div>
    );
  };

  // Effetto per il polling automatico
  useEffect(() => {
    if (autoExecuteEnabled) {
      const intervalId = setInterval(fetchDecision, 5 * 60 * 1000); // Ogni 5 minuti
      return () => clearInterval(intervalId);
    }
  }, [autoExecuteEnabled, fetchDecision]);

  // Effetto per il fetch iniziale
  useEffect(() => {
    fetchDecision();
  }, [fetchDecision]);

  // Effetto per il fetch iniziale delle metriche
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Effetto per il fetch iniziale dello storico
  useEffect(() => {
    fetchMetricsHistory();
  }, [fetchMetricsHistory]);

  // Aggiorna le metriche dopo ogni azione
  useEffect(() => {
    if (lastExecutionTime) {
      fetchMetrics();
    }
  }, [lastExecutionTime, fetchMetrics]);

  // Aggiorna lo storico dopo ogni azione
  useEffect(() => {
    if (lastExecutionTime) {
      fetchMetricsHistory();
    }
  }, [lastExecutionTime, fetchMetricsHistory]);

  useEffect(() => {
    const checkThresholds = () => {
      if (!currentMetrics) return;

      const { efficiency, health, cycle_count } = currentMetrics;
      const { revenue_today, roi_percent } = currentMetrics;

      if (efficiency && efficiency < THRESHOLDS.MIN_EFFICIENCY) {
        addNotification(`Efficienza sotto la soglia (${THRESHOLDS.MIN_EFFICIENCY}%)`, 'warning');
      }
      if (health && health < THRESHOLDS.MIN_HEALTH) {
        addNotification(`Salute batteria sotto la soglia (${THRESHOLDS.MIN_HEALTH}%)`, 'warning');
      }
      if (cycle_count && cycle_count > THRESHOLDS.MAX_CYCLES) {
        addNotification(`Cicli sopra la soglia (${THRESHOLDS.MAX_CYCLES})`, 'warning');
      }
      if (revenue_today && revenue_today < THRESHOLDS.MIN_REVENUE) {
        addNotification(`Ricavi sotto la soglia (${THRESHOLDS.MIN_REVENUE}€)`, 'warning');
      }
      if (roi_percent && roi_percent < THRESHOLDS.MIN_ROI) {
        addNotification(`ROI sotto la soglia (${THRESHOLDS.MIN_ROI}%)`, 'warning');
      }
    };

    checkThresholds();
  }, [currentMetrics, THRESHOLDS.MIN_EFFICIENCY, THRESHOLDS.MIN_HEALTH, THRESHOLDS.MAX_CYCLES, THRESHOLDS.MIN_REVENUE, THRESHOLDS.MIN_ROI, addNotification]);

  const handleManualExecute = () => {
    try {
      if (decision && onActionExecute && decision.action) {
        onActionExecute(decision.action);
        setLastExecutionTime(new Date());
      }
    } catch (error) {
      console.error('Errore nell\'esecuzione manuale:', error);
      addNotification('Errore nell\'esecuzione dell\'azione', 'error');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence === undefined || confidence === null) return 'text-gray-600';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActionColor = (type: string) => {
    if (!type) return 'bg-gray-100 border-gray-500';
    switch (type) {
      case 'CHARGE': return 'bg-blue-100 border-blue-500';
      case 'DISCHARGE': return 'bg-green-100 border-green-500';
      case 'HOLD': return 'bg-gray-100 border-gray-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      // Verifica che la data sia valida
      if (isNaN(date.getTime())) return 'N/A';
      
      // Formatta l'ora con zero padding
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Errore nel formato del timestamp:', error);
      return 'N/A';
    }
  };

  const handleAutoExecuteChange = () => {
    if (onActionExecute) {
      // Notifichiamo il parent se necessario
    }
  };

  const executeAction = useCallback((action: Action) => {
    if (onActionExecute && !isLoading) {
      onActionExecute(action);
      setLastExecutionTime(new Date());
    }
  }, [onActionExecute, isLoading]);

  useEffect(() => {
    if (hasAlert) {
      // Logica per mostrare un indicatore di allarme
    }
  }, [hasAlert]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Agente AI</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleAutoExecuteChange}
            className={`px-4 py-2 rounded-lg ${
              autoExecuteEnabled 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {autoExecuteEnabled ? '🤖 Auto ON' : '🤖 Auto OFF'}
          </button>
          <button
            onClick={fetchDecision}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Analisi...' : '🔄 Aggiorna'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-500 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {decision && (
        <>
          <div className={`border-2 rounded-lg p-4 ${getActionColor(decision.action.type)}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Azione Consigliata: {decision.action.type}
                </h3>
                <p className="text-gray-600 mt-1">{decision.explanation}</p>
              </div>
              <div className={`text-right ${getConfidenceColor(decision.action.confidence)}`}>
                <div className="text-sm">Confidenza</div>
                <div className="text-2xl font-bold">
                  {(decision.action.confidence * 100)?.toFixed(1) || '0.0'}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-sm text-gray-600">Potenza</div>
                <div className="text-xl font-bold">{decision.action.power?.toFixed(2) || '0.00'} MW</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-sm text-gray-600">
                  {decision.action.expectedRevenue >= 0 ? 'Ricavo Previsto' : 'Costo Previsto'}
                </div>
                <div className="text-xl font-bold">
                  {Math.abs(decision.action.expectedRevenue)?.toFixed(2) || '0.00'}€
                </div>
              </div>
            </div>

            {!autoExecuteEnabled && onActionExecute && (
              <button
                onClick={handleManualExecute}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Esegui Azione
              </button>
            )}

            {lastExecutionTime && (
              <div className="text-sm text-gray-500 mt-2">
                Ultima esecuzione: {lastExecutionTime.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Pesi del Modello */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Pesi del Modello</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Ricavi</div>
                <div className="text-lg font-semibold">
                  {(decision.modelWeights?.revenueWeight * 100)?.toFixed(1) || '0.0'}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Salute</div>
                <div className="text-lg font-semibold">
                  {(decision.modelWeights?.healthWeight * 100)?.toFixed(1) || '0.0'}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Efficienza</div>
                <div className="text-lg font-semibold">
                  {(decision.modelWeights?.efficiencyWeight * 100)?.toFixed(1) || '0.0'}%
                </div>
              </div>
            </div>
          </div>

          {/* Metriche di Performance */}
          {currentMetrics && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Performance (24h)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">Ricavi Giornalieri</div>
                  <div className="text-xl font-bold text-green-600">
                    €{currentMetrics.dailyRevenue?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">ROI</div>
                  <div className="text-xl font-bold text-blue-600">
                    {currentMetrics.roi?.toFixed(1) || '0.0'}x
                  </div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">Cicli</div>
                  <div className="text-xl font-bold text-orange-600">
                    {currentMetrics.cycleCount || '0'}
                  </div>
                </div>
                <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-gray-600">Salute Media</div>
                  <div className="text-xl font-bold text-purple-600">
                    {(currentMetrics.healthScore * 100)?.toFixed(1) || '0.0'}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {metricsHistory.length > 0 && (
        <div className="space-y-6">
          {/* Grafico Ricavi e ROI */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Andamento Ricavi e ROI</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memoizedMetricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTimestamp}
                    interval="preserveStartEnd"
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  <ReferenceArea
                    yAxisId="left"
                    y1={0}
                    y2={THRESHOLDS.MIN_REVENUE}
                    fill="#FEE2E2"
                    fillOpacity={0.3}
                  />
                  <ReferenceArea
                    yAxisId="right"
                    y1={0}
                    y2={THRESHOLDS.MIN_ROI}
                    fill="#FEF3C7"
                    fillOpacity={0.3}
                  />
                  <ReferenceLine 
                    y={THRESHOLDS.MIN_REVENUE} 
                    yAxisId="left"
                    label="Min Ricavi" 
                    stroke="#EF4444" 
                    strokeDasharray="3 3" 
                  />
                  <ReferenceLine 
                    y={THRESHOLDS.MIN_ROI} 
                    yAxisId="right"
                    label="Min ROI" 
                    stroke="#F59E0B" 
                    strokeDasharray="3 3" 
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="dailyRevenue"
                    name="Ricavi (€)"
                    stroke="#10B981"
                    dot={false}
                    isAnimationActive={false}
                    key="line-revenue"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="roi"
                    name="ROI"
                    stroke="#3B82F6"
                    dot={false}
                    isAnimationActive={false}
                    key="line-roi"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafico Salute ed Efficienza */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Andamento Salute ed Efficienza</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memoizedMetricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTimestamp}
                    interval="preserveStartEnd"
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  <ReferenceArea
                    y1={0}
                    y2={THRESHOLDS.MIN_HEALTH}
                    fill="#FEE2E2"
                    fillOpacity={0.3}
                  />
                  <ReferenceArea
                    y1={0}
                    y2={THRESHOLDS.MIN_EFFICIENCY}
                    fill="#FEF3C7"
                    fillOpacity={0.3}
                  />
                  <ReferenceLine 
                    y={THRESHOLDS.MIN_HEALTH} 
                    label="Min Salute" 
                    stroke="#EF4444" 
                    strokeDasharray="3 3" 
                  />
                  <ReferenceLine 
                    y={THRESHOLDS.MIN_EFFICIENCY} 
                    label="Min Efficienza" 
                    stroke="#F59E0B" 
                    strokeDasharray="3 3" 
                  />
                  <Line
                    type="monotone"
                    dataKey="healthScore"
                    name="Salute"
                    stroke="#8B5CF6"
                    dot={false}
                    isAnimationActive={false}
                    key="line-health"
                  />
                  <Line
                    type="monotone"
                    dataKey="averageEfficiency"
                    name="Efficienza"
                    stroke="#F59E0B"
                    dot={false}
                    isAnimationActive={false}
                    key="line-efficiency"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafico Cicli */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Andamento Cicli</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memoizedMetricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTimestamp}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  <ReferenceArea
                    y1={THRESHOLDS.MAX_CYCLES}
                    y2={THRESHOLDS.MAX_CYCLES * 1.5}
                    fill="#FEE2E2"
                    fillOpacity={0.3}
                  />
                  <ReferenceLine 
                    y={THRESHOLDS.MAX_CYCLES} 
                    label="Max Cicli" 
                    stroke="#EF4444" 
                    strokeDasharray="3 3" 
                  />
                  <Line
                    type="stepAfter"
                    dataKey="cycleCount"
                    name="Cicli"
                    stroke="#EC4899"
                    dot={false}
                    isAnimationActive={false}
                    key="line-cycles"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Carica</div>
          <div className="text-lg font-semibold">{batteryCharge?.toFixed(1) || '0.0'}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Prezzo</div>
          <div className="text-lg font-semibold">{marketPrice?.toFixed(2) || '0.00'}€/MWh</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Temperatura</div>
          <div className="text-lg font-semibold">{temperature?.toFixed(1) || '0.0'}°C</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Efficienza</div>
          <div className="text-lg font-semibold">{efficiency?.toFixed(1) || '0.0'}%</div>
        </div>
      </div>

      {notifications.map(notification => (
        <Notification
          key={`notification_${notification.id}`}
          message={notification.message}
          type={notification.type}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default AIAgent; 