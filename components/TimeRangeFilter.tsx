import React from 'react';

interface TimeRangeFilterProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({ timeRange, onTimeRangeChange }) => {
  const timeRanges = [
    { value: '1h', label: 'Ultima ora' },
    { value: '6h', label: 'Ultime 6 ore' },
    { value: '24h', label: 'Ultime 24 ore' },
    { value: '7d', label: 'Ultima settimana' },
    { value: '30d', label: 'Ultimo mese' }
  ];

  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Intervallo:</span>
      <div className="flex space-x-1">
        {timeRanges.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTimeRangeChange(value)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              timeRange === value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeFilter; 