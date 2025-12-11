import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type AssignmentPoint = { name: string; score: number; subject?: string };

const generateMockData = (): AssignmentPoint[] => {
  return [
    { name: 'Assign 1', score: 75, subject: 'GEN' },
    { name: 'Assign 2', score: 82, subject: 'GEN' },
    { name: 'Assign 3', score: 78, subject: 'GEN' },
    { name: 'Assign 4', score: 85, subject: 'GEN' },
    { name: 'Assign 5', score: 72, subject: 'GEN' },
    { name: 'Assign 6', score: 88, subject: 'GEN' },
    { name: 'Assign 7', score: 80, subject: 'GEN' },
    { name: 'Assign 8', score: 85, subject: 'GEN' },
  ];
};

export const AssignmentChart: React.FC<{ currentValue?: number; data?: AssignmentPoint[] }> = ({ currentValue, data }) => {
  const chartData = data === undefined ? generateMockData() : data;
  if (currentValue && !data) {
    chartData[chartData.length - 1].score = currentValue;
  }

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-4">Assignment Scores Timeline</h3>
      <div className="h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No assignment data available</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value, _name, props) => [`${value}%`, props.payload?.subject ? `Subject: ${props.payload.subject}` : 'Score']}
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
        )}
      </div>
    </div>
  );
};
