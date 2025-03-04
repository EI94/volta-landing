import React from 'react';
import { FiZap, FiActivity, FiCpu, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

export interface AIAction {
  type: 'CHARGE' | 'DISCHARGE' | 'HOLD' | 'MAINTENANCE' | 'OPTIMIZE';
  power?: number;
  expectedRevenue?: number;
  confidence: number;
  explanation: string;
  priority: 'high' | 'medium' | 'low';
  timeframe?: string;
}

interface AIActionSuggestionsProps {
  actions: AIAction[];
  onExecute: (action: AIAction) => void;
  isAutoModeEnabled: boolean;
}

const AIActionSuggestions: React.FC<AIActionSuggestionsProps> = ({
  actions,
  onExecute,
  isAutoModeEnabled
}) => {
  // Funzione per ottenere l'icona in base al tipo di azione
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'CHARGE':
        return <FiZap className="text-green-500" />;
      case 'DISCHARGE':
        return <FiZap className="text-red-500" />;
      case 'HOLD':
        return <FiActivity className="text-blue-500" />;
      case 'MAINTENANCE':
        return <FiAlertTriangle className="text-yellow-500" />;
      case 'OPTIMIZE':
        return <FiCpu className="text-purple-500" />;
      default:
        return <FiActivity className="text-gray-500" />;
    }
  };

  // Funzione per ottenere il colore del badge di priorità
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Funzione per formattare il valore di confidenza
  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FiCpu />
          <h3 className="font-semibold">Azioni Suggerite dall&apos;AI</h3>
        </div>
        <div className="flex items-center text-xs bg-blue-700 px-2 py-1 rounded">
          {isAutoModeEnabled ? (
            <>
              <FiCheck className="mr-1" />
              <span>Auto-esecuzione attiva</span>
            </>
          ) : (
            <>
              <FiX className="mr-1" />
              <span>Auto-esecuzione disattivata</span>
            </>
          )}
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Nessuna azione suggerita al momento
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {actions.map((action, index) => (
            <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{getActionIcon(action.type)}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{action.type}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                      {action.timeframe && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {action.timeframe}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{action.explanation}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                      {action.power !== undefined && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Potenza: {action.power} kW
                        </span>
                      )}
                      {action.expectedRevenue !== undefined && (
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Ricavo previsto: {action.expectedRevenue.toFixed(2)} €
                        </span>
                      )}
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Confidenza: {formatConfidence(action.confidence)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onExecute(action)}
                  disabled={isAutoModeEnabled}
                  className={`px-3 py-1 rounded text-sm ${
                    isAutoModeEnabled
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isAutoModeEnabled ? 'Auto' : 'Esegui'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AIActionSuggestions; 