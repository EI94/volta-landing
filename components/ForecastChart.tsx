import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastChartProps {
  marketForecast: Array<{
    timestamp: Date;
    predictedPrice: number;
    upperBound: number;
    lowerBound: number;
  }>;
  weatherForecast: Array<{
    timestamp: Date;
    cloudCover: number;
    solarIrradiance: number;
  }>;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ marketForecast, weatherForecast }) => {
  // Combina i dati di mercato e meteo
  const combinedData = marketForecast.map(market => {
    const weather = weatherForecast.find(
      w => new Date(w.timestamp).getTime() === new Date(market.timestamp).getTime()
    );
    return {
      time: new Date(market.timestamp).toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      price: market.predictedPrice,
      upperBound: market.upperBound,
      lowerBound: market.lowerBound,
      cloudCover: weather?.cloudCover || 0,
      solarIrradiance: weather?.solarIrradiance || 0
    };
  });

  return (
    <div className="w-full h-[500px] p-4">
      <h3 className="text-xl font-semibold mb-4">Previsioni Mercato e Meteo</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={combinedData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="price"
            name="Prezzo Previsto (€/MWh)"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.3}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="upperBound"
            name="Limite Superiore"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.1}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="lowerBound"
            name="Limite Inferiore"
            stroke="#ffc658"
            fill="#ffc658"
            fillOpacity={0.1}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="solarIrradiance"
            name="Irraggiamento (W/m²)"
            stroke="#ff7300"
            fill="#ff7300"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart; 