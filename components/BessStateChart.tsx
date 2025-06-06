import React, { useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../translations';

// Estendo l'interfaccia per supportare sia BESS che PV
interface BessStateChartProps {
  data: Array<{
    timestamp: Date;
    chargePercent?: number;
    healthPercent?: number;
    temperature?: number;
    outputMW?: number;
    performanceRatio?: number;
  }>;
  assetType?: 'bess' | 'pv';
}

interface TooltipPayload {
  name: string;
  value: number;
  unit?: string;
  color: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// Funzione per formattare i timestamp
const formatTimestamp = (timestamp: Date | string): string => {
  if (!timestamp) return '';
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', timestamp);
    return 'Invalid date';
  }
  
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Funzione per personalizzare il tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-md rounded p-3 border border-gray-200">
        <p className="font-medium text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)} {entry.unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BessStateChart: React.FC<BessStateChartProps> = ({ data, assetType = 'bess' }) => {
  // Aggiungi il context per la lingua
  const langContext = useContext(LanguageContext);
  if (!langContext) {
    throw new Error("LanguageContext is not provided");
  }
  const { language } = langContext;
  const t = translations[language].bessChart;
  
  if (!data || data.length === 0) {
    return <div className="text-center py-10">{t.noDataAvailable}</div>;
  }
  
  // Aggiungi ID unici ai dati per evitare avvisi di chiave duplicata di React
  const chartData = data.map((item, index) => ({
    ...item,
    id: `data_${index}_${item.timestamp instanceof Date ? item.timestamp.getTime() : new Date(item.timestamp).getTime()}`,
    time: formatTimestamp(item.timestamp)
  }));

  return (
    <div className="w-full h-[400px] p-4">
      <h3 className="text-xl font-semibold mb-4">{t.bessStatusChart}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          
          {assetType === 'bess' ? (
            // Linee per BESS
            <>
              <YAxis 
                yAxisId="left" 
                domain={[0, 100]} 
                orientation="left" 
                unit="%" 
              />
              <YAxis 
                yAxisId="right" 
                domain={[10, 60]} 
                orientation="right" 
                unit="°C" 
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend verticalAlign="top" height={36} />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="chargePercent"
                name={t.charge}
                stroke="#2196F3"
                unit="%"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="healthPercent"
                name={t.health}
                stroke="#4CAF50"
                unit="%"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                name={t.temperature}
                stroke="#FF9800"
                unit="°C"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </>
          ) : (
            // Linee per PV
            <>
              <YAxis 
                yAxisId="left" 
                domain={[0, 'auto']} 
                orientation="left" 
                unit=" MW" 
              />
              <YAxis 
                yAxisId="right" 
                domain={[0, 100]} 
                orientation="right" 
                unit="%" 
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend verticalAlign="top" height={36} />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="outputMW"
                name={t.production}
                stroke="#FF5722"
                unit=" MW"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="performanceRatio"
                name={t.performanceRatio}
                stroke="#9C27B0"
                unit="%"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                name={t.temperature}
                stroke="#FF9800"
                unit="°C"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BessStateChart; 