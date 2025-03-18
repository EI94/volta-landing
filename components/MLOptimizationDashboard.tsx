"use client";

import React, { useState } from 'react';
import BessStateChart from './BessStateChart';
import MLOptimizationResults from './MLOptimizationResults';
import Card from './Card';

interface MLOptimizationDashboardProps {
  bessData: Array<{
    timestamp: Date;
    chargePercent: number;
    healthPercent: number;
    temperature: number;
  }>;
  pvData: Array<{
    timestamp: Date;
    outputMW: number;
    performanceRatio: number;
    temperature: number;
  }>;
}

const MLOptimizationDashboard: React.FC<MLOptimizationDashboardProps> = ({
  bessData,
  pvData
}) => {
  const [selectedAsset, setSelectedAsset] = useState<'bess' | 'pv'>('bess');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Ottimizzazione ML</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedAsset('bess')}
            className={`px-4 py-2 rounded ${
              selectedAsset === 'bess'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            BESS
          </button>
          <button
            onClick={() => setSelectedAsset('pv')}
            className={`px-4 py-2 rounded ${
              selectedAsset === 'pv'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Fotovoltaico
          </button>
        </div>
      </div>

      <MLOptimizationResults
        assetType={selectedAsset}
        totalRevenue={selectedAsset === 'bess' ? 125000 : 85000}
        optimizationScore={selectedAsset === 'bess' ? 92 : 88}
        mlAlgorithm={
          selectedAsset === 'bess'
            ? 'Deep Reinforcement Learning (DRL) con Q-Learning'
            : 'Random Forest con Time Series Analysis'
        }
        mlDescription={
          selectedAsset === 'bess'
            ? 'Ottimizza i cicli di carica/scarica per massimizzare il profitto considerando i prezzi di mercato e la degradazione della batteria.'
            : 'Prevede la produzione solare e ottimizza il timing delle vendite di energia basandosi su dati meteorologici e storici.'
        }
      />

      <Card title="Andamento Storico">
        <BessStateChart
          data={selectedAsset === 'bess' ? bessData : pvData}
          assetType={selectedAsset}
        />
      </Card>
    </div>
  );
};

export default MLOptimizationDashboard; 