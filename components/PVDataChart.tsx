import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PVData {
  Timestamp: string;
  Irradiance_Wm2: number;
  ModuleTemp_C: number;
  PowerAC_kW: number;
  VoltageAC_V: number;
  CurrentAC_A: number;
  Frequency_Hz: number;
  Fault_Flag: number;
}

interface PVDataChartProps {
  dataFile?: string;
  title?: string;
}

const PVDataChart: React.FC<PVDataChartProps> = ({ 
  dataFile = 'inverter_data_12MW_north_milan_july2023.csv',
  title = 'Dati Impianto Fotovoltaico 12MW'
}) => {
  const [data, setData] = useState<PVData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('PowerAC_kW');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Utilizziamo la nuova API con formato JSON e limite 500 righe
        const response = await fetch(`/api/pv-data?file=${dataFile}&format=json&limit=500`);
        
        if (!response.ok) {
          throw new Error(`Errore nel caricamento dei dati: ${response.status}`);
        }

        const jsonData = await response.json();
        
        if (Array.isArray(jsonData)) {
          setData(jsonData);
        } else if (jsonData.error) {
          throw new Error(jsonData.error);
        } else {
          throw new Error('Formato dati non valido');
        }
      } catch (err) {
        console.error('Errore nel caricamento dei dati:', err);
        setError(`Errore nel caricamento dei dati: ${err instanceof Error ? err.message : 'Errore sconosciuto'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dataFile]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const metrics = [
    { id: 'PowerAC_kW', label: 'Potenza AC (kW)', color: '#8884d8' },
    { id: 'Irradiance_Wm2', label: 'Irradiazione (W/m²)', color: '#ffc658' },
    { id: 'ModuleTemp_C', label: 'Temperatura Moduli (°C)', color: '#ff8042' },
    { id: 'VoltageAC_V', label: 'Tensione AC (V)', color: '#82ca9d' },
    { id: 'CurrentAC_A', label: 'Corrente AC (A)', color: '#ff7300' },
    { id: 'Frequency_Hz', label: 'Frequenza (Hz)', color: '#0088fe' }
  ];

  const getMetricColor = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.color : '#8884d8';
  };

  const getMetricLabel = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.label : metricId;
  };

  const getYAxisDomain = (metricId: string) => {
    switch(metricId) {
      case 'Frequency_Hz':
        return [49.9, 50.1]; // Dominio per la frequenza
      case 'ModuleTemp_C':
        return [10, 60]; // Dominio per la temperatura
      case 'PowerAC_kW':
        return [0, 12000]; // Dominio per la potenza
      case 'Irradiance_Wm2':
        return [0, 1200]; // Dominio per l'irradiazione
      default:
        return ['auto', 'auto'];
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Caricamento dati in corso...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="text-center p-10">Nessun dato disponibile</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Metrica da visualizzare:
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          {metrics.map(metric => (
            <option key={metric.id} value={metric.id}>
              {metric.label}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="Timestamp" 
            tickFormatter={formatTimestamp}
            label={{ value: 'Data e Ora', position: 'insideBottomRight', offset: 0 }}
          />
          <YAxis 
            domain={getYAxisDomain(selectedMetric)}
            label={{ 
              value: getMetricLabel(selectedMetric), 
              angle: -90, 
              position: 'insideLeft' 
            }} 
          />
          <Tooltip 
            formatter={(value: number | string) => typeof value === 'number' ? value.toFixed(2) : value} 
            labelFormatter={formatTimestamp} 
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={selectedMetric} 
            stroke={getMetricColor(selectedMetric)} 
            activeDot={{ r: 8 }} 
            name={getMetricLabel(selectedMetric)}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Potenza Massima</h3>
          <p className="text-2xl font-bold">
            {Math.max(...data.map(d => d.PowerAC_kW)).toFixed(2)} kW
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Temperatura Massima</h3>
          <p className="text-2xl font-bold">
            {Math.max(...data.map(d => d.ModuleTemp_C)).toFixed(2)} °C
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Guasti Rilevati</h3>
          <p className="text-2xl font-bold">
            {data.filter(d => d.Fault_Flag === 1).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PVDataChart; 