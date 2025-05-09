"use client";

import React, { useState, useEffect, useContext } from 'react';
import { LineChart, Line, BarChart, Bar, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Battery, Zap, Thermometer, Wind, AlertTriangle } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../translations';

interface BESSDataChartProps {
  dataFile?: string;
}

interface BESSRecord {
  Timestamp: string;
  Market_Price_EUR_MWh: number;
  BESS_Power_kW: number;
  BESS_SoC_MWh: number;
  'BESS_SoC_%': number;
  BESS_Temperature_C: number;
  Operating_Mode: string;
  Fault_Flag: number;
  Fault_Code: number;
  Cycle_Count: number;
  AC_Voltage_V: number;
  AC_Frequency_Hz: number;
}

// Funzione per formattare i dati per il grafico
const formatDataForChart = (data: BESSRecord[], metric: keyof BESSRecord) => {
  return data.map(record => ({
    timestamp: new Date(record.Timestamp),
    value: record[metric],
    mode: record.Operating_Mode,
    fault: record.Fault_Flag === 1
  }));
};

// Componente principale
const BESSDataChart: React.FC<BESSDataChartProps> = ({ dataFile = 'bess_60MW_4h_viterbo_may2025.csv' }) => {
  const [data, setData] = useState<BESSRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<keyof BESSRecord>('BESS_Power_kW');
  const [selectedDateRange, setSelectedDateRange] = useState('day');
  const [stats, setStats] = useState<{ min: number; max: number; avg: number }>({ min: 0, max: 0, avg: 0 });

  const langContext = useContext(LanguageContext);
  if (!langContext) {
    throw new Error("LanguageContext is not provided");
  }
  const { language } = langContext;
  const t = translations[language].bess;

  // Metriche disponibili per la visualizzazione
  const metrics = [
    { key: 'BESS_Power_kW', label: t.powerKW, color: '#8884d8', unit: 'kW' },
    { key: 'BESS_SoC_%', label: t.stateOfCharge, color: '#82ca9d', unit: '%' },
    { key: 'Market_Price_EUR_MWh', label: t.marketPrice, color: '#ffc658', unit: '€/MWh' },
    { key: 'BESS_Temperature_C', label: t.temperatureC, color: '#ff8042', unit: '°C' },
    { key: 'AC_Frequency_Hz', label: t.frequency, color: '#0088fe', unit: 'Hz' }
  ];

  // Filtraggio per intervallo di date
  const filterByDateRange = (data: BESSRecord[], range: string) => {
    const now = new Date(data[data.length - 1].Timestamp);
    let startDate: Date;

    switch (range) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return data;
    }

    return data.filter(record => new Date(record.Timestamp) >= startDate);
  };

  // Caricamento dei dati
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/bess-data?file=${dataFile}&format=json&limit=2000`);
        
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        if (!Array.isArray(jsonData)) {
          throw new Error('Formato dati non valido');
        }
        
        // Converti stringhe in numeri
        const parsedData = jsonData.map(record => ({
          ...record,
          Market_Price_EUR_MWh: parseFloat(record.Market_Price_EUR_MWh),
          BESS_Power_kW: parseFloat(record.BESS_Power_kW),
          BESS_SoC_MWh: parseFloat(record.BESS_SoC_MWh),
          'BESS_SoC_%': parseFloat(record['BESS_SoC_%']),
          BESS_Temperature_C: parseFloat(record.BESS_Temperature_C),
          Fault_Flag: parseInt(record.Fault_Flag),
          Fault_Code: parseInt(record.Fault_Code),
          Cycle_Count: parseInt(record.Cycle_Count),
          AC_Voltage_V: parseFloat(record.AC_Voltage_V),
          AC_Frequency_Hz: parseFloat(record.AC_Frequency_Hz)
        }));
        
        setData(parsedData);
      } catch (err) {
        setError(`Errore nel caricamento dei dati: ${err instanceof Error ? err.message : String(err)}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dataFile]);

  // Calcolo statistiche
  useEffect(() => {
    if (data.length > 0) {
      const filteredData = filterByDateRange(data, selectedDateRange);
      const values = filteredData.map(record => record[selectedMetric] as number);
      
      setStats({
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, value) => sum + value, 0) / values.length
      });
    }
  }, [data, selectedMetric, selectedDateRange]);

  // Ottieni solo i dati per il range di date selezionato
  const filteredData = data.length > 0 ? filterByDateRange(data, selectedDateRange) : [];
  
  // Prepara i dati per il grafico
  const chartData = formatDataForChart(filteredData, selectedMetric);
  
  // Calcola i dati per il grafico SoC
  const socChartData = data.length > 0 
    ? filterByDateRange(data, selectedDateRange).map(record => ({
        timestamp: new Date(record.Timestamp),
        soc: record['BESS_SoC_%'],
        mode: record.Operating_Mode
      }))
    : [];

  // Calcola la percentuale di tempo in ciascuna modalità operativa
  const calculateModeStats = () => {
    if (filteredData.length === 0) return [];
    
    const modes: Record<string, number> = {};
    filteredData.forEach(record => {
      const mode = record.Operating_Mode;
      modes[mode] = (modes[mode] || 0) + 1;
    });
    
    return Object.entries(modes).map(([name, count]) => ({
      name,
      value: (count / filteredData.length) * 100
    }));
  };
  
  const modeStats = calculateModeStats();
  
  // Calcola il numero di faults per tipo
  const calculateFaultStats = () => {
    if (filteredData.length === 0) return [];
    
    const faults: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0 };
    filteredData.forEach(record => {
      const code = record.Fault_Code.toString();
      faults[code] = (faults[code] || 0) + 1;
    });
    
    return Object.entries(faults).map(([code, count]) => ({
      name: code === '0' ? 'No Fault' : `Fault ${code}`,
      value: count
    })).filter(item => item.name !== 'No Fault' || item.value > 0);
  };
  
  const faultStats = calculateFaultStats();

  // Funzione per ottenere un'icona basata sulla metrica
  const getMetricIcon = (metricKey: string) => {
    switch (metricKey) {
      case 'BESS_Power_kW':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'BESS_SoC_%':
        return <Battery className="h-5 w-5 text-green-500" />;
      case 'BESS_Temperature_C':
        return <Thermometer className="h-5 w-5 text-red-500" />;
      case 'Market_Price_EUR_MWh':
        return <span className="text-yellow-500">€</span>;
      case 'AC_Frequency_Hz':
        return <Wind className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  // Funzione per formattare le date nell'asse X
  const formatXAxis = (tickItem: Date) => {
    if (selectedDateRange === 'hour') {
      return tickItem.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (selectedDateRange === 'day') {
      return `${tickItem.getHours()}:${tickItem.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return tickItem.toLocaleDateString();
    }
  };

  // Ottieni il colore corrente della metrica selezionata
  const currentMetricColor = metrics.find(m => m.key === selectedMetric)?.color || '#8884d8';
  const currentMetricUnit = metrics.find(m => m.key === selectedMetric)?.unit || '';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{t.systemStorage}</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>{t.loadingData}</p>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50 mb-4">
          <p className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            {t.errorLoading} {error}
          </p>
        </div>
      ) : (
        <>
          {/* Filtri e controlli */}
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex flex-wrap gap-2">
              {metrics.map(metric => (
                <button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key as keyof BESSRecord)}
                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                    selectedMetric === metric.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getMetricIcon(metric.key)}
                  <span className="ml-1">{metric.label}</span>
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              {['hour', 'day', 'week', 'month'].map(range => (
                <button
                  key={range}
                  onClick={() => setSelectedDateRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedDateRange === range
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.timeRange[range as keyof typeof t.timeRange]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Statistiche principali */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">{t.statistics.minValue}</p>
              <p className="text-2xl font-bold">{stats.min.toFixed(2)} {currentMetricUnit}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">{t.statistics.maxValue}</p>
              <p className="text-2xl font-bold">{stats.max.toFixed(2)} {currentMetricUnit}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">{t.statistics.avgValue}</p>
              <p className="text-2xl font-bold">{stats.avg.toFixed(2)} {currentMetricUnit}</p>
            </div>
          </div>
          
          {/* Grafico principale */}
          <div className="h-80 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  type="category"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleString();
                  }}
                  formatter={(value: number | string) => {
                    return [typeof value === 'number' ? value.toFixed(2) + ' ' + currentMetricUnit : value, metrics.find(m => m.key === selectedMetric)?.label || ''];
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={currentMetricColor} 
                  activeDot={{ r: 8 }} 
                  name={metrics.find(m => m.key === selectedMetric)?.label || ''}
                  isAnimationActive={false}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Stato di carica nel tempo */}
          <h3 className="text-lg font-semibold mb-3">{t.stateOfCharge}</h3>
          <div className="h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={socChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  type="category"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                />
                <YAxis domain={[0, 100]} />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleString();
                  }}
                  formatter={(value: number | string) => {
                    return [typeof value === 'number' ? value.toFixed(2) + ' %' : value, t.stateOfCharge];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="soc" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  name="SoC (%)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* Statistiche per modalità operativa e guasti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">{t.operatingModes}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modeStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, t.percentTime]} />
                    <Bar dataKey="value" fill="#8884d8" name={t.percentTime} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">{t.detectedFaults}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={faultStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [value, t.count]} />
                    <Bar dataKey="value" fill="#ff8042" name={t.count} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Note e info aggiuntive */}
          <div className="mt-8 border-t pt-4 text-sm text-gray-600">
            <p>
              <span className="font-medium">{t.notes}</span> {t.notesText}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default BESSDataChart; 