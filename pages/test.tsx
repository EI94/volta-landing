import React, { useState } from 'react';
import SiteComparisonChart from '../components/SiteComparisonChart';
import TimeRangeFilter from '../components/TimeRangeFilter';
import MetricsSelector from '../components/MetricsSelector';

// Funzione per generare dati di test
const generateTestData = (hours: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now.getTime() - (hours - i) * 60 * 60 * 1000);
    
    // Simula valori realistici
    const efficiency_siteA = 85 + Math.random() * 10;
    const efficiency_siteB = 82 + Math.random() * 10;
    const chargeLevel_siteA = 20 + Math.sin(i / 6) * 40 + Math.random() * 10;
    const chargeLevel_siteB = 30 + Math.sin(i / 6 + 1) * 35 + Math.random() * 10;
    const powerOutput_siteA = Math.max(0, 2000 + Math.sin(i / 4) * 1500 + Math.random() * 500);
    const powerOutput_siteB = Math.max(0, 1800 + Math.sin(i / 4 + 0.5) * 1300 + Math.random() * 500);
    const revenue_siteA = powerOutput_siteA * (50 + Math.sin(i / 8) * 20) / 1000;
    const revenue_siteB = powerOutput_siteB * (50 + Math.sin(i / 8) * 20) / 1000;

    data.push({
      timestamp,
      efficiency_siteA,
      efficiency_siteB,
      chargeLevel_siteA,
      chargeLevel_siteB,
      powerOutput_siteA,
      powerOutput_siteB,
      revenue_siteA,
      revenue_siteB
    });
  }

  return data;
};

export default function TestPage() {
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'efficiency',
    'chargeLevel',
    'powerOutput',
    'revenue'
  ]);

  // Genera dati di test in base al timeRange selezionato
  const getTestData = () => {
    switch (timeRange) {
      case '1h':
        return generateTestData(60);
      case '6h':
        return generateTestData(360);
      case '24h':
        return generateTestData(1440);
      case '7d':
        return generateTestData(168 * 60);
      case '30d':
        return generateTestData(720 * 60);
      default:
        return generateTestData(1440);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Confronto Siti</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Controlli</h2>
            <TimeRangeFilter
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </div>
          
          <MetricsSelector
            selectedMetrics={selectedMetrics}
            onMetricsChange={setSelectedMetrics}
          />
        </div>

        <SiteComparisonChart
          data={getTestData()}
          timeRange={timeRange}
          metrics={selectedMetrics}
        />
      </div>
    </div>
  );
} 