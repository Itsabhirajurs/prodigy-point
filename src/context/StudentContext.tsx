import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export type AppRole = 'student' | 'faculty' | 'admin';

export interface StudentData {
  id?: string;            // db id (uuid) if available
  student_id: string;     // human-readable id e.g. STU001
  name: string;
  email?: string;
  department: string;
  semester: string;
  attendance: number;
  avg_assignment: number;
  avg_quiz: number;
  stress_index: number;
  social_media_hours: number;
  travel_time: number;
  class_interaction: number;
  score: number;
  risk_level: string;
  prediction: string;
  role: AppRole;
  last_updated: string;
  subject_averages?: SubjectAverage[];
  assignments?: AssignmentItem[];
  quizzes?: QuizItem[];
  attendance_records?: AttendanceItem[];
  stress_records?: StressItem[];
}

export interface SubjectAverage {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  avg_attendance: number;
  avg_assignment: number;
  avg_quiz: number;
  avg_stress_index: number;
  avg_social_media_hours: number;
  avg_travel_time: number;
  avg_class_interaction: number;
  last_updated?: string;
}

export interface AssignmentItem {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  assignment_number: number;
  marks_obtained: number;
  assignment_date: string;
}

export interface QuizItem {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  quiz_number: number;
  marks_obtained: number;
  quiz_date: string;
}

export interface AttendanceItem {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  week_number: number;
  academic_year: string;
  attendance_percentage: number;
}

export interface StressItem {
  week_number: number;
  academic_year: string;
  stress_index: number;
  social_media_hours: number;
  travel_time_minutes: number;
}

export interface FacultyNote {
  id: string;
  student_id: string;
  faculty_id: string;
  note: string;
  created_at: string;
}

