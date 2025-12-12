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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-warning/20 via-accent/10 to-card p-8 border-2 border-warning/30 shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none overflow-hidden">
          <div className="absolute -left-32 top-1/4 w-64 h-64 bg-warning/10 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute -right-32 bottom-1/4 w-80 h-80 bg-accent/5 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground uppercase tracking-wide">Assignment Insight</h1>
            <p className="text-muted-foreground text-lg">Analyze your assignment performance and scores</p>
          </div>
          {student.subject_averages && student.subject_averages.length > 0 && (
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="w-48 border-2 border-warning/30 hover:border-warning/60 transition-all">
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
      </div>

      {/* Current Value Card */}
      <div className="bg-gradient-to-br from-warning/15 via-card to-card/90 rounded-2xl p-8 card-shadow border-2 border-warning/30 hover:border-warning/60 transition-all hover:shadow-neon-lg hover:scale-102">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{selectedSubjectId === 'overall' ? 'Overall' : 'Subject'} Assignment Score</p>
            <p className="text-5xl font-bold text-foreground mt-2">{Math.round(avgAssignment * 10) / 10}%</p>
          </div>
          <div className={`px-6 py-3 rounded-full font-bold text-lg border-2 transition-all ${avgAssignment >= 70 ? 'bg-success/15 text-success border-success/50' : 'bg-warning/15 text-warning border-warning/50'}`}>
            {avgAssignment >= 70 ? '✓ Good' : '⚠️ Needs Work'}
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
        <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide">Key Insights</h2>
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const bgColor = insight.type === 'success' ? 'from-success/15 to-success/5' : insight.type === 'warning' ? 'from-warning/15 to-warning/5' : 'from-accent/15 to-accent/5';
          const borderColor = insight.type === 'success' ? 'border-success/30' : insight.type === 'warning' ? 'border-warning/30' : 'border-accent/30';
          const iconColor = insight.type === 'success' ? 'text-success' : insight.type === 'warning' ? 'text-warning' : 'text-accent';
          
          return (
            <div key={index} className={`bg-gradient-to-r ${bgColor} rounded-xl p-6 card-shadow border-2 ${borderColor} hover:border-opacity-60 transition-all hover:shadow-neon-lg hover:scale-102 group`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg bg-${iconColor}/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentInsight;
