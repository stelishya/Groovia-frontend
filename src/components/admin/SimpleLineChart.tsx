import React from 'react';

type Point = { label: string; value: number };

const SimpleLineChart: React.FC<{ data: Point[]; height?: number }> = ({ data, height = 120 }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-400">No data</div>;
  }

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const width = 600;
  const padding = 20;
  const innerWidth = width - padding * 2;
  const stepX = innerWidth / Math.max(1, data.length - 1);

  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = padding + (height - padding * 2) * (1 - (d.value - min) / Math.max(1, max - min));
    return `${x},${y}`;
  });

  const polyline = points.join(' ');

  return (
    <div className="bg-[#0f1724] text-white rounded-lg p-3 border border-gray-800">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline fill="none" stroke="#60a5fa" strokeWidth={2} points={polyline} />
        {data.map((d, i) => {
          const [x, y] = points[i].split(',').map(Number);
          return <circle key={i} cx={x} cy={y} r={3} fill="#60a5fa" />;
        })}
      </svg>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 overflow-x-auto">
        {data.map((d) => (
          <div key={d.label} className="whitespace-nowrap">
            <div className="text-white">{d.label}</div>
            <div className="text-gray-400">{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleLineChart;
