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
    <div className="relative overflow-hidden rounded-2xl p-6 card-shadow-lg card-hover animate-slide-up border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
      {/* Decorative gradient background */}
      <div className="absolute -right-32 -top-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-foreground mb-1">📝 Assignment Scores</h3>
        <p className="text-sm text-muted-foreground mb-6">Performance progression across assignments</p>
        <div className="h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No assignment data available</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
            <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--accent))',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
              formatter={(value, _name, props) => [`${value}%`, props.payload?.subject ? `Subject: ${props.payload.subject}` : 'Score']}
            />
            <defs>
              <linearGradient id="colorAssignment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              fill="url(#colorAssignment)"
            </Area>
          </AreaChart>
        </ResponsiveContainer>
        )}
        </div>
      </div>
    </div>
  );
};
