import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, FileText, ClipboardCheck, Brain, ArrowRight } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { StudentCard } from '@/components/dashboard/StudentCard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RiskCard } from '@/components/dashboard/RiskCard';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const Dashboard: React.FC = () => {
  const { student, isLoading } = useStudent();
  const navigate = useNavigate();

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
    if (student.attendance >= 80) return 'success';
    if (student.attendance >= 60) return 'warning';
    return 'danger';
  };

  const getStressVariant = () => {
    if (student.stress_index <= 40) return 'success';
    if (student.stress_index <= 70) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Your academic overview</p>
        </div>
      </div>

      {/* Student Card */}
      <StudentCard />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Attendance"
          value={student.attendance}
          suffix="%"
          icon={CalendarCheck}
          variant={getAttendanceVariant()}
        />
        <MetricCard
          title="Avg Assignment"
          value={student.avg_assignment}
          suffix="%"
          icon={FileText}
          variant="default"
        />
        <MetricCard
          title="Avg Quiz"
          value={student.avg_quiz}
          suffix="%"
          icon={ClipboardCheck}
          variant="default"
        />
        <MetricCard
          title="Stress Index"
          value={student.stress_index}
          suffix="%"
          icon={Brain}
          variant={getStressVariant()}
        />
      </div>

      {/* Risk Analysis Card */}
      <RiskCard
        riskLevel={student.risk_level}
        prediction={student.prediction}
        score={student.score}
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
