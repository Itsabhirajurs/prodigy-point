import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RiskDistributionChartProps {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  lowRisk,
  mediumRisk,
  highRisk,
}) => {
  const data = [
    { name: 'Low Risk', value: lowRisk, color: 'hsl(var(--success))' },
    { name: 'Medium Risk', value: mediumRisk, color: 'hsl(var(--warning))' },
    { name: 'High Risk', value: highRisk, color: 'hsl(var(--danger))' },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
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
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
