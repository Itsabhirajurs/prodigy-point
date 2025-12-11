import React from 'react';
import { Brain, Smartphone, Clock, Heart, AlertTriangle } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { StressChart } from '@/components/charts/StressChart';
import { SocialMediaChart } from '@/components/charts/SocialMediaChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const StressInsight: React.FC = () => {
  const { student, isLoading } = useStudent();
  const stressRecords = student?.stress_records || [];

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
    const latestStress = stressRecords[stressRecords.length - 1];
    const peakStress = stressRecords.reduce(
      (max, r) => r.stress_index > max.stress_index ? r : max,
      stressRecords[0] || { week_number: 0, academic_year: '', stress_index: 0, social_media_hours: 0, travel_time_minutes: 0 }
    );
    const avgSocial = stressRecords.length > 0
      ? stressRecords.reduce((sum, r) => sum + (r.social_media_hours || 0), 0) / stressRecords.length
      : student.social_media_hours;
    const latestTravel = stressRecords.length > 0 ? (stressRecords[stressRecords.length - 1].travel_time_minutes || 0) : student.travel_time;
    const currentStress = latestStress?.stress_index ?? student.stress_index;
    
    if (currentStress > 70) {
      insights.push({
        type: 'danger',
        icon: AlertTriangle,
        title: 'High Stress Detected',
        description: `Recent stress index is ${Math.round(currentStress)}. Consider breathing breaks and talking with a counselor.`,
      });
    }
    
    if (avgSocial > 3) {
      insights.push({
        type: 'warning',
        icon: Smartphone,
        title: 'High Social Media Usage',
        description: `You're spending ${avgSocial.toFixed(1)} hours/day on social media. Try reducing to under 2 hours.`,
      });
    }

    if (latestTravel > 45) {
      insights.push({
        type: 'info',
        icon: Clock,
        title: 'Long Commute Time',
        description: `Your ${latestTravel} min commute may be affecting your energy levels and study time.`,
      });
    }

    if (peakStress && peakStress.week_number) {
      insights.push({
        type: peakStress.stress_index > 70 ? 'danger' : 'info',
        icon: Heart,
        title: `Peak stress in Week ${peakStress.week_number}`,
        description: `Stress index hit ${Math.round(peakStress.stress_index)}. Note what happened that week to adjust routines.`,
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-danger flex items-center justify-center">
          <Brain className="w-7 h-7 text-destructive-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stress & Behavior Tracker</h1>
          <p className="text-muted-foreground">Monitor your wellbeing metrics</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 card-shadow text-center">
          <Brain className="w-6 h-6 mx-auto mb-2 text-destructive" />
          <p className="text-2xl font-bold text-foreground">{Math.round(student.stress_index)}%</p>
          <p className="text-xs text-muted-foreground">Stress Index</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow text-center">
          <Smartphone className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{student.social_media_hours.toFixed(1)}h</p>
          <p className="text-xs text-muted-foreground">Social Media</p>
        </div>
        <div className="bg-card rounded-xl p-4 card-shadow text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold text-foreground">{Math.round(student.travel_time)}m</p>
          <p className="text-xs text-muted-foreground">Travel Time</p>
        </div>
      </div>

      {/* Charts */}
      <StressChart
        currentValue={student.stress_index}
        data={stressRecords.map((r) => ({
          week: `Week ${r.week_number}`,
          stress: r.stress_index,
          social: r.social_media_hours,
          travel: r.travel_time_minutes,
        }))}
      />
      <SocialMediaChart
        totalHours={student.social_media_hours}
        data={stressRecords.map((r) => ({
          label: `Week ${r.week_number}`,
          hours: r.social_media_hours,
        }))}
      />

      {/* Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Behavioral Insights</h2>
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const bgColor = insight.type === 'success' ? 'bg-success/10' : insight.type === 'warning' ? 'bg-warning/10' : insight.type === 'danger' ? 'bg-destructive/10' : 'bg-primary/10';
          const iconColor = insight.type === 'success' ? 'text-success' : insight.type === 'warning' ? 'text-warning' : insight.type === 'danger' ? 'text-destructive' : 'text-primary';
          
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

export default StressInsight;
