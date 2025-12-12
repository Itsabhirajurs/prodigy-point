import React, { useState, useMemo } from 'react';
import { ClipboardCheck, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { QuizChart } from '@/components/charts/QuizChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const QuizInsight: React.FC = () => {
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

  const filteredQuizzes = useMemo(() => {
    if (selectedSubjectId === 'overall') return student.quizzes || [];
    return (student.quizzes || []).filter(q => String(q.subject_id) === selectedSubjectId);
  }, [student, selectedSubjectId]);

  const avgQuiz = useMemo(() => {
    if (selectedSubjectId === 'overall') return student.avg_quiz || 0;
    return currentSubject?.avg_quiz || 0;
  }, [student, currentSubject, selectedSubjectId]);

  const getInsights = () => {
    const insights = [];
    
    if (avgQuiz < 60) {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Quiz Scores Below Average',
        description: selectedSubjectId === 'overall' ? 'Your quiz scores need improvement. Consider forming study groups and practicing with past quiz questions.' : 'Quiz scores for this subject need attention.',
      });
    }
    
    if (avgQuiz >= 80) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Outstanding Quiz Performance',
        description: 'Your quiz preparation is excellent! Keep up the consistent study habits.',
      });
    }

    insights.push({
      type: 'info',
      icon: AlertTriangle,
      title: 'Quiz Review Needed',
      description: 'Pinpoint recent quizzes with lower scores and revisit those topics before the next test.',
    });

    if (filteredQuizzes.length > 0) {
      const lowest = filteredQuizzes.reduce((min, q) => q.marks_obtained < min.marks_obtained ? q : min, filteredQuizzes[0]);
      insights.push({
        type: 'info',
        icon: AlertTriangle,
        title: `Lowest quiz: ${lowest.subject_code || 'SUB'} Q${lowest.quiz_number}`,
        description: `Scored ${Math.round(lowest.marks_obtained)}%. Revisit that topic to lift your average.`,
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-success/20 via-warning/10 to-card p-8 border-2 border-success/30 shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none overflow-hidden">
          <div className="absolute -left-32 top-1/4 w-64 h-64 bg-success/10 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute -right-32 bottom-1/4 w-80 h-80 bg-warning/5 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-warning flex items-center justify-center shadow-lg">
            <ClipboardCheck className="w-7 h-7 text-warning-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground uppercase tracking-wide">Quiz Insight</h1>
            <p className="text-muted-foreground text-lg">Review your quiz performance trends</p>
          </div>
            {student.subject_averages && student.subject_averages.length > 0 && (
          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
            <SelectTrigger className="w-48 border-2 border-success/30 hover:border-success/60 transition-all">
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
      <div className="bg-gradient-to-br from-success/15 via-card to-card/90 rounded-2xl p-8 card-shadow border-2 border-success/30 hover:border-success/60 transition-all hover:shadow-neon-lg hover:scale-102">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{selectedSubjectId === 'overall' ? 'Overall' : 'Subject'} Quiz Score</p>
            <p className="text-5xl font-bold text-foreground mt-2">{Math.round(avgQuiz * 10) / 10}%</p>
          </div>
          <div className={`px-6 py-3 rounded-full font-bold text-lg border-2 transition-all ${avgQuiz >= 70 ? 'bg-success/15 text-success border-success/50' : 'bg-warning/15 text-warning border-warning/50'}`}>
            {avgQuiz >= 70 ? '✓ Good' : '⚠️ Needs Work'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <QuizChart
        currentValue={avgQuiz}
        data={filteredQuizzes.map((q) => ({
          name: `${q.subject_code || 'SUB'} Q${q.quiz_number}`,
          score: q.marks_obtained,
          subject: q.subject_code,
        }))}
      />

      {/* Insights */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide">Key Insights</h2>
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const bgColor = insight.type === 'success' ? 'from-success/15 to-success/5' : insight.type === 'warning' ? 'from-warning/15 to-warning/5' : 'from-primary/15 to-primary/5';
          const borderColor = insight.type === 'success' ? 'border-success/30' : insight.type === 'warning' ? 'border-warning/30' : 'border-primary/30';
          const iconColor = insight.type === 'success' ? 'text-success' : insight.type === 'warning' ? 'text-warning' : 'text-primary';
          
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

export default QuizInsight;
