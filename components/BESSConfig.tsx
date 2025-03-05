import React from 'react';
import BESSDataChart from './BESSDataChart';

const BESSConfig: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Configurazione BESS</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Dati BESS Viterbo</h3>
        <div className="mb-4">
          <BESSDataChart dataFile="bess_60MW_4h_viterbo_may2025.csv" />
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Visualizzazione dati per sistema di accumulo energetico (BESS) da 60 MW / 240 MWh situato a Viterbo.
          I dati mostrano l&apos;andamento della potenza, dello stato di carica, e altri parametri operativi.
        </p>
      </div>
    </div>
  );
};

export default BESSConfig; 