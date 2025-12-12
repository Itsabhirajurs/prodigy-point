import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, FileText, ClipboardCheck, Brain, ArrowRight } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { StudentCard } from '@/components/dashboard/StudentCard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RiskCard } from '@/components/dashboard/RiskCard';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Dashboard: React.FC = () => {
  const { student, isLoading } = useStudent();
  const navigate = useNavigate();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');

  const currentSubject = useMemo(() => {
    if (!student?.subject_averages) return null;
    if (selectedSubjectId === 'overall') return null;
    return student.subject_averages.find((s) => s.subject_id === selectedSubjectId) || null;
  }, [student?.subject_averages, selectedSubjectId]);

  const metrics = {
    attendance: Math.round((currentSubject ? currentSubject.avg_attendance : student?.attendance || 0) * 10) / 10,
    assignment: Math.round((currentSubject ? currentSubject.avg_assignment : student?.avg_assignment || 0) * 10) / 10,
    quiz: Math.round((currentSubject ? currentSubject.avg_quiz : student?.avg_quiz || 0) * 10) / 10,
    stress: Math.round((currentSubject ? currentSubject.avg_stress_index : student?.stress_index || 0) * 10) / 10,
  };

  const displayScore = currentSubject
    ? Math.round(
        ((currentSubject.avg_attendance * 0.35) +
        (currentSubject.avg_assignment * 0.25) +
        (currentSubject.avg_quiz * 0.25) +
        (currentSubject.avg_class_interaction * 0.1) -
        (currentSubject.avg_stress_index * 0.05) -
        (currentSubject.avg_social_media_hours * 0.5)) * 10
      ) / 10
    : student?.score || 0;

  if (isLoading || !student) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" className="h-32" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
        <LoadingSkeleton variant="chart" />
      </div>
    );
  }

  const getAttendanceVariant = () => {
    if (metrics.attendance >= 80) return 'success';
    if (metrics.attendance >= 60) return 'warning';
    return 'danger';
  };
 
  const getStressVariant = () => {
    if (metrics.stress <= 40) return 'success';
    if (metrics.stress <= 70) return 'warning';
    return 'danger';
  };
  return (
    <div className="space-y-6">
      {/* Header with animated gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 p-6 border border-border animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-float"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-foreground mb-1">Welcome Back! 👋</h1>
          <p className="text-muted-foreground">Here's your academic overview at a glance</p>
        </div>
      </div>

      {/* Student Card */}
      <StudentCard />

      {/* Subject selector */}
      {student.subject_averages && student.subject_averages.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-xl px-4 py-3 bg-card/60">
          <div>
            <p className="text-sm text-muted-foreground">View metrics for</p>
            <p className="font-semibold text-foreground">
              {selectedSubjectId === 'overall'
                ? 'Overall'
                : (student.subject_averages.find(s => s.subject_id === selectedSubjectId)?.subject_name || 'Subject')}
            </p>
          </div>
          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall</SelectItem>
              {student.subject_averages.map((s) => (
                <SelectItem key={s.subject_id} value={s.subject_id}>
                  {s.subject_code || s.subject_name} — {s.subject_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Attendance"
          value={metrics.attendance}
          suffix="%"
          icon={CalendarCheck}
          variant={getAttendanceVariant()}
        />
        <MetricCard
          title="Avg Assignment"
          value={metrics.assignment}
          suffix="%"
          icon={FileText}
          variant="default"
        />
        <MetricCard
          title="Avg Quiz"
          value={metrics.quiz}
          suffix="%"
          icon={ClipboardCheck}
          variant="default"
        />
        <MetricCard
          title="Stress Index"
          value={metrics.stress}
          suffix="%"
          icon={Brain}
          variant={getStressVariant()}
        />
      </div>

      {/* Risk Analysis Card */}
      <RiskCard
        riskLevel={student.risk_level}
        prediction={student.prediction}
        score={displayScore}
      />

      {/* Action Button */}
      <Button
        onClick={() => navigate('/overall-performance')}
        className="w-full h-14 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
      >
        View Overall Performance
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};

export default Dashboard;
