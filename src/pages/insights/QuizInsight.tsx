import React from 'react';
import { ClipboardCheck, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { QuizChart } from '@/components/charts/QuizChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const QuizInsight: React.FC = () => {
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
    
    if (student.avg_quiz < 60) {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Quiz Scores Below Average',
        description: 'Your quiz scores need improvement. Consider forming study groups and practicing with past quiz questions.',
      });
    }
    
    if (student.avg_quiz >= 80) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Outstanding Quiz Performance',
        description: 'Your quiz preparation is excellent! Keep up the consistent study habits.',
      });
    }

    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Quiz 4 Was Your Lowest',
      description: 'Quiz 4 had your lowest score. The topic covered may need additional review.',
    });

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quiz Insight</h1>
          <p className="text-muted-foreground">Review your quiz performance trends</p>
        </div>
      </div>

      {/* Current Value Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Average Quiz Score</p>
            <p className="text-4xl font-bold text-foreground">{student.avg_quiz}%</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${student.avg_quiz >= 70 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {student.avg_quiz >= 70 ? 'Good' : 'Needs Work'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <QuizChart currentValue={student.avg_quiz} />

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
