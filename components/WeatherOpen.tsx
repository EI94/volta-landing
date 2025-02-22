// components/WeatherOpen.tsx
"use client";

import { useState, useEffect } from "react";

interface OpenWeatherData {
  location: string;
  forecast: {
    labels: string[];
    temperatures: number[];
    irradiance: number[];
  };
  favorable: boolean;
}

export default function WeatherOpen({ city }: { city: string }): JSX.Element {
  const [data, setData] = useState<OpenWeatherData | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`/api/weatherOpen?city=${encodeURIComponent(city)}`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Error fetching weather data");
          return;
        }
        const json: OpenWeatherData = await res.json();
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      }
    }
    fetchWeather();
  }, [city]);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading weather data...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-4">Weather Forecast for {data.location}</h2>
      <ul>
        {data.forecast.labels.map((label, index) => (
          <li key={index}>
            {label}: {data.forecast.temperatures[index]}°C, Irradiance: {data.forecast.irradiance[index]} W/m²
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-lg">
        Conditions are {data.favorable ? "favorable" : "not favorable"} for renewable generation.
      </p>
    </div>
  );
}
