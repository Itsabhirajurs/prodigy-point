import React, { useState, useMemo } from 'react';
import { Target, BookOpen, Calendar, Brain, Smartphone, MessageSquare } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Subject {
  name: string;
  strength: number;
  status: 'strong' | 'average' | 'weak';
}

const calculateSubjectPercentage = (subjectAvg: any): number => {
  // Calculate overall subject performance based on attendance, assignments, and quizzes
  // Return 0 if no data available, will be updated when faculty adds data
  const att = subjectAvg.avg_attendance || 0;
  const asg = subjectAvg.avg_assignment || 0;
  const qz = subjectAvg.avg_quiz || 0;
  
  // If all metrics are 0, subject has no data yet
  if (att === 0 && asg === 0 && qz === 0) {
    return 0;
  }
  
  // Weighted average: 40% attendance, 30% assignment, 30% quiz
  return Math.max(0, Math.min(100,
    (att * 0.4) + (asg * 0.3) + (qz * 0.3)
  ));
};

const getStatus = (strength: number): 'strong' | 'average' | 'weak' => {
  if (strength >= 75) return 'strong';
  if (strength >= 50) return 'average';
  return 'weak';
};

const Recommendations: React.FC = () => {
  const { student, isLoading } = useStudent();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');

  if (isLoading || !student) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  const currentSubject = useMemo(
    () => student.subject_averages?.find((s) => String(s.subject_id) === selectedSubjectId),
    [student, selectedSubjectId]
  );

  const metrics = useMemo(() => {
    if (selectedSubjectId === 'overall') {
      return {
        attendance: student.attendance || 0,
        avg_quiz: student.avg_quiz || 0,
        avg_assignment: student.avg_assignment || 0,
        stress_index: student.stress_index || 0,
        social_media_hours: student.social_media_hours || 0,
        class_interaction: student.class_interaction || 0,
      };
    }
    return {
      attendance: currentSubject?.avg_attendance || 0,
      avg_quiz: currentSubject?.avg_quiz || 0,
      avg_assignment: currentSubject?.avg_assignment || 0,
      stress_index: currentSubject?.avg_stress_index || 0,
      social_media_hours: currentSubject?.avg_social_media_hours || 0,
      class_interaction: currentSubject?.avg_class_interaction || 0,
    };
  }, [student, currentSubject, selectedSubjectId]);

  const subjects: Subject[] = (() => {
    const list = (student.subject_averages || []).map((subj) => {
      const strength = Math.round(calculateSubjectPercentage(subj));
      return {
        name: subj.subject_name || subj.subject_code,
        strength,
        status: getStatus(strength),
      } as Subject;
    });

    // Return all subjects, sorted by strength (descending)
    return list.sort((a, b) => b.strength - a.strength);
  })();

  const getRecommendations = () => {
    const recommendations = [];
    const contextLabel = selectedSubjectId === 'overall' ? '' : `in ${currentSubject?.subject_name || 'this subject'} `;

    if (metrics.attendance < 75) {
      recommendations.push({
        icon: Calendar,
        title: 'Improve Attendance',
        description: selectedSubjectId === 'overall' 
          ? 'Attend at least 2 extra classes this week to boost your attendance above 75%.'
          : `Your attendance ${contextLabel}is below 75%. Focus on attending all upcoming classes.`,
        priority: 'high',
      });
    }

    if (metrics.avg_quiz < 60) {
      const weakSubject = subjects.filter((s) => s.status === 'weak')[0] || { name: currentSubject?.subject_name || 'this subject' };
      recommendations.push({
        icon: BookOpen,
        title: 'Focus on Quiz Preparation',
        description: selectedSubjectId === 'overall'
          ? `Review weak topics in ${weakSubject.name} and practice with past quiz questions.`
          : `Quiz scores ${contextLabel}need attention. Review key concepts and practice regularly.`,
        priority: 'high',
      });
    }

    if (metrics.stress_index > 70) {
      recommendations.push({
        icon: Brain,
        title: 'Manage Stress Levels',
        description: 'Practice 4-7-8 breathing technique: Inhale 4s, hold 7s, exhale 8s. Do this 3x daily.',
        priority: 'high',
      });
    }

    if (metrics.social_media_hours > 3) {
      recommendations.push({
        icon: Smartphone,
        title: 'Reduce Screen Time',
        description: `Limit social media to under 2 hours/day. Current: ${Math.round(metrics.social_media_hours * 10) / 10} hours.`,
        priority: 'medium',
      });
    }

    if (metrics.class_interaction < 50) {
      recommendations.push({
        icon: MessageSquare,
        title: 'Increase Class Participation',
        description: selectedSubjectId === 'overall'
          ? 'Try to ask at least one question per class or participate in discussions.'
          : `Increase participation ${contextLabel}by asking questions and engaging in discussions.`,
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Personalized Recommendations</h1>
          <p className="text-muted-foreground">Actionable steps to improve your performance</p>
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
          {subjects.length > 0 && subjects.filter(s => s.status === 'weak' || s.status === 'average')[0] && (
            <li className="flex items-center gap-2 text-sm text-foreground">
              <span className="w-2 h-2 rounded-full bg-accent" />
              Dedicate 30 minutes daily to {subjects.filter(s => s.status === 'weak' || s.status === 'average')[0].name} practice
            </li>
          )}
          <li className="flex items-center gap-2 text-sm text-foreground">
            <span className="w-2 h-2 rounded-full bg-success" />
            Join a study group for collaborative learning
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Recommendations;
