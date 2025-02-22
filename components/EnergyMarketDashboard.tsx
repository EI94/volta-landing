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
  trend: { labels: string[]; prices: number[] };
}

export default function EnergyMarketDashboard(): JSX.Element {
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const res = await fetch("/api/energyMarketReal");
        const data = await res.json();
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data", error);
      }
    }
    fetchMarketData();
  }, []);

  if (!marketData) return <p>Loading market data...</p>;

  const chartData = {
    labels: marketData.trend.labels,
    datasets: [
      {
        label: "Price (€/MWh)",
        data: marketData.trend.prices,
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

