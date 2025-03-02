import React from 'react';

interface ChargeScheduleEntry {
  timestamp: Date;
  action: string;
  power: number;
  expectedPrice: number;
  confidence: number;
}

interface ChargeScheduleTableProps {
  schedule: ChargeScheduleEntry[];
}

const ChargeScheduleTable: React.FC<ChargeScheduleTableProps> = ({ schedule }) => {
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Pianificazione Carica</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Aggiornamento:</span>
          <span className="text-sm font-semibold">
            {new Date().toLocaleTimeString('it-IT')}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2">Ora</th>
              <th className="px-4 py-2">Azione</th>
              <th className="px-4 py-2">Potenza (MW)</th>
              <th className="px-4 py-2">Prezzo Previsto (€/MWh)</th>
              <th className="px-4 py-2">Confidenza</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-2">{formatTimestamp(entry.timestamp)}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.action === 'charge' 
                      ? 'bg-green-100 text-green-800'
                      : entry.action === 'discharge'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.action}
                  </span>
                </td>
                <td className="px-4 py-2">{entry.power.toFixed(2)}</td>
                <td className="px-4 py-2">{entry.expectedPrice.toFixed(2)}</td>
                <td className="px-4 py-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${entry.confidence * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChargeScheduleTable; 