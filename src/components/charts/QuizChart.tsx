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
    <div className="relative overflow-hidden rounded-2xl p-6 card-shadow-lg card-hover animate-slide-up border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
      {/* Decorative gradient background */}
      <div className="absolute -right-32 -top-32 w-64 h-64 bg-warning/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-foreground mb-1">🎯 Quiz Scores</h3>
        <p className="text-sm text-muted-foreground mb-6">Performance across all quizzes</p>
        <div className="h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No quiz data available</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--warning))',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
              formatter={(value, _name, props) => [`${value}%`, props.payload?.subject ? `Subject: ${props.payload.subject}` : 'Score']}
            />
            <Bar dataKey="score" fill="hsl(var(--warning))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
        </div>
      </div>
    </div>
  );
};
