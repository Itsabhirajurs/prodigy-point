import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const generateMockData = () => {
  return [
    { subject: 'Instagram', hours: 1.5, fullMark: 5 },
    { subject: 'TikTok', hours: 2.0, fullMark: 5 },
    { subject: 'YouTube', hours: 1.8, fullMark: 5 },
    { subject: 'Twitter', hours: 0.8, fullMark: 5 },
    { subject: 'Gaming', hours: 1.2, fullMark: 5 },
    { subject: 'Other', hours: 0.5, fullMark: 5 },
  ];
};

export const SocialMediaChart: React.FC<{ totalHours?: number }> = ({ totalHours }) => {
  const data = generateMockData();

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Social Media Usage</h3>
        {totalHours !== undefined && (
          <span className="text-sm text-muted-foreground">{totalHours.toFixed(1)} hrs/day</span>
        )}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Radar
              name="Hours"
              dataKey="hours"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
