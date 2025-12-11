import React, { useState, useMemo } from 'react';
import { CalendarCheck, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AttendanceInsight: React.FC = () => {
  const { student, isLoading } = useStudent();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');

  if (isLoading || !student) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="chart" />
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  const currentSubject = useMemo(
    () => student.subject_averages?.find((s) => String(s.subject_id) === selectedSubjectId),
    [student, selectedSubjectId]
  );

  const filteredRecords = useMemo(() => {
    if (selectedSubjectId === 'overall') return student.attendance_records || [];
    return (student.attendance_records || []).filter(r => String(r.subject_id) === selectedSubjectId);
  }, [student, selectedSubjectId]);

  const avgAttendance = useMemo(() => {
    if (selectedSubjectId === 'overall') return student.attendance || 0;
    return currentSubject?.avg_attendance || 0;
  }, [student, currentSubject, selectedSubjectId]);

  const getInsights = () => {
    const insights = [];

    if (avgAttendance < 75) {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Attendance Below Target',
        description: selectedSubjectId === 'overall' ? 'Your overall attendance is below the 75% threshold. This may impact exam eligibility.' : 'Attendance for this subject is below 75%. Focus on improving it.',
      });
    }
    
    if (avgAttendance >= 85) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Excellent Attendance',
        description: 'Great job maintaining high attendance! This correlates with better outcomes.',
      });
    }

    if (filteredRecords.length > 0) {
      const lowest = filteredRecords.reduce((min, r) => r.attendance_percentage < min.attendance_percentage ? r : min, filteredRecords[0]);
      insights.push({
        type: 'info',
        icon: AlertCircle,
        title: `Weakest week: Week ${lowest.week_number}${lowest.subject_code ? ` (${lowest.subject_code})` : ''}`,
        description: `Attendance was ${Math.round(lowest.attendance_percentage)}%. Try to recover in upcoming weeks.`,
      });
    }

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Attendance Insight</h1>
          <p className="text-muted-foreground">Track your class attendance patterns</p>
        </div>
        {/* Subject Selector */}
        {student.subject_averages && student.subject_averages.length > 0 && (
          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall</SelectItem>
              {student.subject_averages.map((subj) => (
                <SelectItem key={subj.subject_id} value={String(subj.subject_id)}>
                  {subj.subject_name || subj.subject_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Current Value Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{selectedSubjectId === 'overall' ? 'Overall' : 'Subject'} Attendance</p>
            <p className="text-4xl font-bold text-foreground">{Math.round(avgAttendance * 10) / 10}%</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${avgAttendance >= 75 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {avgAttendance >= 75 ? 'On Track' : 'Needs Improvement'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <AttendanceChart
        currentValue={avgAttendance}
        data={filteredRecords.map((r) => ({
          week: `Week ${r.week_number}`,
          attendance: r.attendance_percentage,
          subject: r.subject_code,
        }))}
      />

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
