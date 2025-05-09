"use client";

import React, { useContext } from 'react';
import Card from './Card';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../translations';

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
  const langContext = useContext(LanguageContext);
  if (!langContext) {
    throw new Error("LanguageContext is not provided");
  }
  const { language } = langContext;
  const t = translations[language].dashboard;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title={t.resultsTitle}>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">{t.asset}</p>
            <p className="text-lg font-medium">{assetType === 'bess' ? t.battery : t.solarPV}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t.totalRevenue}</p>
            <p className="text-lg font-medium text-green-600">€{totalRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t.optimizationScore}</p>
            <p className="text-lg font-medium text-blue-600">{optimizationScore}%</p>
          </div>
        </div>
      </Card>

      <Card title={t.algorithmTitle}>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">{t.algorithm}</p>
            <p className="text-lg font-medium">{mlAlgorithm}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t.description}</p>
            <p className="text-base text-gray-700">{mlDescription}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MLOptimizationResults; 