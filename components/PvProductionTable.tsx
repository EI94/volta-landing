import React from 'react';

interface PvProductionEntry {
  timestamp: Date;
  expectedPower: number;
  solarIrradiance?: number;
  cloudCover?: number;
  confidence: number;
}

interface PvProductionTableProps {
  schedule: PvProductionEntry[];
}

const PvProductionTable: React.FC<PvProductionTableProps> = ({ schedule }) => {
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcola il totale di produzione prevista per il giorno
  const totalDailyProduction = schedule.reduce((total, entry) => total + entry.expectedPower, 0);
  
  // Determina l'ora di picco di produzione
  const peakProduction = Math.max(...schedule.map(entry => entry.expectedPower));
  const peakHour = schedule.find(entry => entry.expectedPower === peakProduction)?.timestamp;

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Previsione Produzione</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Aggiornamento:</span>
          <span className="text-sm font-semibold">
            {new Date().toLocaleTimeString('it-IT')}
          </span>
        </div>
      </div>
      
      {/* Riepilogo giornaliero */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-700">Produzione Totale Prevista</div>
          <div className="text-2xl font-bold">{totalDailyProduction.toFixed(2)} MWh</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-sm text-yellow-700">Picco di Produzione</div>
          <div className="text-2xl font-bold">{peakProduction.toFixed(2)} MW</div>
          <div className="text-xs text-gray-600">
            {peakHour ? `alle ${formatTimestamp(peakHour)}` : ''}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2">Ora</th>
              <th className="px-4 py-2">Produzione (MW)</th>
              <th className="px-4 py-2">Irraggiamento</th>
              <th className="px-4 py-2">Confidenza</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-2">{formatTimestamp(entry.timestamp)}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-3 bg-yellow-400 rounded-sm mr-2"
                      style={{ 
                        width: `${Math.max(8, (entry.expectedPower / peakProduction) * 50)}px`,
                        opacity: entry.expectedPower > 0 ? 1 : 0.2
                      }}
                    />
                    {entry.expectedPower.toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-2">
                  {entry.solarIrradiance ? (
                    <div className="flex items-center">
                      {entry.solarIrradiance > 600 ? '☀️' : 
                       entry.solarIrradiance > 300 ? '🌤️' : 
                       entry.solarIrradiance > 100 ? '⛅' : '☁️'}
                      <span className="ml-1">{entry.solarIrradiance.toFixed(0)} W/m²</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">N/D</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${entry.confidence * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>* Le previsioni sono basate su dati meteorologici e storici dell'impianto</p>
        <p>* La confidenza riflette l'accuratezza prevista in base alle condizioni meteo</p>
      </div>
    </div>
  );
};

export default PvProductionTable; 