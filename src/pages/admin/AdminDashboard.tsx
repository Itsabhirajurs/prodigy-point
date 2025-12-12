import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle, TrendingUp, ArrowRight, Shield, BarChart3, PieChart, GraduationCap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskDistributionChart } from '@/components/admin/RiskDistributionChart';
import { AtRiskTable } from '@/components/admin/AtRiskTable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface StudentData {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  department: string;
  semester: number;
  attendance?: number;
  avg_assignment?: number;
  avg_quiz?: number;
  stress_index?: number;
  social_media_hours?: number;
  travel_time?: number;
  class_interaction?: number;
  score?: number;
  risk_level?: string;
  prediction?: string;
  updated_at: string;
}

// Local helper to read cached auth user set by Login.tsx
const getCachedUser = () => {
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Failed to parse cached user', err);
    return null;
  }
};

// Map any variant to canonical department code used in DB
const canonicalDept = (value: string | undefined | null): string => {
  const v = (value || '').trim().toLowerCase();
  if (!v) return '';
  if (['it', 'information technology'].includes(v)) return 'IT';
  if (['cse', 'cs', 'computer science', 'computer science and engineering'].includes(v)) return 'CSE';
  if (['biotech', 'biotechnology'].includes(v)) return 'Biotech';
  if (['ece', 'ec', 'electronics', 'electronics and communication', 'electronics and communication engineering'].includes(v)) return 'ECE';
  if (['me', 'mechanical', 'mechanical engineering'].includes(v)) return 'ME';
  if (['ee', 'eee', 'electrical', 'electrical engineering'].includes(v)) return 'EE';
  return v.toUpperCase();
};

