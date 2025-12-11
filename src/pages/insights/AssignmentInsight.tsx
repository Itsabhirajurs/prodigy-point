import React, { useState, useMemo } from 'react';
import { FileText, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { AssignmentChart } from '@/components/charts/AssignmentChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AssignmentInsight: React.FC = () => {
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

  const filteredAssignments = useMemo(() => {
    if (selectedSubjectId === 'overall') return student.assignments || [];
    return (student.assignments || []).filter(a => String(a.subject_id) === selectedSubjectId);
  }, [student, selectedSubjectId]);

  const avgAssignment = useMemo(() => {
    if (selectedSubjectId === 'overall') return student.avg_assignment || 0;
    return currentSubject?.avg_assignment || 0;
  }, [student, currentSubject, selectedSubjectId]);

  const getInsights = () => {
    const insights = [];
    
    if (avgAssignment < 70) {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Assignment Scores Need Attention',
        description: selectedSubjectId === 'overall' ? 'Average assignment score is below 70%. Focus on timely submissions and clarifying tough topics.' : 'Assignment scores for this subject need improvement.',
      });
    }
    
    if (avgAssignment >= 80) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Strong Assignment Performance',
        description: 'Great consistency across assignments. Keep the momentum going!',
      });
    }

    if (filteredAssignments.length > 0) {
      const lowest = filteredAssignments.reduce((min, r) => r.marks_obtained < min.marks_obtained ? r : min, filteredAssignments[0]);
      insights.push({
        type: 'info',
        icon: Target,
        title: `Lowest assignment: ${lowest.subject_code || 'SUB'} A${lowest.assignment_number}`,
        description: `Score ${Math.round(lowest.marks_obtained)}%. Revisit this topic to lift your average.`,
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center">
          <FileText className="w-7 h-7 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Assignment Insight</h1>
          <p className="text-muted-foreground">Analyze your assignment performance</p>
        </div>
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
            <p className="text-sm text-muted-foreground">{selectedSubjectId === 'overall' ? 'Overall' : 'Subject'} Assignment Score</p>
            <p className="text-4xl font-bold text-foreground">{Math.round(avgAssignment * 10) / 10}%</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${avgAssignment >= 70 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {avgAssignment >= 70 ? 'Good' : 'Needs Work'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <AssignmentChart
        currentValue={avgAssignment}
        data={filteredAssignments.map((r) => ({
          name: `${r.subject_code || 'SUB'} A${r.assignment_number}`,
          score: r.marks_obtained,
          subject: r.subject_code,
        }))}
      />

      {/* Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Key Insights</h2>
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const bgColor = insight.type === 'success' ? 'bg-success/10' : insight.type === 'warning' ? 'bg-warning/10' : 'bg-accent/10';
          const iconColor = insight.type === 'success' ? 'text-success' : insight.type === 'warning' ? 'text-warning' : 'text-accent';
          
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

export default AssignmentInsight;
