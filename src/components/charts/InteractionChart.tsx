import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

const generateMockData = () => {
  return [
    { interaction: 85, travel: 20, student: 'You' },
    { interaction: 72, travel: 35, student: 'Peer 1' },
    { interaction: 65, travel: 45, student: 'Peer 2' },
    { interaction: 90, travel: 15, student: 'Peer 3' },
    { interaction: 55, travel: 50, student: 'Peer 4' },
    { interaction: 78, travel: 30, student: 'Peer 5' },
    { interaction: 42, travel: 60, student: 'Peer 6' },
  ];
};

export const InteractionChart: React.FC<{ interaction?: number; travelTime?: number }> = ({ interaction, travelTime }) => {
  const data = generateMockData();
  if (interaction !== undefined && travelTime !== undefined) {
    data[0] = { interaction, travel: travelTime, student: 'You' };
  }

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-4">Class Interaction vs Travel Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="travel"
              name="Travel Time"
              unit=" min"
              domain={[0, 80]}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Travel Time (min)', position: 'bottom', offset: -5, fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="interaction"
              name="Interaction"
              unit="%"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Interaction %', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <ZAxis range={[100, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                name === 'travel' ? `${value} min` : `${value}%`,
                name === 'travel' ? 'Travel Time' : 'Interaction',
              ]}
            />
            <Scatter name="Students" data={data} fill="hsl(var(--success))" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
