import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

export type AppRole = 'student' | 'faculty' | 'admin';

export interface StudentData {
  student_id: string;
  name: string;
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

// Demo data - students and faculty
const createDemoData = (): StudentData[] => {
  const students: StudentData[] = [
    {
      student_id: 'STU001',
      name: 'Alex Johnson',
      department: 'Computer Science',
      semester: '5th',
      attendance: 92,
      avg_assignment: 85,
      avg_quiz: 78,
      stress_index: 35,
      social_media_hours: 2.5,
      travel_time: 30,
      class_interaction: 8,
      score: 0,
      risk_level: '',
      prediction: '',
      role: 'student',
      last_updated: new Date().toISOString(),
    },
    {
      student_id: 'STU002',
      name: 'Sarah Williams',
      department: 'Computer Science',
      semester: '5th',
      attendance: 68,
      avg_assignment: 62,
      avg_quiz: 55,
      stress_index: 72,
      social_media_hours: 5.5,
      travel_time: 45,
      class_interaction: 3,
      score: 0,
      risk_level: '',
      prediction: '',
      role: 'student',
      last_updated: new Date().toISOString(),
    },
    {
      student_id: 'STU003',
      name: 'Michael Chen',
      department: 'Electronics',
      semester: '3rd',
      attendance: 88,
      avg_assignment: 91,
      avg_quiz: 89,
      stress_index: 28,
      social_media_hours: 1.5,
      travel_time: 20,
      class_interaction: 9,
      score: 0,
      risk_level: '',
      prediction: '',
      role: 'student',
      last_updated: new Date().toISOString(),
    },
    {
      student_id: 'STU004',
      name: 'Emily Davis',
      department: 'Mechanical',
      semester: '4th',
      attendance: 75,
      avg_assignment: 72,
      avg_quiz: 68,
      stress_index: 55,
      social_media_hours: 4,
      travel_time: 60,
      class_interaction: 5,
      score: 0,
      risk_level: '',
      prediction: '',
      role: 'student',
      last_updated: new Date().toISOString(),
    },
    {
      student_id: 'STU005',
      name: 'James Wilson',
      department: 'Civil',
      semester: '6th',
      attendance: 45,
      avg_assignment: 48,
      avg_quiz: 42,
      stress_index: 85,
      social_media_hours: 7,
      travel_time: 90,
      class_interaction: 2,
      score: 0,
      risk_level: '',
      prediction: '',
      role: 'student',
      last_updated: new Date().toISOString(),
    },
    {
      student_id: 'FAC001',
      name: 'Dr. Robert Smith',
      department: 'Computer Science',
      semester: 'N/A',
      attendance: 100,
      avg_assignment: 100,
      avg_quiz: 100,
      stress_index: 0,
      social_media_hours: 0,
      travel_time: 0,
      class_interaction: 10,
      score: 100,
      risk_level: 'Low Risk',
      prediction: 'On Track',
      role: 'faculty',
      last_updated: new Date().toISOString(),
    },
    {
      student_id: 'FAC002',
      name: 'Prof. Maria Garcia',
      department: 'Electronics',
      semester: 'N/A',
      attendance: 100,
      avg_assignment: 100,
      avg_quiz: 100,
      stress_index: 0,
      social_media_hours: 0,
      travel_time: 0,
      class_interaction: 10,
      score: 100,
      risk_level: 'Low Risk',
      prediction: 'On Track',
      role: 'admin',
      last_updated: new Date().toISOString(),
    },
  ];

  // Calculate scores for all students
  return students.map(student => {
    if (student.role !== 'student') return student;
    const score = calculateScore(student);
    return {
      ...student,
      score: Math.round(score * 100) / 100,
      risk_level: calculateRiskLevel(score),
      prediction: calculatePrediction(student),
    };
  });
};

// Initialize demo data
let demoData = createDemoData();
let facultyNotes: FacultyNote[] = [];

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isFaculty = currentUser?.role === 'faculty' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const login = useCallback(async (studentId: string): Promise<{ success: boolean; role?: AppRole }> => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = demoData.find(s => s.student_id === studentId);
    
    if (user) {
      setCurrentUser(user);
      toast.success(`Welcome, ${user.name}!`);
      setIsLoading(false);
      return { success: true, role: user.role };
    }
    
    toast.error('Invalid ID. Please try again.');
    setIsLoading(false);
    return { success: false };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    toast.info('Logged out successfully');
  }, []);

  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    
    const updated = demoData.find(s => s.student_id === currentUser.student_id);
    if (updated) {
      setCurrentUser(updated);
      toast.success('Data refreshed');
    }
  }, [currentUser]);

  const getAllStudents = useCallback((): StudentData[] => {
    return demoData.filter(s => s.role === 'student');
  }, []);

  const getStudentById = useCallback((studentId: string): StudentData | null => {
    return demoData.find(s => s.student_id === studentId) || null;
  }, []);

  const updateStudentData = useCallback((studentId: string, data: Partial<StudentData>): boolean => {
    const index = demoData.findIndex(s => s.student_id === studentId);
    if (index === -1) return false;

    const updated = { ...demoData[index], ...data };
    const score = calculateScore(updated);
    
    demoData[index] = {
      ...updated,
      score: Math.round(score * 100) / 100,
      risk_level: calculateRiskLevel(score),
      prediction: calculatePrediction(updated),
      last_updated: new Date().toISOString(),
    };

    // Update current user if it's the same
    if (currentUser?.student_id === studentId) {
      setCurrentUser(demoData[index]);
    }

    toast.success('Data updated successfully');
    return true;
  }, [currentUser]);

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
