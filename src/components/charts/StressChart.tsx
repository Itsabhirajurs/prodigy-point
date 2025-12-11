import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type StressPoint = { week: string; stress: number; social?: number; travel?: number };

const generateMockData = (): StressPoint[] => {
  return [
    { week: 'Week 1', stress: 35, social: 2, travel: 20 },
    { week: 'Week 2', stress: 42, social: 2.5, travel: 20 },
    { week: 'Week 3', stress: 55, social: 3, travel: 25 },
    { week: 'Week 4', stress: 48, social: 2.2, travel: 20 },
    { week: 'Week 5', stress: 72, social: 3.5, travel: 30 },
    { week: 'Week 6', stress: 65, social: 3, travel: 25 },
    { week: 'Week 7', stress: 58, social: 2.8, travel: 22 },
    { week: 'Week 8', stress: 45, social: 2.3, travel: 20 },
  ];
};

export const StressChart: React.FC<{ currentValue?: number; data?: StressPoint[] }> = ({ currentValue, data }) => {
  const chartData = data === undefined ? generateMockData() : data;
  if (currentValue && !data) {
    chartData[chartData.length - 1].stress = currentValue;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 card-shadow-lg card-hover animate-slide-up border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
      {/* Decorative gradient background */}
      <div className="absolute -right-32 -top-32 w-64 h-64 bg-destructive/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-foreground mb-1">😰 Stress Index</h3>
        <p className="text-sm text-muted-foreground mb-6">Weekly stress levels and influencing factors</p>
        <div className="h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No stress data available</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--destructive))',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
              formatter={(value, _name, props) => {
                const social = props.payload?.social ? `Social: ${props.payload.social}h/day` : '';
                const travel = props.payload?.travel ? `Travel: ${props.payload.travel} min/day` : '';
                return [`${value}`, [social, travel].filter(Boolean).join(' | ') || 'Stress Index'];
              }}
            />
            <ReferenceLine y={70} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ value: 'High Stress', fill: 'hsl(var(--destructive))', fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="stress"
              stroke="hsl(var(--destructive))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, filter: 'drop-shadow(0 0 8px hsl(var(--destructive)))'}}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
        </div>
      </div>
    </div>
  );
};
