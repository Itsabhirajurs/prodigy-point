import React, { useMemo, useState } from 'react';
import { useStudent } from '@/context/StudentContext';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { AssignmentChart } from '@/components/charts/AssignmentChart';
import { QuizChart } from '@/components/charts/QuizChart';
import { StressChart } from '@/components/charts/StressChart';
import { SocialMediaChart } from '@/components/charts/SocialMediaChart';
import { InteractionChart } from '@/components/charts/InteractionChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OverallPerformance: React.FC = () => {
  const { student, isLoading } = useStudent();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');

  const filtered = useMemo(() => {
    if (!student) return { attendance: [], assignments: [], quizzes: [], stress: [] as any[] };
    if (selectedSubjectId === 'overall') {
      return {
        attendance: student.attendance_records || [],
        assignments: student.assignments || [],
        quizzes: student.quizzes || [],
        stress: student.stress_records || [],
      };
    }
    return {
      attendance: (student.attendance_records || []).filter(r => r.subject_id === selectedSubjectId),
      assignments: (student.assignments || []).filter(r => r.subject_id === selectedSubjectId),
      quizzes: (student.quizzes || []).filter(r => r.subject_id === selectedSubjectId),
      stress: student.stress_records || [], // stress is overall, keep as-is
    };
  }, [student, selectedSubjectId]);

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

      {/* Subject selector */}
      {student.subject_averages && student.subject_averages.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-xl px-4 py-3 bg-card/60">
          <div>
            <p className="text-sm text-muted-foreground">View charts for</p>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart
          currentValue={student.attendance}
          data={filtered.attendance.map((r) => ({
            week: `Week ${r.week_number}`,
            attendance: r.attendance_percentage,
            subject: r.subject_code || r.subject_name,
          }))}
        />
        <AssignmentChart
          currentValue={student.avg_assignment}
          data={filtered.assignments.map((r) => ({
            name: `${r.subject_code || 'SUB'} A${r.assignment_number}`,
            score: r.marks_obtained,
            subject: r.subject_code || r.subject_name,
          }))}
        />
        <QuizChart
          currentValue={student.avg_quiz}
          data={filtered.quizzes.map((r) => ({
            name: `${r.subject_code || 'SUB'} Q${r.quiz_number}`,
            score: r.marks_obtained,
            subject: r.subject_code || r.subject_name,
          }))}
        />
        <StressChart
          currentValue={student.stress_index}
          data={filtered.stress.map((r) => ({
            week: `Week ${r.week_number}`,
            stress: r.stress_index,
            social: r.social_media_hours,
            travel: r.travel_time_minutes,
          }))}
        />
        <SocialMediaChart
          totalHours={student.social_media_hours}
          data={filtered.stress.map((r) => ({
            label: `Week ${r.week_number}`,
            hours: r.social_media_hours,
          }))}
        />
        <InteractionChart
          interaction={student.class_interaction}
          travelTime={student.travel_time}
        />
      </div>
    </div>
  );
};

export default OverallPerformance;
