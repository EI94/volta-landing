import React, { useContext } from 'react';
import BESSDataChart from './BESSDataChart';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../translations';

const BESSConfig: React.FC = () => {
  const langContext = useContext(LanguageContext);
  if (!langContext) {
    throw new Error("LanguageContext is not provided");
  }
  const { language } = langContext;
  const t = translations[language].bess;
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">{t.configTitle}</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">{t.dataTitle}</h3>
        <div className="mb-4">
          <BESSDataChart dataFile="bess_60MW_4h_viterbo_may2025.csv" />
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          {t.dataDescription}
        </p>
      </div>
    </div>
  );
};

export default BESSConfig; 