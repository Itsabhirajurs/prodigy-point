import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type AttendancePoint = { week: string; attendance: number; subject?: string };

const generateMockData = (): AttendancePoint[] => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
  return weeks.map((week, index) => ({
    week,
    attendance: Math.max(60, Math.min(100, 85 + Math.random() * 20 - 10 - (index === 2 ? 15 : 0))),
    subject: 'GEN',
  }));
};

export const AttendanceChart: React.FC<{ currentValue?: number; data?: AttendancePoint[] }> = ({ currentValue, data }) => {
  // Group by week to handle multiple subjects per week and avoid duplicates
  const processedData = React.useMemo(() => {
    if (data === undefined) {
      return generateMockData();
    }
    
    // Group by week and average attendance
    const weekMap = new Map<string, { week: string; attendance: number; count: number }>();
    data.forEach((point) => {
      const existing = weekMap.get(point.week);
      if (existing) {
        existing.attendance += point.attendance;
        existing.count += 1;
      } else {
        weekMap.set(point.week, { week: point.week, attendance: point.attendance, count: 1 });
      }
    });
    
    return Array.from(weekMap.values()).map((item) => ({
      week: item.week,
      attendance: item.attendance / item.count,
      subject: undefined,
    }));
  }, [data]);
  
  const chartData = processedData;
  if (currentValue && data && data.length > 0) {
    chartData[chartData.length - 1].attendance = currentValue;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 card-shadow-lg card-hover animate-slide-up border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
      {/* Decorative gradient background */}
      <div className="absolute -right-32 -top-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-foreground mb-1">📊 Attendance Trend</h3>
        <p className="text-sm text-muted-foreground mb-6">Weekly attendance performance across all weeks</p>
        <div className="h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No attendance data available</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
            <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--primary))',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
              formatter={(value, _name, props) => [`${value}%`, props.payload?.subject ? `Subject: ${props.payload.subject}` : 'Attendance']}
            />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, filter: 'drop-shadow(0 0 8px hsl(var(--primary)))'}}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
