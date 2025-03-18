"use client";

import React from 'react';
import Card from './Card';

interface MLOptimizationResultsProps {
  assetType: 'bess' | 'pv';
  totalRevenue: number;
  optimizationScore: number;
  mlAlgorithm: string;
  mlDescription: string;
}

const MLOptimizationResults: React.FC<MLOptimizationResultsProps> = ({
  assetType,
  totalRevenue,
  optimizationScore,
  mlAlgorithm,
  mlDescription
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Risultati Ottimizzazione">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Asset</p>
            <p className="text-lg font-medium">{assetType === 'bess' ? 'Batteria' : 'Fotovoltaico'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ricavo Totale</p>
            <p className="text-lg font-medium text-green-600">€{totalRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Punteggio Ottimizzazione</p>
            <p className="text-lg font-medium text-blue-600">{optimizationScore}%</p>
          </div>
        </div>
      </Card>

      <Card title="Algoritmo ML Utilizzato">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Algoritmo</p>
            <p className="text-lg font-medium">{mlAlgorithm}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Descrizione</p>
            <p className="text-base text-gray-700">{mlDescription}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MLOptimizationResults; 