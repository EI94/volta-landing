// components/KPIGraph.tsx
"use client";

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

export default function KPIGraph(): JSX.Element {
  // Dati simulati per il grafico dei prezzi (questi possono essere aggiornati dinamicamente in futuro)
  const data = {
    labels: ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30"],
    datasets: [
      {
        label: "Price (€/MWh)",
        data: [48, 50, 51, 50.5, 52, 51.5, 50],
        borderColor: "rgba(37, 99, 235, 1)",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Energy Market Price Trend",
      },
    },
  };

  return <Line data={data} options={options} />;
}
