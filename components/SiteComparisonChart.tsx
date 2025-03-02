import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea
} from 'recharts';
import DataExport from './DataExport';

interface ComparisonData {
  timestamp: Date;
  efficiency_siteA: number;
  efficiency_siteB: number;
  chargeLevel_siteA: number;
  chargeLevel_siteB: number;
  powerOutput_siteA: number;
  powerOutput_siteB: number;
  revenue_siteA: number;
  revenue_siteB: number;
  [key: string]: Date | number; // Aggiunto per compatibilità con ExportableData
}

interface SiteComparisonChartProps {
  data: ComparisonData[];
  timeRange: string;
  metrics: string[];
  colors: { [key: string]: string };
  yAxisLabel?: string;
}

const SiteComparisonChart: React.FC<SiteComparisonChartProps> = ({ data, timeRange, metrics, colors, yAxisLabel }) => {
  const [zoomState, setZoomState] = useState<{
    refAreaLeft: string | null;
    refAreaRight: string | null;
    left: string | null;
    right: string | null;
    top: number | null;
    bottom: number | null;
  }>({
    refAreaLeft: null,
    refAreaRight: null,
    left: null,
    right: null,
    top: null,
    bottom: null,
  });

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp)
    }));
  }, [data]);

  const domain = useMemo(() => {
    if (!chartData.length) return [0, 0];

    const timestamps = chartData.map(d => d.timestamp.getTime());
    const left = Math.min(...timestamps);
    const right = Math.max(...timestamps);

    const numericValues = chartData.flatMap(d => 
      Object.entries(d)
        .filter(([key]) => metrics.includes(key))
        .map(([_, value]) => value as number)
    );

    const top = Math.max(...numericValues);
    const bottom = Math.min(...numericValues);

    return [
      bottom - (top - bottom) * 0.1,
      top + (top - bottom) * 0.1
    ];
  }, [chartData, metrics]);

  const getMetricColor = (metric: string, siteId: string) => {
    const colors = {
      efficiency: { siteA: '#4CAF50', siteB: '#81C784' },
      chargeLevel: { siteA: '#2196F3', siteB: '#64B5F6' },
      powerOutput: { siteA: '#FF9800', siteB: '#FFB74D' },
      revenue: { siteA: '#9C27B0', siteB: '#BA68C8' }
    };
    return colors[metric as keyof typeof colors][siteId as keyof typeof colors[keyof typeof colors]];
  };

  const handleMouseDown = (e: { activeLabel?: string | undefined }) => {
    if (!e?.activeLabel) return;
    setZoomState({ ...zoomState, refAreaLeft: e.activeLabel });
  };

  const handleMouseMove = (e: { activeLabel?: string | undefined }) => {
    if (!e?.activeLabel) return;
    if (zoomState.refAreaLeft)
      setZoomState({ ...zoomState, refAreaRight: e.activeLabel });
  };

  const handleMouseUp = () => {
    if (!zoomState.refAreaLeft || !zoomState.refAreaRight) return;

    let left = zoomState.refAreaLeft;
    let right = zoomState.refAreaRight;

    if (left > right) [left, right] = [right, left];

    const filteredData = data
      .filter(d => {
        const timestamp = formatDate(d.timestamp);
        return timestamp >= left && timestamp <= right;
      });

    const numericValues = filteredData.flatMap(d => 
      Object.entries(d)
        .filter(([key]) => metrics.includes(key))
        .map(([_, value]) => value as number)
    );

    setZoomState({
      ...zoomState,
      refAreaLeft: null,
      refAreaRight: null,
      left,
      right,
      top: Math.max(...numericValues),
      bottom: Math.min(...numericValues),
    });
  };

  const handleZoomOut = () => {
    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
      left: null,
      right: null,
      top: null,
      bottom: null,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Confronto Prestazioni Siti</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleZoomOut}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              zoomState.left
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!zoomState.left}
          >
            Reset Zoom
          </button>
          <DataExport
            data={data}
            filename={`confronto-siti-${timeRange}`}
          />
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              domain={[zoomState.left || 'auto', zoomState.right || 'auto']}
              type="category"
              allowDataOverflow
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[zoomState.bottom || 'auto', zoomState.top || 'auto']}
              allowDataOverflow
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[zoomState.bottom || 'auto', zoomState.top || 'auto']}
              allowDataOverflow
            />
            <Tooltip
              labelFormatter={(value) => formatDate(value as Date)}
              formatter={(value: number, name: string) => [
                value.toFixed(2),
                name
              ]}
            />
            <Legend />

            {metrics.includes('efficiency') && (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="efficiency_siteA"
                  name="Efficienza Sito A"
                  stroke={getMetricColor('efficiency', 'siteA')}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="efficiency_siteB"
                  name="Efficienza Sito B"
                  stroke={getMetricColor('efficiency', 'siteB')}
                  dot={false}
                />
              </>
            )}

            {metrics.includes('chargeLevel') && (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="chargeLevel_siteA"
                  name="Livello Carica Sito A"
                  stroke={getMetricColor('chargeLevel', 'siteA')}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="chargeLevel_siteB"
                  name="Livello Carica Sito B"
                  stroke={getMetricColor('chargeLevel', 'siteB')}
                  dot={false}
                />
              </>
            )}

            {metrics.includes('powerOutput') && (
              <>
                <Bar
                  yAxisId="right"
                  dataKey="powerOutput_siteA"
                  name="Potenza Sito A"
                  fill={getMetricColor('powerOutput', 'siteA')}
                  opacity={0.8}
                />
                <Bar
                  yAxisId="right"
                  dataKey="powerOutput_siteB"
                  name="Potenza Sito B"
                  fill={getMetricColor('powerOutput', 'siteB')}
                  opacity={0.8}
                />
              </>
            )}

            {metrics.includes('revenue') && (
              <>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue_siteA"
                  name="Ricavi Sito A"
                  stroke={getMetricColor('revenue', 'siteA')}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue_siteB"
                  name="Ricavi Sito B"
                  stroke={getMetricColor('revenue', 'siteB')}
                  dot={false}
                />
              </>
            )}

            {zoomState.refAreaLeft && zoomState.refAreaRight && (
              <ReferenceArea
                yAxisId="left"
                x1={zoomState.refAreaLeft}
                x2={zoomState.refAreaRight}
                strokeOpacity={0.3}
                fill="#1976D2"
                fillOpacity={0.1}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SiteComparisonChart; 