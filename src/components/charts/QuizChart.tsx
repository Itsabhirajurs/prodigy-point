import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type QuizPoint = { name: string; score: number; subject?: string };

const generateMockData = (): QuizPoint[] => {
  return [
    { name: 'Quiz 1', score: 78, subject: 'GEN' },
    { name: 'Quiz 2', score: 85, subject: 'GEN' },
    { name: 'Quiz 3', score: 72, subject: 'GEN' },
    { name: 'Quiz 4', score: 65, subject: 'GEN' },
    { name: 'Quiz 5', score: 82, subject: 'GEN' },
    { name: 'Quiz 6', score: 88, subject: 'GEN' },
  ];
};

export const QuizChart: React.FC<{ currentValue?: number; data?: QuizPoint[] }> = ({ currentValue, data }) => {
  const chartData = data === undefined ? generateMockData() : data;
  if (currentValue && !data) {
    chartData[chartData.length - 1].score = currentValue;
  }

  return (
    <div className="bg-gradient-to-br from-card/95 via-card to-success/5 rounded-2xl p-5 card-shadow border-2 border-success/20 hover:border-success/40 transition-all duration-300 hover:shadow-neon-lg group">
      <h3 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-1 bg-success rounded-full animate-pulse"></span>
        Quiz Scores Timeline
      </h3>
      <div className="h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No quiz data available</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--success))',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(var(--success), 0.3)',
                color: 'hsl(var(--foreground))',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value, _name, props) => [`${value}%`, props.payload?.subject ? `Subject: ${props.payload.subject}` : 'Score']}
            />
            <Bar dataKey="score" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
