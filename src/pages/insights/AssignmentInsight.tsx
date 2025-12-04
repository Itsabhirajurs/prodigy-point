import React from 'react';
import { FileText, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { AssignmentChart } from '@/components/charts/AssignmentChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const AssignmentInsight: React.FC = () => {
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
    
    if (student.avg_assignment < 70) {
      insights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Assignment Scores Need Attention',
        description: 'Your average assignment score is below 70%. Focus on completing assignments on time and seeking help when needed.',
      });
    }
    
    if (student.avg_assignment >= 80) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Strong Assignment Performance',
        description: 'Excellent work on your assignments! Your consistency is paying off.',
      });
    }

    insights.push({
      type: 'info',
      icon: Target,
      title: 'Assignment 5 Analysis',
      description: 'Assignment 5 shows a dip in your scores. Consider revisiting that topic for better understanding.',
    });

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignment Insight</h1>
          <p className="text-muted-foreground">Analyze your assignment performance</p>
        </div>
      </div>

      {/* Current Value Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Average Assignment Score</p>
            <p className="text-4xl font-bold text-foreground">{student.avg_assignment}%</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${student.avg_assignment >= 70 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {student.avg_assignment >= 70 ? 'Good' : 'Needs Work'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <AssignmentChart currentValue={student.avg_assignment} />

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
