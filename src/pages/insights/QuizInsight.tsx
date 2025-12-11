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
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-warning flex items-center justify-center">
          <ClipboardCheck className="w-7 h-7 text-warning-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Quiz Insight</h1>
          <p className="text-muted-foreground">Review your quiz performance trends</p>
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
            <p className="text-sm text-muted-foreground">{selectedSubjectId === 'overall' ? 'Overall' : 'Subject'} Quiz Score</p>
            <p className="text-4xl font-bold text-foreground">{Math.round(avgQuiz * 10) / 10}%</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${avgQuiz >= 70 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {avgQuiz >= 70 ? 'Good' : 'Needs Work'}
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

export default QuizInsight;
