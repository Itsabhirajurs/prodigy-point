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
    <div className="bg-gradient-to-br from-card/95 via-card to-destructive/5 rounded-2xl p-5 card-shadow border-2 border-destructive/20 hover:border-destructive/40 transition-all duration-300 hover:shadow-neon-lg group">
      <h3 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-1 bg-destructive rounded-full animate-pulse"></span>
        Stress Index Trend
      </h3>
      <div className="h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No stress data available</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--destructive))',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(var(--destructive), 0.3)',
              }}
              formatter={(value, _name, props) => {
                const social = props.payload?.social ? `Social: ${props.payload.social}h/day` : '';
                const travel = props.payload?.travel ? `Travel: ${props.payload.travel} min/day` : '';
                return [`${value}`, [social, travel].filter(Boolean).join(' | ') || 'Stress Index'];
              }}
            />
            <ReferenceLine y={70} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ value: 'High Stress ⚠️', fill: 'hsl(var(--destructive))', fontSize: 12, fontWeight: 'bold' }} />
            <Line
              type="monotone"
              dataKey="stress"
              stroke="hsl(var(--destructive))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: 'hsl(var(--warning))' }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
