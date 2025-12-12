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
    <div className="bg-gradient-to-br from-card/95 via-card to-primary/5 rounded-2xl p-5 card-shadow border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-neon-lg group">
      <h3 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-1 bg-primary rounded-full animate-pulse"></span>
        Class Interaction vs Travel Time
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                border: '2px solid hsl(var(--primary))',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(var(--primary), 0.3)',
              }}
              formatter={(value: number, name: string) => [
                name === 'travel' ? `${value} min` : `${value}%`,
                name === 'travel' ? 'Travel Time' : 'Interaction',
              ]}
            />
            <Scatter name="Students" data={data} fill="hsl(var(--success))" isAnimationActive={true} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
