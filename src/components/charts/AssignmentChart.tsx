import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateMockData = () => {
  return [
    { name: 'Assign 1', score: 75 },
    { name: 'Assign 2', score: 82 },
    { name: 'Assign 3', score: 78 },
    { name: 'Assign 4', score: 85 },
    { name: 'Assign 5', score: 72 },
    { name: 'Assign 6', score: 88 },
    { name: 'Assign 7', score: 80 },
    { name: 'Assign 8', score: 85 },
  ];
};

export const AssignmentChart: React.FC<{ currentValue?: number }> = ({ currentValue }) => {
  const data = generateMockData();
  if (currentValue) {
    data[data.length - 1].score = currentValue;
  }

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-4">Assignment Scores Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <defs>
              <linearGradient id="colorAssignment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              fill="url(#colorAssignment)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