interface StudentContextType {
  currentUser: StudentData | null;
  student: StudentData | null; // Alias for compatibility
  isLoading: boolean;
  isFaculty: boolean;
  isAdmin: boolean;
  login: (studentId: string) => Promise<{ success: boolean; role?: AppRole }>;
  logout: () => void;
  refreshData: () => Promise<void>;
  getAllStudents: () => StudentData[];
  getStudentById: (studentId: string) => StudentData | null;
  updateStudentData: (studentId: string, data: Partial<StudentData>) => boolean;
  addFacultyNote: (studentId: string, note: string) => Promise<boolean>;
  getFacultyNotes: (studentId: string) => FacultyNote[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const canonicalDepartment = (value: string | undefined | null): string => {
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

// Calculate score based on the formula
export const calculateScore = (data: Partial<StudentData>): number => {
  const {
    attendance = 0,
    avg_quiz = 0,
    avg_assignment = 0,
    class_interaction = 0,
    stress_index = 0,
    social_media_hours = 0,
    travel_time = 0,
  } = data;

  return (
    (attendance * 0.45) +
    (avg_quiz * 0.25) +
    (avg_assignment * 0.20) +
    (class_interaction * 2) -
    (stress_index * 0.30) -
    (social_media_hours * 3) -
    (travel_time * 0.05)
  );
};

export const calculateRiskLevel = (score: number): string => {
  if (score >= 70) return "Low Risk";
  if (score >= 50) return "Medium Risk";
  return "High Risk";
};

export const calculatePrediction = (data: Partial<StudentData>): string => {
  const { attendance = 0, avg_assignment = 0, avg_quiz = 0 } = data;
  return attendance > 75 && avg_assignment > 70 && avg_quiz > 70
    ? "On Track"
    : "Needs Support";
};

let facultyNotes: FacultyNote[] = [];

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StudentData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isFaculty = currentUser?.role === 'faculty' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const limitSubjectAverages = (list: SubjectAverage[]): SubjectAverage[] => {
    const scored = list.map((s) => {
      const score =
        (s.avg_attendance * 0.35) +
        (s.avg_assignment * 0.25) +
        (s.avg_quiz * 0.25) +
        (s.avg_class_interaction * 0.1) -
        (s.avg_stress_index * 0.05) -
        (s.avg_social_media_hours * 0.5);
      const hasActivity = [
        s.avg_attendance,
        s.avg_assignment,
        s.avg_quiz,
        s.avg_stress_index,
        s.avg_social_media_hours,
        s.avg_travel_time,
        s.avg_class_interaction,
      ].some((v) => Number(v) > 0);
      return { data: s, score, hasActivity };
    });

    const active = scored.filter((s) => s.hasActivity).sort((a, b) => b.score - a.score);
    const fallback = scored.sort((a, b) => b.score - a.score);
    const base = active.length > 0 ? active : fallback;
    return base.slice(0, 6).map((s) => s.data);
  };
  const mapStudentRow = (row: any): StudentData => {
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
      student_id: row.student_code || row.student_id,
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
      last_updated: row.last_updated || row.last_performance_update || row.updated_at || row.created_at || new Date().toISOString(),
      subject_averages: row.subject_averages,
      assignments: row.assignments,
      quizzes: row.quizzes,
      attendance_records: row.attendance_records,
      stress_records: row.stress_records,
    };
  };

  const fetchStudentData = useCallback(async (identifier: string): Promise<StudentData & {
    subject_averages?: SubjectAverage[];
    assignments?: AssignmentItem[];
    quizzes?: QuizItem[];
    attendance_records?: AttendanceItem[];
    stress_records?: StressItem[];
  } | null> => {
    try {
      // Resolve the student row by either student_id or user_id
      const { data: studentRow } = await supabase
        .from('students')
        .select('*')
        .or(`student_id.eq.${identifier},user_id.eq.${identifier}`)
        .maybeSingle();

      const studentKey = studentRow?.id || studentRow?.student_id || identifier;

      const [{ data: perfRow }, { data: subjAvgs }, { data: assignmentRows }, { data: quizRows }, { data: attendanceRows }, { data: stressRows }] = await Promise.all([
        supabase.from('v_student_overall').select('*').eq('student_id', studentKey).maybeSingle(),
        supabase.from('v_student_subject_averages').select('*').eq('student_id', studentKey),
        supabase
          .from('assignment_submissions')
          .select('assignment_number, marks_obtained, assignment_date, subject_id, subjects!inner(code,name)')
          .eq('student_id', studentKey)
          .order('assignment_number'),
        supabase
          .from('quiz_results')
          .select('quiz_number, marks_obtained, quiz_date, subject_id, subjects!inner(code,name)')
          .eq('student_id', studentKey)
          .order('quiz_number'),
        supabase
          .from('weekly_attendance')
          .select('week_number, academic_year, attendance_percentage, subject_id, subjects!left(code,name)')
          .eq('student_id', studentKey)
          .order('week_number'),
        supabase
          .from('weekly_stress')
          .select('week_number, academic_year, stress_index, social_media_hours, travel_time_minutes')
          .eq('student_id', studentKey)
          .order('week_number'),
      ]);

      // If no performance data and no base row, bail
      if (!studentRow && !perfRow) return null;

      const merged = mapStudentRow({ ...studentRow, ...perfRow });

      const subject_averages = (subjAvgs || []).map((r) => ({
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

      const assignments = (assignmentRows || []).map((r) => ({
        subject_id: r.subject_id,
        subject_code: r.subjects?.code || '',
        subject_name: r.subjects?.name || '',
        assignment_number: r.assignment_number,
        marks_obtained: Number(r.marks_obtained) || 0,
        assignment_date: r.assignment_date,
      }));

      const quizzes = (quizRows || []).map((r) => ({
        subject_id: r.subject_id,
        subject_code: r.subjects?.code || '',
        subject_name: r.subjects?.name || '',
        quiz_number: r.quiz_number,
        marks_obtained: Number(r.marks_obtained) || 0,
        quiz_date: r.quiz_date,
      }));

      const attendance_records = (attendanceRows || []).map((r) => ({
        subject_id: r.subject_id,
        subject_code: r.subjects?.code || '',
        subject_name: r.subjects?.name || '',
        week_number: r.week_number,
        academic_year: r.academic_year,
        attendance_percentage: Number(r.attendance_percentage) || 0,
      }));

      const stress_records = (stressRows || []).map((r) => ({
        week_number: r.week_number,
        academic_year: r.academic_year,
        stress_index: Number(r.stress_index) || 0,
        social_media_hours: Number(r.social_media_hours) || 0,
        travel_time_minutes: Number(r.travel_time_minutes) || 0,
      }));

      return {
        ...merged,
        subject_averages,
        assignments,
        quizzes,
        attendance_records,
        stress_records,
      };
    } catch (err) {
      console.error('Failed to fetch student data for identifier', identifier, err);
      return null;
    }
  }, [mapStudentRow]);

  const loadCurrentUser = useCallback(async () => {
    console.log('[DEBUG loadCurrentUser] Starting...');
    const cached = localStorage.getItem('currentUser');
    console.log('[DEBUG loadCurrentUser] Cached data from localStorage:', cached ? 'EXISTS' : 'MISSING');
    if (!cached) {
      console.log('[DEBUG loadCurrentUser] No cached user, returning early');
      return;
    }
    const parsed = JSON.parse(cached);
    console.log('[DEBUG loadCurrentUser] Parsed cached user:', { id: parsed.id, role: parsed.role, department: parsed.department });

    try {
      setIsLoading(true);
      console.log('[DEBUG loadCurrentUser] Set isLoading=true');

      // First, ensure we have a valid Supabase session
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      console.log('[DEBUG loadCurrentUser] Session check:', { hasSession: !!session, hasError: !!sessionErr });
      
      if (sessionErr || !session) {
        console.log('[DEBUG] No valid Supabase session, using cached data from localStorage');
        // Session is invalid: use cached data for faculty/admin, attempt direct fetch for students
        if (parsed.role === 'faculty' || parsed.role === 'admin') {
          const canonicalDept = canonicalDepartment(parsed.department) || 'N/A';
          const userObj = {
            student_id: parsed.id,
            name: parsed.full_name || 'User',
            email: parsed.email,
            department: canonicalDept,
            semester: 'N/A',
            attendance: 0,
            avg_assignment: 0,
            avg_quiz: 0,
            stress_index: 0,
            social_media_hours: 0,
            travel_time: 0,
            class_interaction: 0,
            score: 0,
            risk_level: '',
            prediction: '',
            role: parsed.role,
            last_updated: new Date().toISOString(),
          };
          console.log('[DEBUG loadCurrentUser] Setting faculty user from cache:', userObj);
          setCurrentUser(userObj);
          console.log(`[DEBUG] Faculty loaded from cache: dept="${canonicalDept}"`);
        } else if (parsed.role === 'student') {
          const studentData = await fetchStudentData(parsed.id);
          if (studentData) {
            setCurrentUser({ ...studentData, role: 'student' });
          } else {
            console.warn('[DEBUG] No session and unable to hydrate student data from cache identifier');
            setCurrentUser(null);
          }
        }
        return;
      }

      console.log('[DEBUG] Valid session found for user:', session.user.id);

      // Students: fetch aggregated profile even if no per-user session link is present
      if (parsed.role === 'student') {
        // Try using cached id first; fallback to profile.student_id if it exists later
        let studentData = await fetchStudentData(parsed.id);

        if (!studentData && parsed.student_id) {
          studentData = await fetchStudentData(parsed.student_id);
        }

        if (!studentData) {
          console.warn('[DEBUG] Could not hydrate student data; check student_id/user_id linkage');
          setCurrentUser(null);
        } else {
          setCurrentUser({ ...studentData, role: 'student' });
        }
      }

      // Faculty/Admin: set minimal identity
      if (parsed.role === 'faculty' || parsed.role === 'admin') {
        // Use department from localStorage (which was populated during login)
        // If not present, try to fetch from database
        let effectiveDept = parsed.department || '';
        
        if (!effectiveDept) {
          // Fallback: try to fetch from profiles if not in localStorage
          const { data: profile } = await supabase
            .from('profiles')
            .select('department')
            .eq('id', parsed.id)
            .maybeSingle();
          effectiveDept = profile?.department || '';
        }

        const effectiveRole: AppRole = parsed.role;
        const canonicalDept = canonicalDepartment(effectiveDept) || 'N/A';
        console.log(`[DEBUG] Faculty dept from localStorage="${parsed.department}", canonical="${canonicalDept}"`);

        setCurrentUser({
          student_id: parsed.id,
          name: parsed.full_name || 'User',
          email: parsed.email,
          department: canonicalDept,
          semester: 'N/A',
          attendance: 0,
          avg_assignment: 0,
          avg_quiz: 0,
          stress_index: 0,
          social_media_hours: 0,
          travel_time: 0,
          class_interaction: 0,
          score: 0,
          risk_level: '',
          prediction: '',
          role: effectiveRole,
          last_updated: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to load current user', err);
    } finally {
      console.log('[DEBUG loadCurrentUser] Setting isLoading=false');
      setIsLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('v_student_overall')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map(mapStudentRow);
      setStudents(mapped);
    } catch (err) {
      console.error('Failed to load students', err);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    console.log('[DEBUG useEffect] StudentProvider mounted, calling loadCurrentUser and loadStudents');
    loadCurrentUser();
    loadStudents();
  }, [loadCurrentUser, loadStudents]);

  const login = useCallback(async (_studentId: string): Promise<{ success: boolean; role?: AppRole }> => {
    toast.error('Login via Supabase auth only.');
    return { success: false };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.info('Logged out successfully');
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([loadCurrentUser(), loadStudents()]);
    toast.success('Data refreshed');
  }, [loadCurrentUser, loadStudents]);

  const getAllStudents = useCallback((): StudentData[] => {
    return students;
  }, [students]);

  const getStudentById = useCallback((studentId: string): StudentData | null => {
    return students.find(s => s.student_id === studentId) || null;
  }, [students]);

  const updateStudentData = useCallback((_studentId: string, _data: Partial<StudentData>): boolean => {
    toast.error('Student updates must be done by faculty via Supabase');
    return false;
  }, []);

  const addFacultyNote = useCallback(async (studentId: string, note: string): Promise<boolean> => {
    if (!currentUser) return false;

    const newNote: FacultyNote = {
      id: `note_${Date.now()}`,
      student_id: studentId,
      faculty_id: currentUser.student_id,
      note,
      created_at: new Date().toISOString(),
    };

    facultyNotes.unshift(newNote);
    toast.success('Note saved successfully');
    return true;
  }, [currentUser]);

  const getFacultyNotes = useCallback((studentId: string): FacultyNote[] => {
    return facultyNotes.filter(n => n.student_id === studentId);
  }, []);

  return (
    <StudentContext.Provider value={{
      currentUser,
      student: currentUser, // Alias for compatibility
      isLoading,
      isFaculty,
      isAdmin,
      login,
      logout,
      refreshData,
      getAllStudents,
      getStudentById,
      updateStudentData,
      addFacultyNote,
      getFacultyNotes,
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
