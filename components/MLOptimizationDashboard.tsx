"use client";

import React, { useState, useEffect, useContext } from 'react';
import BessStateChart from './BessStateChart';
import MLOptimizationResults from './MLOptimizationResults';
import Card from './Card';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../translations';

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
  const [isClient, setIsClient] = useState(false);
  const langContext = useContext(LanguageContext);
  if (!langContext) {
    throw new Error("LanguageContext is not provided");
  }
  const { language } = langContext;
  const t = translations[language].dashboard;

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedAsset('bess')}
            className={`px-4 py-2 rounded ${
              selectedAsset === 'bess'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t.bess}
          </button>
          <button
            onClick={() => setSelectedAsset('pv')}
            className={`px-4 py-2 rounded ${
              selectedAsset === 'pv'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {t.pv}
          </button>
        </div>
      </div>

      <MLOptimizationResults
        assetType={selectedAsset}
        totalRevenue={selectedAsset === 'bess' ? 125000 : 85000}
        optimizationScore={selectedAsset === 'bess' ? 92 : 88}
        mlAlgorithm={
          selectedAsset === 'bess'
            ? t.bessAlgorithm
            : t.pvAlgorithm
        }
        mlDescription={
          selectedAsset === 'bess'
            ? t.bessDescription
            : t.pvDescription
        }
      />

      <Card title={t.trendTitle}>
        <BessStateChart
          data={selectedAsset === 'bess' ? bessData : pvData}
          assetType={selectedAsset}
        />
      </Card>
    </div>
  );
};

export default MLOptimizationDashboard; 