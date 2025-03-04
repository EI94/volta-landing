// components/WeatherOpen.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface WeatherData {
  current?: {
    temperature: number;
    humidity: number;
    conditions: string;
    icon: string;
    windSpeed: number;
    precipitation: number;
  };
  forecast?: {
    labels?: string[];
    temperatures?: number[];
    precipitation?: number[];
    times?: string[];
    temperatures_min?: number[];
    temperatures_max?: number[];
  };
  location?: {
    name: string;
    country: string;
  };
  error?: string;
}

export default function WeatherOpen({ city }: { city: string }): JSX.Element {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        const res = await fetch(`/api/weatherOpen?city=${encodeURIComponent(city)}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          setError(errorData.error || 'Errore nel recupero dei dati meteo');
          return;
        }
        
        const data = await res.json();
        
        // Adatta i dati nel formato atteso
        const adaptedData: WeatherData = {
          ...data,
          forecast: {
            ...(data.forecast || {}),
            labels: data.forecast?.times || data.forecast?.labels || generateHourLabels(),
            temperatures: data.forecast?.temperatures || [],
            precipitation: data.forecast?.precipitation || []
          }
        };
        
        setWeatherData(adaptedData);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Errore sconosciuto nel recupero dei dati meteo');
        }
      }
    }

    fetchWeatherData();
  }, [city]);

  // Funzione di supporto per generare etichette orarie
  function generateHourLabels() {
    const hours = [];
    const now = new Date();
    for (let i = 0; i < 24; i += 3) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      hours.push(time.getHours() + ':00');
    }
    return hours;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-700 font-medium">Errore</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-600">Caricamento dati meteo...</p>
      </div>
    );
  }

  // Crea i dati per il grafico
  const chartData = (weatherData.forecast?.labels || []).map((label, index) => ({
    name: label,
    temperatura: weatherData.forecast?.temperatures?.[index] || 0,
    precipitazioni: weatherData.forecast?.precipitation?.[index] || 0,
    id: `forecast-item-${index}`
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">{weatherData.location?.name || city}</h3>
          <p className="text-gray-600">{weatherData.location?.country}</p>
        </div>
        {weatherData.current && (
          <div className="text-right">
            <div className="flex items-center justify-end">
              {weatherData.current.icon && (
                <img 
                  src={`http://openweathermap.org/img/wn/${weatherData.current.icon}@2x.png`}
                  alt={weatherData.current.conditions}
                  className="w-12 h-12"
                />
              )}
              <span className="text-3xl font-bold">{weatherData.current.temperature}°C</span>
            </div>
            <p className="text-gray-600">{weatherData.current.conditions}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded p-3 text-center">
          <p className="text-sm text-gray-600">Umidità</p>
          <p className="text-xl font-semibold">{weatherData.current?.humidity || 'N/A'}%</p>
        </div>
        <div className="bg-blue-50 rounded p-3 text-center">
          <p className="text-sm text-gray-600">Vento</p>
          <p className="text-xl font-semibold">{weatherData.current?.windSpeed || 'N/A'} km/h</p>
        </div>
        <div className="bg-blue-50 rounded p-3 text-center">
          <p className="text-sm text-gray-600">Precipitazioni</p>
          <p className="text-xl font-semibold">{weatherData.current?.precipitation || 'N/A'} mm</p>
        </div>
      </div>

      <h4 className="text-lg font-semibold mb-2">Previsioni</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperatura"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
              name="Temperatura (°C)"
              key="line-temperatura"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="precipitazioni"
              stroke="#82ca9d"
              name="Precipitazioni (mm)"
              key="line-precipitazioni"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
