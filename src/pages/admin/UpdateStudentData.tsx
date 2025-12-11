import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useStudent } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Edit2, Loader2, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface StudentRecord {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  department: string;
  semester: number;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
}

interface WeeklyAttendance {
  week_number: number;
  attendance_percentage: number;
  subject_id: string;
}

interface AssignmentSubmission {
  assignment_number: number;
  marks_obtained: number;
  assignment_date: string;
  subject_id: string;
}

interface QuizResult {
  quiz_number: number;
  marks_obtained: number;
  quiz_date: string;
  subject_id: string;
}

interface WeeklyStress {
  week_number: number;
  stress_index: number;
  social_media_hours: number;
  travel_time_minutes: number;
}

const UpdateStudentData: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [facultyDepartment, setFacultyDepartment] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'faculty' | 'student' | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('attendance');
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useStudent();

  useEffect(() => {
    if (currentUser?.role) setRole(currentUser.role as 'admin' | 'faculty' | 'student');
    if (currentUser?.department) setFacultyDepartment(currentUser.department);
  }, [currentUser]);

  // Keep local role/department in sync once context is ready
  useEffect(() => {
    if (currentUser?.role) {
      setRole(currentUser.role as 'admin' | 'faculty' | 'student');
    }
    if (currentUser?.department) {
      console.log(`[DEBUG] currentUser.department from context: "${currentUser.department}"`);
      setFacultyDepartment(currentUser.department);
    }
  }, [currentUser]);

  const canonicalDept = (value: string | undefined) => {
    const v = (value || '').trim().toLowerCase();
    if (!v) return '';
    if ([
      'it',
      'information technology',
    ].includes(v)) return 'IT';
    if ([
      'cse',
      'cs',
      'computer science',
      'computer science and engineering',
    ].includes(v)) return 'CSE';
    if ([
      'biotech',
      'biotechnology',
    ].includes(v)) return 'Biotech';
    if ([
      'ece',
      'ec',
      'electronics',
      'electronics and communication',
      'electronics and communication engineering',
    ].includes(v)) return 'ECE';
    if ([
      'me',
      'mechanical',
      'mechanical engineering',
    ].includes(v)) return 'ME';
    if ([
      'ee',
      'eee',
      'electrical',
      'electrical engineering',
    ].includes(v)) return 'EE';
    return v.toUpperCase();
  };

  const deptLabel = (code: string): string => {
    const map: Record<string, string> = {
      'IT': 'Information Technology',
      'CSE': 'Computer Science',
      'Biotech': 'Biotechnology',
      'ECE': 'Electronics',
      'ME': 'Mechanical',
      'EE': 'Electrical',
    };
    return map[code] || code;
  };

  const canEditStudent = (student: StudentRecord) => {
    if (role === 'admin') return true;
    if (role === 'faculty') {
      const facDept = canonicalDept(facultyDepartment);
      const studDept = canonicalDept(student.department);
      console.log(`[DEBUG] canEditStudent: faculty="${facultyDepartment}" (canon="${facDept}"), student="${student.full_name}" dept="${student.department}" (canon="${studDept}"), match=${facDept === studDept}`);
      if (!facDept) {
        console.log(`[DEBUG] Faculty department is empty`);
        return false;
      }
      return facDept === studDept;
    }
    return false;
  };

  // Attendance data
  const [weeklyAttendance, setWeeklyAttendance] = useState<WeeklyAttendance[]>([{
    week_number: 1,
    attendance_percentage: 0,
    subject_id: '',
  }]);

  // Assignment data
  const [assignments, setAssignments] = useState<AssignmentSubmission[]>([{
    assignment_number: 1,
    marks_obtained: 0,
    assignment_date: new Date().toISOString().split('T')[0],
    subject_id: '',
  }]);

  // Quiz data
  const [quizzes, setQuizzes] = useState<QuizResult[]>([{
    quiz_number: 1,
    marks_obtained: 0,
    quiz_date: new Date().toISOString().split('T')[0],
    subject_id: '',
  }]);

  // Stress data
  const [weeklyStress, setWeeklyStress] = useState<WeeklyStress[]>([
    { week_number: 1, stress_index: 0, social_media_hours: 0, travel_time_minutes: 0 },
  ]);

  // Keep week numbers sequential per subject for attendance
  const resequenceAttendance = (list: WeeklyAttendance[]) => {
    const counts: Record<string, number> = {};
    return list.map((item) => {
      const key = item.subject_id || 'unassigned';
      const next = (counts[key] || 0) + 1;
      counts[key] = next;
      return { ...item, week_number: next };
    });
  };

  // Ensure assignment/quiz numbers stay sequential per subject
  const resequenceAssignments = (list: AssignmentSubmission[]) => {
    const counts: Record<string, number> = {};
    return list.map((item) => {
      const key = item.subject_id || 'unassigned';
      const next = (counts[key] || 0) + 1;
      counts[key] = next;
      return { ...item, assignment_number: next };
    });
  };

  const resequenceQuizzes = (list: QuizResult[]) => {
    const counts: Record<string, number> = {};
    return list.map((item) => {
      const key = item.subject_id || 'unassigned';
      const next = (counts[key] || 0) + 1;
      counts[key] = next;
      return { ...item, quiz_number: next };
    });
  };

  // Fetch all students
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Prefer already-loaded state values
        let dept: string | undefined = canonicalDept(facultyDepartment) || undefined;
        let currentRole: 'admin' | 'faculty' | 'student' | null = role || null;

        const { data: authData } = await supabase.auth.getUser();
        const userId = authData.user?.id;

        if (userId) {
          const { data: profile } = await supabase.from('profiles').select('role, department').eq('id', userId).maybeSingle();
          if (profile) {
            currentRole = profile.role || currentRole;
            dept = canonicalDept(profile.department) || dept;
          }
        }

        if (currentRole) setRole(currentRole);
        if (dept) setFacultyDepartment(dept);

        // Load subjects scoped to department (admin sees all)
        const subjectQuery = supabase.from('subjects').select('*').eq('is_active', true);
        if (dept && currentRole === 'faculty') {
          subjectQuery.eq('department', dept);
        }
        const { data: subjectRows, error: subjErr } = await subjectQuery.order('code');
        if (subjErr) throw subjErr;
        const list = subjectRows || [];
        setSubjects(list);

        // Set default subject ids on initial rows
        const defaultSubjectId = list[0]?.id || '';
        setWeeklyAttendance(resequenceAttendance([{ week_number: 1, attendance_percentage: 0, subject_id: defaultSubjectId }]));
        setAssignments(resequenceAssignments([{ assignment_number: 1, marks_obtained: 0, assignment_date: new Date().toISOString().split('T')[0], subject_id: defaultSubjectId }]));
        setQuizzes(resequenceQuizzes([{ quiz_number: 1, marks_obtained: 0, quiz_date: new Date().toISOString().split('T')[0], subject_id: defaultSubjectId }]));
      } catch (err) {
        console.error('Error bootstrapping subjects/profile', err);
      }
    };

    bootstrap();

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('full_name', { ascending: true });

        if (error) throw error;
        console.log(`[DEBUG] Fetched ${(data || []).length} students:`, data?.slice(0, 3));
        setStudents(data || []);
        setFilteredStudents(data || []);
      } catch (err) {
        console.error('Error fetching students:', err);
        toast.error('Failed to load students');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search
  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredStudents(
      students.filter(s =>
        s.full_name.toLowerCase().includes(term) ||
        s.student_id.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      )
    );
  }, [search, students]);

  const handleEditStudent = async (student: StudentRecord) => {
    if (!canEditStudent(student)) {
      toast.error('You can only update students in your department');
      return;
    }
    setEditingStudent(student);
    setError(null);
    setActiveTab('attendance');
    setIsDialogOpen(true);
    const defaultSubjectId = subjects[0]?.id || '';
    setWeeklyAttendance(resequenceAttendance([{ week_number: 1, attendance_percentage: 0, subject_id: defaultSubjectId }]));
    setAssignments(resequenceAssignments([{ assignment_number: 1, marks_obtained: 0, assignment_date: new Date().toISOString().split('T')[0], subject_id: defaultSubjectId }]));
    setQuizzes(resequenceQuizzes([{ quiz_number: 1, marks_obtained: 0, quiz_date: new Date().toISOString().split('T')[0], subject_id: defaultSubjectId }]));
    setWeeklyStress([{ week_number: 1, stress_index: 0, social_media_hours: 0, travel_time_minutes: 0 }]);
    // TODO: Fetch existing data for this student
  };

  const handleAddWeekAttendance = () => {
    const defaultSubjectId = subjects[0]?.id || '';
    const next = resequenceAttendance([...weeklyAttendance, { week_number: 1, attendance_percentage: 0, subject_id: defaultSubjectId }]);
    setWeeklyAttendance(next);
  };

  const handleAddAssignment = () => {
    const defaultSubjectId = subjects[0]?.id || '';
    const next = resequenceAssignments([...assignments, { assignment_number: 1, marks_obtained: 0, assignment_date: new Date().toISOString().split('T')[0], subject_id: defaultSubjectId }]);
    setAssignments(next);
  };

  const handleAddQuiz = () => {
    const defaultSubjectId = subjects[0]?.id || '';
    const next = resequenceQuizzes([...quizzes, { quiz_number: 1, marks_obtained: 0, quiz_date: new Date().toISOString().split('T')[0], subject_id: defaultSubjectId }]);
    setQuizzes(next);
  };

  const handleAddWeekStress = () => {
    const weekNumbers = weeklyStress.map(w => w.week_number).filter(n => Number.isFinite(n));
    const newWeek = weekNumbers.length > 0 ? Math.max(...weekNumbers) + 1 : 1;
    setWeeklyStress([...weeklyStress, { week_number: newWeek, stress_index: 0, social_media_hours: 0, travel_time_minutes: 0 }]);
  };

  const handleSaveData = async () => {
    if (!editingStudent) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!canEditStudent(editingStudent)) {
        throw new Error('You can only update students in your department');
      }

      const { data: facultyData } = await supabase
        .from('faculty')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!facultyData) throw new Error('Faculty record not found');

      // Validate subject selection and cap subject variety
      const subjectIds = new Set<string>();
      const missingSubject = [...weeklyAttendance, ...assignments, ...quizzes].some((row: any) => {
        if (!row.subject_id) return true;
        subjectIds.add(row.subject_id);
        return false;
      });
      if (missingSubject) throw new Error('Please select a subject for each row.');
      if (subjectIds.size > 6) throw new Error('Limit to at most 6 subjects per student.');

      // Save attendance data
      for (const attendance of weeklyAttendance) {
        const { error: attError } = await supabase
          .from('weekly_attendance')
          .upsert({
            student_id: editingStudent.id,
            subject_id: attendance.subject_id,
            week_number: attendance.week_number,
            academic_year: new Date().getFullYear().toString(),
            attendance_percentage: attendance.attendance_percentage,
            recorded_by: facultyData.id,
          }, { onConflict: 'student_id,subject_id,week_number,academic_year' });

        if (attError) throw attError;
      }

      // Save assignment data
      for (const assignment of assignments) {
        const { error: assError } = await supabase
          .from('assignment_submissions')
          .upsert({
            student_id: editingStudent.id,
            subject_id: assignment.subject_id,
            assignment_number: assignment.assignment_number,
            marks_obtained: assignment.marks_obtained,
            assignment_date: assignment.assignment_date,
            recorded_by: facultyData.id,
          }, { onConflict: 'student_id,subject_id,assignment_number' });

        if (assError) throw assError;
      }

      // Save quiz data
      for (const quiz of quizzes) {
        const { error: quizError } = await supabase
          .from('quiz_results')
          .upsert({
            student_id: editingStudent.id,
            subject_id: quiz.subject_id,
            quiz_number: quiz.quiz_number,
            marks_obtained: quiz.marks_obtained,
            quiz_date: quiz.quiz_date,
            recorded_by: facultyData.id,
          }, { onConflict: 'student_id,subject_id,quiz_number' });

        if (quizError) throw quizError;
      }

      // Save stress data
      for (const stress of weeklyStress) {
        const { error: stressError } = await supabase
          .from('weekly_stress')
          .upsert({
            student_id: editingStudent.id,
            week_number: stress.week_number,
            academic_year: new Date().getFullYear().toString(),
            stress_index: stress.stress_index,
            social_media_hours: stress.social_media_hours,
            travel_time_minutes: stress.travel_time_minutes,
            recorded_by: facultyData.id,
          }, { onConflict: 'student_id,week_number,academic_year' });

        if (stressError) throw stressError;
      }

      // Aggregate data to student_performance summary table
      console.log('[UpdateStudentData] Aggregating performance data for student:', editingStudent.id);
      
      // Fetch all detailed data for this student
      const { data: attData } = await supabase
        .from('weekly_attendance')
        .select('attendance_percentage')
        .eq('student_id', editingStudent.id);
      
      const { data: assignData } = await supabase
        .from('assignment_submissions')
        .select('marks_obtained')
        .eq('student_id', editingStudent.id);
      
      const { data: quizData } = await supabase
        .from('quiz_results')
        .select('marks_obtained')
        .eq('student_id', editingStudent.id);
      
      const { data: stressData } = await supabase
        .from('weekly_stress')
        .select('stress_index, social_media_hours, travel_time_minutes')
        .eq('student_id', editingStudent.id);
      
      const { data: interactionData } = await supabase
        .from('class_interactions')
        .select('interaction_score')
        .eq('student_id', editingStudent.id);

      // Calculate averages
      const avgAttendance = attData && attData.length > 0 
        ? attData.reduce((sum, d) => sum + (d.attendance_percentage || 0), 0) / attData.length 
        : 0;
      
      const avgAssignment = assignData && assignData.length > 0
        ? assignData.reduce((sum, d) => sum + (d.marks_obtained || 0), 0) / assignData.length
        : 0;
      
      const avgQuiz = quizData && quizData.length > 0
        ? quizData.reduce((sum, d) => sum + (d.marks_obtained || 0), 0) / quizData.length
        : 0;
      
      const avgStress = stressData && stressData.length > 0
        ? stressData.reduce((sum, d) => sum + (d.stress_index || 0), 0) / stressData.length
        : 0;
      
      const avgSocialMedia = stressData && stressData.length > 0
        ? stressData.reduce((sum, d) => sum + (d.social_media_hours || 0), 0) / stressData.length
        : 0;
      
      const avgTravelTime = stressData && stressData.length > 0
        ? stressData.reduce((sum, d) => sum + (d.travel_time_minutes || 0), 0) / stressData.length
        : 0;
      
      const avgInteraction = interactionData && interactionData.length > 0
        ? interactionData.reduce((sum, d) => sum + (d.interaction_score || 0), 0) / interactionData.length
        : 0;

      // Calculate score and risk level
      const score = (
        (avgAttendance * 0.20) +
        (avgAssignment * 0.25) +
        (avgQuiz * 0.25) +
        ((100 - Math.min(avgStress, 100)) * 0.15) +
        ((10 - Math.min(avgSocialMedia, 10)) * 10 * 0.10) +
        (avgInteraction * 0.05)
      );

      const riskLevel = score >= 70 ? 'Low Risk' : score >= 50 ? 'Medium Risk' : 'High Risk';

      // Upsert to student_performance
      const { error: perfError } = await supabase
        .from('student_performance')
        .upsert({
          student_id: editingStudent.id,
          semester: editingStudent.semester,
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
        }, { 
          onConflict: 'student_id,semester,academic_year' 
        });

      if (perfError) {
        console.error('[UpdateStudentData] Error updating student_performance:', perfError);
      } else {
        console.log('[UpdateStudentData] Successfully aggregated to student_performance');
      }

      toast.success(`All performance data updated for ${editingStudent.full_name}!`);
      setIsDialogOpen(false);
      setEditingStudent(null);
    } catch (err: any) {
      console.error('Error saving performance data:', err);
      setError(err.message || 'Failed to save performance data');
      toast.error(err.message || 'Failed to save performance data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Update Student Data</h1>
          <p className="text-muted-foreground">Manage detailed performance metrics (assignments, quizzes, attendance, stress)</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm">{student.student_id}</TableCell>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell className="text-sm">{student.email}</TableCell>
                      <TableCell>{deptLabel(student.department)}</TableCell>
                      <TableCell className="text-center">Sem {student.semester}</TableCell>
                      <TableCell>
                        <Dialog open={isDialogOpen && editingStudent?.id === student.id} onOpenChange={setIsDialogOpen}>
                          {(() => {
                            const allowed = canEditStudent(student);
                            const dept = facultyDepartment.trim();
                            const viewOnlyReason = role === 'faculty'
                              ? (dept ? `Only ${dept} faculty can update` : 'Department not set for faculty')
                              : 'View only';

                            if (!allowed) {
                              return (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="gap-2"
                                  title={viewOnlyReason}
                                >
                                  <Edit2 className="w-4 h-4" />
                                  View Only
                                </Button>
                              );
                            }

                            return (
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditStudent(student)}
                                  className="gap-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Update
                                </Button>
                              </DialogTrigger>
                            );
                          })()}
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Update Detailed Performance Data</DialogTitle>
                              <DialogDescription>
                                {editingStudent?.full_name} ({editingStudent?.student_id})
                                <p className="text-xs mt-1">
                                  System will automatically calculate averages and update student dashboard
                                </p>
                              </DialogDescription>
                            </DialogHeader>

                            {error && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                              </Alert>
                            )}

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                                <TabsTrigger value="stress">Stress</TabsTrigger>
                              </TabsList>

                              {/* ATTENDANCE TAB */}
                              <TabsContent value="attendance" className="space-y-4">
                                <p className="text-sm text-muted-foreground">Enter weekly attendance percentages</p>
                                {weeklyAttendance.map((att, idx) => (
                                  <div key={idx} className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                      <Label>Subject</Label>
                                      <Select
                                        value={att.subject_id}
                                        onValueChange={(value) => {
                                          const updated = [...weeklyAttendance];
                                          updated[idx].subject_id = value;
                                          setWeeklyAttendance(resequenceAttendance(updated));
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {subjects.map((subj) => (
                                            <SelectItem key={subj.id} value={subj.id}>
                                              {subj.code} - {subj.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      <Label>Week {att.week_number} Attendance (%)</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={att.attendance_percentage}
                                        onChange={(e) => {
                                          const updated = [...weeklyAttendance];
                                          updated[idx].attendance_percentage = parseFloat(e.target.value) || 0;
                                          setWeeklyAttendance(updated);
                                        }}
                                      />
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setWeeklyAttendance(resequenceAttendance(weeklyAttendance.filter((_, i) => i !== idx)))}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddWeekAttendance}
                                  className="gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Week
                                </Button>
                              </TabsContent>

                              {/* ASSIGNMENTS TAB */}
                              <TabsContent value="assignments" className="space-y-4">
                                <p className="text-sm text-muted-foreground">Enter assignment marks (0-100 for each)</p>
                                {assignments.map((ass, idx) => (
                                  <div key={idx} className="grid grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2">
                                      <Label>Subject</Label>
                                      <Select
                                        value={ass.subject_id}
                                        onValueChange={(value) => {
                                          const updated = [...assignments];
                                          updated[idx].subject_id = value;
                                          setAssignments(resequenceAssignments(updated));
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {subjects.map((subj) => (
                                            <SelectItem key={subj.id} value={subj.id}>
                                              {subj.code} - {subj.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Assignment {ass.assignment_number}</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="Marks"
                                        value={ass.marks_obtained}
                                        onChange={(e) => {
                                          const updated = [...assignments];
                                          updated[idx].marks_obtained = parseFloat(e.target.value) || 0;
                                          setAssignments(updated);
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Date</Label>
                                      <Input
                                        type="date"
                                        value={ass.assignment_date}
                                        onChange={(e) => {
                                          const updated = [...assignments];
                                          updated[idx].assignment_date = e.target.value;
                                          setAssignments(updated);
                                        }}
                                      />
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setAssignments(resequenceAssignments(assignments.filter((_, i) => i !== idx)))}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddAssignment}
                                  className="gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Assignment
                                </Button>
                              </TabsContent>

                              {/* QUIZZES TAB */}
                              <TabsContent value="quizzes" className="space-y-4">
                                <p className="text-sm text-muted-foreground">Enter quiz marks (0-100 for each)</p>
                                {quizzes.map((quiz, idx) => (
                                  <div key={idx} className="grid grid-cols-4 gap-4 items-end">
                                    <div className="space-y-2">
                                      <Label>Subject</Label>
                                      <Select
                                        value={quiz.subject_id}
                                        onValueChange={(value) => {
                                          const updated = [...quizzes];
                                          updated[idx].subject_id = value;
                                          setQuizzes(resequenceQuizzes(updated));
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {subjects.map((subj) => (
                                            <SelectItem key={subj.id} value={subj.id}>
                                              {subj.code} - {subj.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Quiz {quiz.quiz_number}</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="Marks"
                                        value={quiz.marks_obtained}
                                        onChange={(e) => {
                                          const updated = [...quizzes];
                                          updated[idx].marks_obtained = parseFloat(e.target.value) || 0;
                                          setQuizzes(updated);
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Date</Label>
                                      <Input
                                        type="date"
                                        value={quiz.quiz_date}
                                        onChange={(e) => {
                                          const updated = [...quizzes];
                                          updated[idx].quiz_date = e.target.value;
                                          setQuizzes(updated);
                                        }}
                                      />
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setQuizzes(resequenceQuizzes(quizzes.filter((_, i) => i !== idx)))}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddQuiz}
                                  className="gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Quiz
                                </Button>
                              </TabsContent>

                              {/* STRESS & WELLBEING TAB */}
                              <TabsContent value="stress" className="space-y-4">
                                <p className="text-sm text-muted-foreground">Enter weekly stress, social media, and travel time data</p>
                                {weeklyStress.map((stress, idx) => (
                                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                                    <h4 className="font-medium">Week {stress.week_number}</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                        <Label>Stress Index (0-100)</Label>
                                        <Input
                                          type="number"
                                          min="0"
                                          max="100"
                                          step="0.1"
                                          value={stress.stress_index}
                                          onChange={(e) => {
                                            const updated = [...weeklyStress];
                                            updated[idx].stress_index = parseFloat(e.target.value) || 0;
                                            setWeeklyStress(updated);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Social Media (hours/day)</Label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.5"
                                          value={stress.social_media_hours}
                                          onChange={(e) => {
                                            const updated = [...weeklyStress];
                                            updated[idx].social_media_hours = parseFloat(e.target.value) || 0;
                                            setWeeklyStress(updated);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Travel Time (mins/day)</Label>
                                        <Input
                                          type="number"
                                          min="0"
                                          step="1"
                                          value={stress.travel_time_minutes}
                                          onChange={(e) => {
                                            const updated = [...weeklyStress];
                                            updated[idx].travel_time_minutes = parseFloat(e.target.value) || 0;
                                            setWeeklyStress(updated);
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setWeeklyStress(weeklyStress.filter((_, i) => i !== idx))}
                                    >
                                      Remove Week
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddWeekStress}
                                  className="gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Week
                                </Button>
                              </TabsContent>
                            </Tabs>

                            <div className="flex gap-3 mt-6">
                              <Button
                                onClick={handleSaveData}
                                disabled={isLoading}
                                className="flex-1"
                              >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save All Data'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateStudentData;

