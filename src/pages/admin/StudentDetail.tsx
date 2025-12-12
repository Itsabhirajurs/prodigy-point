import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Calendar, FileText, Brain, Heart, Building2 } from 'lucide-react';
import { useStudent, StudentData, FacultyNote, SubjectAverage, calculateScore, calculateRiskLevel, calculatePrediction } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RiskCard } from '@/components/dashboard/RiskCard';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { AssignmentChart } from '@/components/charts/AssignmentChart';
import { QuizChart } from '@/components/charts/QuizChart';
import { StressChart } from '@/components/charts/StressChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

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

const DEPARTMENT_LABELS: Record<string, string> = {
  IT: 'Information Technology',
  CSE: 'Computer Science',
  Biotech: 'Biotechnology',
  ECE: 'Electronics',
  ME: 'Mechanical',
  EE: 'Electrical',
};

const getCachedUser = () => {
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Failed to parse cached user', err);
    return null;
  }
};

const StudentDetail: React.FC = () => {
  const { student_id } = useParams<{ student_id: string }>();
  const { getStudentById, addFacultyNote, getFacultyNotes } = useStudent();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [subjectAverages, setSubjectAverages] = useState<SubjectAverage[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');
  const [notes, setNotes] = useState<FacultyNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const cachedUser = useMemo(getCachedUser, []);
  const isAdmin = cachedUser?.role === 'admin';
  const facultyDept = canonicalDept(cachedUser?.department);
  const deptFilters = useMemo(() => {
    if (!facultyDept) return [] as string[];
    return Array.from(new Set([facultyDept, DEPARTMENT_LABELS[facultyDept] || facultyDept]));
  }, [facultyDept]);

  const mapStudentRow = useCallback((row: any): StudentData => {
    const attendance = Number(row.attendance) || 0;
    const avg_assignment = Number(row.avg_assignment) || 0;
    const avg_quiz = Number(row.avg_quiz) || 0;
    const stress_index = Number(row.stress_index) || 0;
    const social_media_hours = Number(row.social_media_hours) || 0;
    const travel_time = Number(row.travel_time) || 0;
    const class_interaction = Number(row.class_interaction) || 0;
    const score = Number(row.score) || calculateScore({
      attendance,
      avg_assignment,
      avg_quiz,
      class_interaction,
      stress_index,
      social_media_hours,
      travel_time,
    });

    return {
      id: row.id,
      student_id: row.student_id,
      name: row.full_name || row.name || '',
      email: row.email,
      department: row.department || '',
      semester: row.semester ? String(row.semester) : 'N/A',
      attendance,
      avg_assignment,
      avg_quiz,
      stress_index,
      social_media_hours,
      travel_time,
      class_interaction,
      score: Math.round(score * 100) / 100,
      risk_level: row.risk_level || calculateRiskLevel(score),
      prediction: row.prediction || calculatePrediction({ attendance, avg_assignment, avg_quiz }),
      role: 'student',
      last_updated: row.last_updated || row.updated_at || row.created_at || new Date().toISOString(),
    };
  }, []);

  const fetchStudentDirect = useCallback(async (id: string) => {
    try {
      // Try primary view first (includes aggregated metrics)
      const { data: viewData, error: viewError } = await supabase
        .from('v_student_overall')
        .select('*')
        .eq('student_id', id)
        .maybeSingle();

      let row = viewData;

      if (!row || viewError) {
        // Fallback to students + student_performance
        const { data: tableData, error: tableError } = await supabase
          .from('students')
          .select(`
            *,
            student_performance (
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
          .eq('student_id', id)
          .maybeSingle();

        if (tableError || !tableData) return null;
        const perf = tableData.student_performance?.[0] || {};
        row = { ...tableData, ...perf, updated_at: perf.updated_at || tableData.updated_at || tableData.created_at };
      }

      const mapped = mapStudentRow(row);
      if (!isAdmin && facultyDept && canonicalDept(mapped.department) !== facultyDept) {
        console.warn('Faculty tried to access student outside their department');
        return null;
      }
      return mapped;
    } catch (err) {
      console.error('Failed to fetch student detail directly', err);
      return null;
    }
  }, [facultyDept, isAdmin, mapStudentRow]);

  const fetchSubjectAverages = useCallback(async (id: string): Promise<SubjectAverage[]> => {
    try {
      const { data, error } = await supabase
        .from('v_student_subject_averages')
        .select('*')
        .eq('student_id', id);

      if (error) throw error;
      return (data || []).map((r) => ({
        subject_id: r.subject_id,
        subject_code: r.subject_code,
        subject_name: r.subject_name,
        avg_attendance: Number(r.avg_attendance) || 0,
        avg_assignment: Number(r.avg_assignment) || 0,
        avg_quiz: Number(r.avg_quiz) || 0,
        avg_stress_index: Number(r.avg_stress_index) || 0,
        avg_social_media_hours: Number(r.avg_social_media_hours) || 0,
        avg_travel_time: Number(r.avg_travel_time) || 0,
        avg_class_interaction: Number(r.avg_class_interaction) || 0,
        last_updated: r.last_updated,
      }));
    } catch (err) {
      console.error('Failed to load subject averages', err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!student_id) return;

    const load = async () => {
      setIsLoading(true);
      const student = getStudentById(student_id);
      const fetchedNotes = getFacultyNotes(student_id);

      const fetched = student ? student : await fetchStudentDirect(student_id);
      if (fetched) {
        setStudentData(fetched);
        const subjectKey = fetched.id || student_id;

        if (fetched.subject_averages && fetched.subject_averages.length > 0) {
          setSubjectAverages(fetched.subject_averages);
        } else if (subjectAverages.length === 0) {
          const subs = await fetchSubjectAverages(subjectKey);
          setSubjectAverages(subs);
        }
      }

      setNotes(fetchedNotes);
      setIsLoading(false);
    };

    load();
  }, [student_id, getStudentById, getFacultyNotes, fetchStudentDirect, fetchSubjectAverages, subjectAverages.length]);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !student_id) return;
    setIsSaving(true);
    const success = await addFacultyNote(student_id, newNote.trim());
    if (success) {
      const updatedNotes = getFacultyNotes(student_id);
      setNotes(updatedNotes);
      setNewNote('');
    }
    setIsSaving(false);
  };

  const sendMotivation = () => {
    if (studentData) {
      toast.success(`Motivation message sent to ${studentData.name}!`);
    }
  };

  const currentSubject = selectedSubjectId === 'overall'
    ? null
    : subjectAverages.find((s) => s.subject_id === selectedSubjectId);

  const metrics = {
    attendance: currentSubject ? currentSubject.avg_attendance : studentData?.attendance || 0,
    assignment: currentSubject ? currentSubject.avg_assignment : studentData?.avg_assignment || 0,
    quiz: currentSubject ? currentSubject.avg_quiz : studentData?.avg_quiz || 0,
    stress: currentSubject ? currentSubject.avg_stress_index : studentData?.stress_index || 0,
    social: currentSubject ? currentSubject.avg_social_media_hours : studentData?.social_media_hours || 0,
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!studentData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={() => navigate('/admin/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{studentData.name}</h1>
          <p className="text-muted-foreground">{studentData.student_id} • {studentData.department}</p>
        </div>
        {studentData.risk_level === 'High Risk' && (
          <Button onClick={sendMotivation} className="gap-2">
            <Send className="w-4 h-4" />
            Send Motivation
          </Button>
        )}
      </div>

      {/* Subject selector */}
      {studentData && (
        <Card className="border-primary/20">
          <CardContent className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">View metrics for</p>
              <p className="font-semibold text-foreground">{selectedSubjectId === 'overall' ? 'Overall' : (subjectAverages.find(s => s.subject_id === selectedSubjectId)?.subject_name || 'Subject')}</p>
            </div>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall</SelectItem>
                {subjectAverages.map((s) => (
                  <SelectItem key={s.subject_id} value={s.subject_id}>
                    {s.subject_code || s.subject_name} — {s.subject_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Student Overview Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {studentData.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{studentData.name}</h2>
            <p className="text-sm text-muted-foreground">ID: {studentData.student_id}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>{studentData.department}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{studentData.semester}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Attendance"
          value={`${metrics.attendance.toFixed(1)}%`}
          icon={Calendar}
          variant={metrics.attendance >= 80 ? 'success' : metrics.attendance >= 60 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Avg Assignment"
          value={metrics.assignment}
          icon={FileText}
          variant={metrics.assignment >= 70 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Avg Quiz"
          value={metrics.quiz}
          icon={Brain}
          variant={metrics.quiz >= 70 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Stress Index"
          value={metrics.stress}
          icon={Heart}
          variant={metrics.stress > 70 ? 'danger' : 'success'}
        />
      </div>

      {/* Risk Card */}
      <RiskCard
        score={studentData.score || 0}
        riskLevel={studentData.risk_level}
        prediction={studentData.prediction}
      />

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <AttendanceChart currentValue={metrics.attendance} />
        <AssignmentChart currentValue={metrics.assignment} />
        <QuizChart currentValue={metrics.quiz} />
        <StressChart currentValue={metrics.stress} />
      </div>

      {/* Faculty Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note about this student..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleSaveNote} 
              disabled={!newNote.trim() || isSaving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>

          {notes.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border bg-secondary/20 p-6 text-center mt-4">
              <p className="text-sm text-muted-foreground font-medium">No notes yet for this student</p>
              <p className="text-xs text-muted-foreground mt-1">Add notes to track student progress</p>
            </div>
          )}

          {notes.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-foreground">Previous Notes</h4>
              {notes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                  <p className="text-sm text-foreground">{note.note}</p>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span>By: {note.faculty_id}</span>
                    <span>•</span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetail;
