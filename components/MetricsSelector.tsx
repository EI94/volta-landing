import React from 'react';

interface MetricsSelectorProps {
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

const MetricsSelector: React.FC<MetricsSelectorProps> = ({ selectedMetrics, onMetricsChange }) => {
  const availableMetrics = [
    { value: 'efficiency', label: 'Efficienza' },
    { value: 'chargeLevel', label: 'Livello Carica' },
    { value: 'powerOutput', label: 'Potenza' },
    { value: 'revenue', label: 'Ricavi' }
  ];

  const toggleMetric = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter(m => m !== metric));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {availableMetrics.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => toggleMetric(value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedMetrics.includes(value)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default MetricsSelector; 