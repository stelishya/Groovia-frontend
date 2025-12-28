import React from 'react';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
};

const DashboardStats: React.FC<Props> = ({ title, value, subtitle }) => {
  return (
    <div className="bg-[#0f1724] text-white rounded-lg p-4 shadow border border-gray-800">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
};

export default DashboardStats;
