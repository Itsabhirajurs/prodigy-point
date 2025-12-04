import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const generateMockData = () => {
  return [
    { name: 'Quiz 1', score: 78 },
    { name: 'Quiz 2', score: 85 },
    { name: 'Quiz 3', score: 72 },
    { name: 'Quiz 4', score: 65 },
    { name: 'Quiz 5', score: 82 },
    { name: 'Quiz 6', score: 88 },
  ];
};

export const QuizChart: React.FC<{ currentValue?: number }> = ({ currentValue }) => {
  const data = generateMockData();
  if (currentValue) {
    data[data.length - 1].score = currentValue;
  }

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quiz Scores Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="score" fill="hsl(var(--warning))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
