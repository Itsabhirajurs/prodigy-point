import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const generateMockData = () => {
  return [
    { week: 'Week 1', stress: 35 },
    { week: 'Week 2', stress: 42 },
    { week: 'Week 3', stress: 55 },
    { week: 'Week 4', stress: 48 },
    { week: 'Week 5', stress: 72 },
    { week: 'Week 6', stress: 65 },
    { week: 'Week 7', stress: 58 },
    { week: 'Week 8', stress: 45 },
  ];
};

export const StressChart: React.FC<{ currentValue?: number }> = ({ currentValue }) => {
  const data = generateMockData();
  if (currentValue) {
    data[data.length - 1].stress = currentValue;
  }

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-4">Stress Index Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <ReferenceLine y={70} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ value: 'High Stress', fill: 'hsl(var(--destructive))', fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="stress"
              stroke="hsl(var(--destructive))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
