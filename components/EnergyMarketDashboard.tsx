"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface MarketData {
  currentPrice: number;
  trend?: { labels: string[]; prices: number[] };
  timestamp?: string;
  dayAheadPrice?: number;
  marketTrend?: string; // 'up', 'down', or 'stable'
  volatilityIndex?: number;
  tradingVolume?: number;
}

interface EnergyMarketDashboardProps {
  city?: string;
}

export default function EnergyMarketDashboard({ city = "Milano" }: EnergyMarketDashboardProps): JSX.Element {
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const res = await fetch(`/api/energy-market${city ? `?city=${encodeURIComponent(city)}` : ""}`);
        const data = await res.json();
        
        const adaptedData: MarketData = {
          currentPrice: data.currentPrice,
          trend: data.trend || {
            labels: ['6h', '12h', '18h', '24h', '30h', '36h'],
            prices: [
              data.currentPrice * 0.95,
              data.currentPrice,
              data.currentPrice * (data.marketTrend === 'up' ? 1.05 : data.marketTrend === 'down' ? 0.95 : 1),
              data.dayAheadPrice || data.currentPrice * 1.02,
              data.dayAheadPrice * 1.01 || data.currentPrice * 1.03,
              data.dayAheadPrice * 1.02 || data.currentPrice * 1.04
            ]
          },
          timestamp: data.timestamp || data.lastUpdate,
          dayAheadPrice: data.dayAheadPrice,
          marketTrend: data.marketTrend,
          volatilityIndex: data.volatilityIndex,
          tradingVolume: data.tradingVolume
        };
        
        setMarketData(adaptedData);
      } catch (error) {
        console.error("Error fetching market data", error);
      }
    }
    fetchMarketData();
  }, [city]);

  if (!marketData) {
    return <p className="text-center py-4">Caricamento dati di mercato...</p>;
  }

  const chartData = {
    labels: marketData.trend?.labels || [],
    datasets: [
      {
        label: "Price (€/MWh)",
        data: marketData.trend?.prices || [],
        borderColor: "rgba(37, 99, 235, 1)",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Energy Market Price Trend" },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="mb-4 text-center">
        <p className="text-xl font-semibold">Current Price: €{marketData.currentPrice}/MWh</p>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
}