const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [facultyCount, setFacultyCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const cachedUser = useMemo(getCachedUser, []);
  const isAdmin = cachedUser?.role === 'admin';
  const facultyDept = canonicalDept(cachedUser?.department);

  const fetchData = async () => {
    setIsLoading(true);
    if (!isAdmin && !facultyDept) {
      console.warn('Faculty department missing; restricting access until provided');
      setStudents([]);
      setIsLoading(false);
      return;
    }
    try {
      console.log('[AdminDashboard] Starting data fetch. IsAdmin:', isAdmin, 'FacultyDept:', facultyDept);
      
      // Direct query to students + student_performance without using views
      // This bypasses any RLS issues with views
      let tableQuery = supabase
        .from('students')
        .select(`
          id,
          student_id,
          full_name,
          email,
          department,
          semester,
          created_at,
          student_performance (
            id,
            attendance,
            avg_assignment,
            avg_quiz,
            stress_index,
            social_media_hours,
            travel_time,
            class_interaction,
            score,
            risk_level,
            prediction,
            updated_at
          )
        `)
        .order('full_name');

      if (!isAdmin && facultyDept) {
        tableQuery = tableQuery.eq('department', facultyDept);
      }

      console.log('[AdminDashboard] Executing direct students query...');
      const tableResult = await tableQuery;
      console.log('[AdminDashboard] Query result - Error:', tableResult.error, 'Data count:', tableResult.data?.length);

      if (!tableResult.error && tableResult.data) {
        const mapped = (tableResult.data || []).map((s: any) => {
          const perf = s.student_performance?.[0] || {};
          return {
            id: s.id,
            student_id: s.student_id,
            full_name: s.full_name,
            email: s.email,
            department: s.department,
            semester: s.semester,
            attendance: perf.attendance || 0,
            avg_assignment: perf.avg_assignment || 0,
            avg_quiz: perf.avg_quiz || 0,
            stress_index: perf.stress_index || 0,
            social_media_hours: perf.social_media_hours || 0,
            travel_time: perf.travel_time || 0,
            class_interaction: perf.class_interaction || 0,
            score: perf.score || 0,
            risk_level: perf.risk_level || 'Unknown',
            prediction: perf.prediction || 'Unknown',
            updated_at: perf.updated_at || s.created_at,
          };
        });

        // If no performance data was found via relationship, fetch separately
        const studentsWithoutPerf = mapped.filter(s => s.score === 0 && s.risk_level === 'Unknown');
        if (studentsWithoutPerf.length > 0) {
          console.log('[AdminDashboard] Some students missing performance data, fetching separately:', studentsWithoutPerf.length);
          const studentIds = studentsWithoutPerf.map(s => s.id);
          const { data: perfData, error: perfError } = await supabase
            .from('student_performance')
            .select('*')
            .in('student_id', studentIds);
          
          if (!perfError && perfData) {
            console.log('[AdminDashboard] Got performance data:', perfData.length);
            // Update students with performance data
            const perfMap = new Map(perfData.map(p => [p.student_id, p]));
            mapped.forEach(s => {
              const perf = perfMap.get(s.id);
              if (perf) {
                s.attendance = perf.attendance || 0;
                s.avg_assignment = perf.avg_assignment || 0;
                s.avg_quiz = perf.avg_quiz || 0;
                s.stress_index = perf.stress_index || 0;
                s.social_media_hours = perf.social_media_hours || 0;
                s.travel_time = perf.travel_time || 0;
                s.class_interaction = perf.class_interaction || 0;
                s.score = perf.score || 0;
                s.risk_level = perf.risk_level || 'Unknown';
                s.prediction = perf.prediction || 'Unknown';
                s.updated_at = perf.updated_at || s.updated_at;
              }
            });
          } else if (perfError) {
            console.error('[AdminDashboard] Error fetching performance data:', perfError);
          }
        }
        
        const filtered = !isAdmin && facultyDept
          ? mapped.filter(s => canonicalDept(s.department) === facultyDept)
          : mapped;
        console.log('[AdminDashboard] Setting students. Total:', filtered.length);
        setStudents(filtered);
      } else {
        console.error('[AdminDashboard] Table query failed:', tableResult.error);
        setStudents([]);
      }

      // Fetch faculty count from Supabase
      const { count, error } = await supabase
        .from('faculty')
        .select('id', { count: 'exact', head: true });
      if (!error && typeof count === 'number') {
        setFacultyCount(count);
      }
    } catch (err) {
      console.error('[AdminDashboard] Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      let studentsQuery = supabase.from('students').select('id, student_id, full_name, semester, department');
      if (!isAdmin && facultyDept) {
        studentsQuery = studentsQuery.eq('department', facultyDept);
      }
      
      const { data: studentsList, error: studentsError } = await studentsQuery;
      if (studentsError) throw studentsError;
      if (!studentsList || studentsList.length === 0) {
        toast.info('No students found to sync');
        return;
      }

      console.log(`[Sync] Processing ${studentsList.length} students`);
      let successCount = 0;

      for (const student of studentsList) {
        try {
          const { data: attData } = await supabase.from('weekly_attendance').select('attendance_percentage').eq('student_id', student.id);
          const { data: assignData } = await supabase.from('assignment_submissions').select('marks_obtained').eq('student_id', student.id);
          const { data: quizData } = await supabase.from('quiz_results').select('marks_obtained').eq('student_id', student.id);
          const { data: stressData } = await supabase.from('weekly_stress').select('stress_index, social_media_hours, travel_time_minutes').eq('student_id', student.id);
          const { data: interactionData } = await supabase.from('class_interactions').select('interaction_score').eq('student_id', student.id);

          const avgAttendance = attData && attData.length > 0 ? attData.reduce((sum, d) => sum + (d.attendance_percentage || 0), 0) / attData.length : 0;
          const avgAssignment = assignData && assignData.length > 0 ? assignData.reduce((sum, d) => sum + (d.marks_obtained || 0), 0) / assignData.length : 0;
          const avgQuiz = quizData && quizData.length > 0 ? quizData.reduce((sum, d) => sum + (d.marks_obtained || 0), 0) / quizData.length : 0;
          const avgStress = stressData && stressData.length > 0 ? stressData.reduce((sum, d) => sum + (d.stress_index || 0), 0) / stressData.length : 0;
          const avgSocialMedia = stressData && stressData.length > 0 ? stressData.reduce((sum, d) => sum + (d.social_media_hours || 0), 0) / stressData.length : 0;
          const avgTravelTime = stressData && stressData.length > 0 ? stressData.reduce((sum, d) => sum + (d.travel_time_minutes || 0), 0) / stressData.length : 0;
          const avgInteraction = interactionData && interactionData.length > 0 ? interactionData.reduce((sum, d) => sum + (d.interaction_score || 0), 0) / interactionData.length : 0;

          const score = (avgAttendance * 0.20) + (avgAssignment * 0.25) + (avgQuiz * 0.25) + ((100 - Math.min(avgStress, 100)) * 0.15) + ((10 - Math.min(avgSocialMedia, 10)) * 10 * 0.10) + (avgInteraction * 0.05);
          const riskLevel = score >= 70 ? 'Low Risk' : score >= 50 ? 'Medium Risk' : 'High Risk';

          const { error: perfError } = await supabase.from('student_performance').upsert({
            student_id: student.id,
            semester: student.semester,
            academic_year: new Date().getFullYear().toString(),
            attendance: avgAttendance,
            avg_assignment: avgAssignment,
            avg_quiz: avgQuiz,
            stress_index: avgStress,
            social_media_hours: avgSocialMedia,
            travel_time: avgTravelTime,
            class_interaction: avgInteraction,
            score: score,
            risk_level: riskLevel,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'student_id,semester,academic_year' });

          if (!perfError) successCount++;
        } catch (err) {
          console.error(`[Sync] Error for ${student.student_id}:`, err);
        }
      }

      toast.success(`Synced ${successCount} of ${studentsList.length} students!`);
      await fetchData();
    } catch (err: any) {
      console.error('[Sync] Error:', err);
      toast.error(err.message || 'Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalStudents = students.length;
  const lowRisk = students.filter(s => s.risk_level === 'Low Risk').length;
  const mediumRisk = students.filter(s => s.risk_level === 'Medium Risk').length;
  const highRisk = students.filter(s => s.risk_level === 'High Risk').length;
  const onTrack = students.filter(s => s.prediction === 'On Track').length;
  const needsSupport = students.filter(s => s.prediction === 'Needs Support').length;

  const atRiskStudents = students
    .filter(s => s.risk_level === 'High Risk' || (s.score || 0) < 50)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 5)
    .map(s => ({
      id: s.id,
      student_id: s.student_id,
      name: s.full_name,
      department: s.department,
      semester: String(s.semester),
      score: s.score || 0,
      risk_level: s.risk_level || 'Unknown',
      prediction: s.prediction || 'Unknown',
      attendance: s.attendance || 0,
      avg_assignment: s.avg_assignment || 0,
      avg_quiz: s.avg_quiz || 0,
      stress_index: s.stress_index || 0,
      social_media_hours: s.social_media_hours || 0,
      travel_time: s.travel_time || 0,
      class_interaction: s.class_interaction || 0,
      last_updated: s.updated_at,
      role: 'student' as const,
      email: s.email,
    }));

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Admin view: focus on managing credentials and data access
  if (isAdmin) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Enhanced Header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-accent/20 p-8 border-2 border-primary/20 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/15 rounded-full filter blur-3xl animate-float animation-delay-2000"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-primary/30 shadow-lg">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">Admin Console</h1>
              </div>
              <p className="text-lg text-muted-foreground">Manage faculty accounts and student credentials</p>
            </div>
            <Button onClick={() => navigate('/admin/users')} className="gap-2 h-11 px-6">
              Manage Users
              <Shield className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Key counts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/15 to-primary/5 border-primary/40 hover:border-primary/70 transition-all hover:shadow-neon-lg hover:scale-102">
            <CardContent className="pt-6 flex items-center justify-between group">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Faculty</p>
                <p className="text-4xl font-bold text-foreground mt-2">{facultyCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/15 to-accent/5 border-accent/40 hover:border-accent/70 transition-all hover:shadow-neon-lg hover:scale-102">
            <CardContent className="pt-6 flex items-center justify-between group">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Students</p>
                <p className="text-4xl font-bold text-foreground mt-2">{totalStudents}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 shadow-lg group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/15 to-warning/5 border-warning/40 hover:border-warning/70 transition-all hover:shadow-neon-lg hover:scale-102">
            <CardContent className="pt-6 flex items-center justify-between group">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">At Risk</p>
                <p className="text-4xl font-bold text-warning mt-2">{highRisk}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 shadow-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple visuals */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-card/95 via-primary/5 to-card border-2 border-primary/30 hover:border-primary/50 transition-all hover:shadow-neon-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-wide">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                Headcount Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-28 text-sm text-muted-foreground font-semibold uppercase">Faculty</span>
                <div className="flex-1 h-4 rounded-full bg-secondary/50 border border-primary/20 overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-primary to-primary/50"
                    style={{ width: `${Math.min(100, facultyCount || 0) + 10}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-bold text-foreground">{facultyCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-28 text-sm text-muted-foreground font-semibold uppercase">Students</span>
                <div className="flex-1 h-4 rounded-full bg-secondary/50 border border-accent/20 overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-accent to-accent/50"
                    style={{ width: `${Math.min(100, totalStudents || 0) + 10}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-bold text-foreground">{totalStudents}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card/95 via-warning/5 to-card border-2 border-warning/30 hover:border-warning/50 transition-all hover:shadow-neon-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-wide">
                <div className="p-2 rounded-lg bg-warning/10">
                  <PieChart className="w-6 h-6 text-warning" />
                </div>
                Risk Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20 hover:border-success/40 transition-all">
                <p className="text-sm font-semibold text-foreground">Low Risk</p>
                <p className="text-lg font-bold text-success">{lowRisk}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20 hover:border-warning/40 transition-all">
                <p className="text-sm font-semibold text-foreground">Medium Risk</p>
                <p className="text-lg font-bold text-warning">{mediumRisk}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20 hover:border-destructive/40 transition-all">
                <p className="text-sm font-semibold text-foreground">High Risk</p>
                <p className="text-lg font-bold text-destructive">{highRisk}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Faculty Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 via-primary/10 to-purple-500/20 p-8 border-2 border-accent/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/15 rounded-full filter blur-3xl animate-float animation-delay-2000"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-accent/30 shadow-lg">
                <GraduationCap className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Faculty Dashboard</h1>
            </div>
            <p className="text-lg text-muted-foreground">Overview of your department{facultyDept ? ` (${facultyDept})` : ''}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncData} 
              disabled={isSyncing}
              variant="outline"
              className="gap-2 h-11 px-4"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </Button>
            <Button onClick={() => navigate('/admin/students')} className="gap-2 h-11 px-6">
              View All Students
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/10 border-success/20">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-success">{lowRisk}</p>
            <p className="text-sm text-success/80">Low Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-warning">{mediumRisk}</p>
            <p className="text-sm text-warning/80">Medium Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-danger/10 border-danger/20">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-danger">{highRisk}</p>
            <p className="text-sm text-danger/80">High Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-success/10 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">{onTrack}</p>
                <p className="text-sm text-success/80">On Track</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-danger/10 border-danger/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <div>
                <p className="text-2xl font-bold text-danger">{needsSupport}</p>
                <p className="text-sm text-danger/80">Needs Support</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart
              lowRisk={lowRisk}
              mediumRisk={mediumRisk}
              highRisk={highRisk}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              Top 5 At-Risk Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AtRiskTable 
              students={atRiskStudents}
              onMessageStudent={(studentId) => navigate('/admin/messages', { state: { studentId } })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
