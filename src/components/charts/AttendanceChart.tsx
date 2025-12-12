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
    <div className="bg-gradient-to-br from-card/95 via-card to-accent/5 rounded-2xl p-5 card-shadow border-2 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-neon-lg group">
      <h3 className="text-lg font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-1 bg-accent rounded-full animate-pulse"></span>
        Attendance Trends
      </h3>
      <div className="h-64">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">No attendance data available</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '2px solid hsl(var(--accent))',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(var(--accent), 0.3)',
              }}
              formatter={(value, _name, props) => [`${value}%`, props.payload?.subject ? `Subject: ${props.payload.subject}` : 'Attendance']}
            />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: 'hsl(var(--accent))' }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
