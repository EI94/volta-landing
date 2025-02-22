"use client";

import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ForecastEntry {
  dt: number;
  main: { temp: number };
}

interface OpenWeatherResponse {
  list: ForecastEntry[];
  city: { name: string; country: string };
}

interface WeatherData {
  location: string;
  forecast: {
    labels: string[];
    irradiance: number[];
    temperature: number[];
  };
  favorable: boolean;
}

export default function WeatherForecast({ city = "Viterbo,IT" }: { city?: string }): JSX.Element {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`/api/weatherReal?city=${encodeURIComponent(city)}`);
        const data: OpenWeatherResponse = await res.json();

        // Estrai le previsioni per i primi 5 periodi
        const labels = data.list.slice(0, 5).map((entry: ForecastEntry) => {
          const date = new Date(entry.dt * 1000);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        const temperature = data.list.slice(0, 5).map((entry: ForecastEntry) => entry.main.temp);
        // Simula irradiance basata sulla temperatura (esempio)
        const irradiance = temperature.map((temp: number) => Math.max(0, (temp - 20) * 50));

        setWeatherData({
          location: data.city.name + ", " + data.city.country,
          forecast: { labels, irradiance, temperature },
          favorable: temperature.every((t: number) => t > 20),
        });
      } catch (error) {
        console.error("Error fetching weather data", error);
      }
    }
    fetchWeather();
  }, [city]);

  if (!weatherData) return <p>Loading weather data...</p>;

  const chartData = {
    labels: weatherData.forecast.labels,
    datasets: [
      {
        label: "Irradiance (W/m²)",
        data: weatherData.forecast.irradiance,
        backgroundColor: "rgba(255, 159, 64, 0.5)",
      },
      {
        label: "Temperature (°C)",
        data: weatherData.forecast.temperature,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Weather Forecast" },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Weather Forecast for {weatherData.location}</h2>
      <Bar data={chartData} options={options} />
      <p className="mt-4 text-center text-lg">
        Conditions are {weatherData.favorable ? "favorable" : "not favorable"} for renewable generation.
      </p>
    </div>
  );
}

