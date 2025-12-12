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
    <div className="bg-gradient-to-br from-card/95 via-card to-warning/5 rounded-2xl p-5 card-shadow border-2 border-warning/20 hover:border-warning/40 transition-all duration-300 hover:shadow-neon-lg group">
      <h3 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-1 bg-warning rounded-full animate-pulse"></span>
        Assignment Scores Timeline
      </h3>
      <div className="h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No assignment data available</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--warning))',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(var(--warning), 0.3)',
                color: 'hsl(var(--foreground))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value, _name, props) => [`${value}%`, props.payload?.subject ? `Subject: ${props.payload.subject}` : 'Score']}
            />
            <defs>
              <linearGradient id="colorAssignment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              fill="url(#colorAssignment)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
