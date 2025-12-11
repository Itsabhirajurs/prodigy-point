import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RiskDistributionChartProps {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
}

const LegendContent = ({ payload = [] }: { payload?: any[] }) => (
  <div className="flex flex-wrap items-center justify-center gap-4 text-sm mt-6">
    {payload.map((entry) => (
      <div key={entry.value} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-secondary/30 backdrop-blur hover:bg-secondary/50 transition-all">
        <span
          className="h-3 w-3 rounded-full shadow-lg"
          style={{ backgroundColor: entry.color || entry.payload?.color }}
        />
        <span className="font-medium text-foreground">{entry.value}</span>
      </div>
    ))}
  </div>
);

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  lowRisk,
  mediumRisk,
  highRisk,
}) => {
  const data = [
    { name: 'Low Risk', value: lowRisk, color: '#22c55e' }, // Green
    { name: 'Medium Risk', value: mediumRisk, color: '#eab308' }, // Yellow
    { name: 'High Risk', value: highRisk, color: '#ef4444' }, // Red
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={false}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.9} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '2px solid hsl(var(--primary))',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          />
          <Legend content={<LegendContent />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
