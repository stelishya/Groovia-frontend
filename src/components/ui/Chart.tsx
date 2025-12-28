import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Simple container and tooltip for demo; replace with shadcn-ui chart container if available
export const ChartContainer = ({ children, className }: any) => (
  <div className={`bg-white dark:bg-[#0f1724] rounded-lg p-4 shadow border border-gray-200 dark:border-gray-800 ${className || ''}`}>{children}</div>
);

export const ChartTooltip = ({ content }: any) => content;
export const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-gray-900 text-white p-2 rounded shadow">
      <div>{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i}>{entry.name}: {entry.value}</div>
      ))}
    </div>
  );
};

const data = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 210 },
  { month: "Mar", users: 350 },
  { month: "Apr", users: 480 },
];

export function UserGrowthChart() {
  return (
    <ChartContainer
      config={{
        users: {
          label: "Users",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="users"
          stroke="var(--color-users)"
          strokeWidth={3}
        />
      </LineChart>
    </ChartContainer>
  );
}
