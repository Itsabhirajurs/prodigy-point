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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-destructive/20 via-warning/10 to-card p-8 border-2 border-destructive/30 shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none overflow-hidden">
          <div className="absolute -left-32 top-1/4 w-64 h-64 bg-destructive/10 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute -right-32 bottom-1/4 w-80 h-80 bg-warning/5 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-danger flex items-center justify-center shadow-lg">
            <Brain className="w-7 h-7 text-destructive-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground uppercase tracking-wide">Stress & Behavior Tracker</h1>
            <p className="text-muted-foreground text-lg">Monitor your wellbeing metrics and stress levels</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-destructive/15 to-destructive/5 rounded-xl p-6 card-shadow text-center border-2 border-destructive/30 hover:border-destructive/60 transition-all hover:shadow-neon-lg hover:scale-105 group">
          <Brain className="w-7 h-7 mx-auto mb-3 text-destructive group-hover:scale-125 transition-transform" />
          <p className="text-3xl font-bold text-foreground">{Math.round(student.stress_index)}%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-2">Stress Index</p>
        </div>
        <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl p-6 card-shadow text-center border-2 border-primary/30 hover:border-primary/60 transition-all hover:shadow-neon-lg hover:scale-105 group">
          <Smartphone className="w-7 h-7 mx-auto mb-3 text-primary group-hover:scale-125 transition-transform" />
          <p className="text-3xl font-bold text-foreground">{student.social_media_hours.toFixed(1)}h</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-2">Social Media</p>
        </div>
        <div className="bg-gradient-to-br from-accent/15 to-accent/5 rounded-xl p-6 card-shadow text-center border-2 border-accent/30 hover:border-accent/60 transition-all hover:shadow-neon-lg hover:scale-105 group">
          <Clock className="w-7 h-7 mx-auto mb-3 text-accent group-hover:scale-125 transition-transform" />
          <p className="text-3xl font-bold text-foreground">{Math.round(student.travel_time)}m</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-2">Travel Time</p>
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
        <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide">Behavioral Insights</h2>
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const bgColor = insight.type === 'success' ? 'from-success/15 to-success/5' : insight.type === 'warning' ? 'from-warning/15 to-warning/5' : insight.type === 'danger' ? 'from-destructive/15 to-destructive/5' : 'from-primary/15 to-primary/5';
          const borderColor = insight.type === 'success' ? 'border-success/30' : insight.type === 'warning' ? 'border-warning/30' : insight.type === 'danger' ? 'border-destructive/30' : 'border-primary/30';
          const iconColor = insight.type === 'success' ? 'text-success' : insight.type === 'warning' ? 'text-warning' : insight.type === 'danger' ? 'text-destructive' : 'text-primary';
          
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

export default StressInsight;
