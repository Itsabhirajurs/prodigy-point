import React from 'react';
import { CalendarCheck, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const AttendanceInsight: React.FC = () => {
  const { student, isLoading } = useStudent();

  if (isLoading || !student) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="chart" />
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  const getInsights = () => {
    const insights = [];
    
    if (student.attendance < 75) {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Attendance Below Target',
        description: 'Your attendance dropped below the 75% threshold. This may impact your eligibility for exams.',
      });
    }
    
    if (student.attendance >= 85) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Excellent Attendance',
        description: 'Great job maintaining high attendance! This correlates with better academic outcomes.',
      });
    }

    insights.push({
      type: 'info',
      icon: AlertCircle,
      title: 'Week 3 Analysis',
      description: 'Your attendance dropped sharply in Week 3. Consider reviewing what caused this dip.',
    });

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
          <CalendarCheck className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Insight</h1>
          <p className="text-muted-foreground">Track your class attendance patterns</p>
        </div>
      </div>

      {/* Current Value Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Attendance</p>
            <p className="text-4xl font-bold text-foreground">{student.attendance}%</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${student.attendance >= 75 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {student.attendance >= 75 ? 'On Track' : 'Needs Improvement'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <AttendanceChart currentValue={student.attendance} />

      {/* Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Key Insights</h2>
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const bgColor = insight.type === 'success' ? 'bg-success/10' : insight.type === 'warning' ? 'bg-warning/10' : 'bg-primary/10';
          const iconColor = insight.type === 'success' ? 'text-success' : insight.type === 'warning' ? 'text-warning' : 'text-primary';
          
          return (
            <div key={index} className="bg-card rounded-xl p-4 card-shadow flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{insight.title}</h3>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceInsight;
