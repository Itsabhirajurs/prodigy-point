import React from 'react';
import { Target, BookOpen, Calendar, Brain, Smartphone, MessageSquare } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Progress } from '@/components/ui/progress';

interface Subject {
  name: string;
  strength: number;
  status: 'strong' | 'average' | 'weak';
}

const subjects: Subject[] = [
  { name: 'Mathematics', strength: 65, status: 'average' },
  { name: 'Physics', strength: 72, status: 'average' },
  { name: 'English', strength: 85, status: 'strong' },
  { name: 'Programming', strength: 78, status: 'average' },
];

const Recommendations: React.FC = () => {
  const { student, isLoading } = useStudent();

  if (isLoading || !student) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  const getRecommendations = () => {
    const recommendations = [];

    if (student.attendance < 75) {
      recommendations.push({
        icon: Calendar,
        title: 'Improve Attendance',
        description: 'Attend at least 2 extra classes this week to boost your attendance above 75%.',
        priority: 'high',
      });
    }

    if (student.avg_quiz < 60) {
      recommendations.push({
        icon: BookOpen,
        title: 'Focus on Quiz Preparation',
        description: 'Review weak topics in Mathematics and practice with past quiz questions.',
        priority: 'high',
      });
    }

    if (student.stress_index > 70) {
      recommendations.push({
        icon: Brain,
        title: 'Manage Stress Levels',
        description: 'Practice 4-7-8 breathing technique: Inhale 4s, hold 7s, exhale 8s. Do this 3x daily.',
        priority: 'high',
      });
    }

    if (student.social_media_hours > 3) {
      recommendations.push({
        icon: Smartphone,
        title: 'Reduce Screen Time',
        description: `Limit social media to under 2 hours/day. Current: ${student.social_media_hours.toFixed(1)} hours.`,
        priority: 'medium',
      });
    }

    if (student.class_interaction < 50) {
      recommendations.push({
        icon: MessageSquare,
        title: 'Increase Class Participation',
        description: 'Try to ask at least one question per class or participate in discussions.',
        priority: 'medium',
      });
    }

    // Always add a general tip
    recommendations.push({
      icon: Target,
      title: 'Set Weekly Goals',
      description: 'Create a study schedule with specific goals for each subject. Review progress every Sunday.',
      priority: 'low',
    });

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-destructive/30 bg-destructive/5';
      case 'medium':
        return 'border-warning/30 bg-warning/5';
      default:
        return 'border-primary/30 bg-primary/5';
    }
  };

  const getStrengthColor = (status: string) => {
    switch (status) {
      case 'strong':
        return 'bg-success';
      case 'weak':
        return 'bg-destructive';
      default:
        return 'bg-warning';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
          <Target className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personalized Recommendations</h1>
          <p className="text-muted-foreground">Actionable steps to improve your performance</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Action Items</h2>
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          return (
            <div
              key={index}
              className={`bg-card rounded-xl p-4 card-shadow border-l-4 ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{rec.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.priority === 'high'
                          ? 'bg-destructive/10 text-destructive'
                          : rec.priority === 'medium'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subject Focus */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h2 className="text-lg font-semibold text-foreground mb-4">Subject-wise Focus Areas</h2>
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{subject.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    subject.status === 'strong'
                      ? 'bg-success/10 text-success'
                      : subject.status === 'weak'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {subject.strength}%
                </span>
              </div>
              <Progress value={subject.strength} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Focus Tips */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">💡 This Week's Focus</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Complete all pending assignments before Friday
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Dedicate 30 minutes daily to Mathematics practice
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-2 h-2 rounded-full bg-success" />
            Join a study group for Physics concepts
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Recommendations;
