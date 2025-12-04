import React from 'react';
import { useStudent } from '@/context/StudentContext';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { AssignmentChart } from '@/components/charts/AssignmentChart';
import { QuizChart } from '@/components/charts/QuizChart';
import { StressChart } from '@/components/charts/StressChart';
import { SocialMediaChart } from '@/components/charts/SocialMediaChart';
import { InteractionChart } from '@/components/charts/InteractionChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const OverallPerformance: React.FC = () => {
  const { student, isLoading } = useStudent();

  if (isLoading || !student) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <LoadingSkeleton key={i} variant="chart" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overall Performance</h1>
        <p className="text-muted-foreground">Comprehensive analytics of your academic journey</p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart currentValue={student.attendance} />
        <AssignmentChart currentValue={student.avg_assignment} />
        <QuizChart currentValue={student.avg_quiz} />
        <StressChart currentValue={student.stress_index} />
        <SocialMediaChart totalHours={student.social_media_hours} />
        <InteractionChart
          interaction={student.class_interaction}
          travelTime={student.travel_time}
        />
      </div>
    </div>
  );
};

export default OverallPerformance;
