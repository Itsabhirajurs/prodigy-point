import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  last_updated: string;
  role?: string;
}

export interface FacultyNote {
  id: string;
  student_id: string;
  faculty_id: string;
  note: string;
  created_at: string;
}

interface StudentContextType {
  student: StudentData | null;
  isLoading: boolean;
  isFaculty: boolean;
  login: (studentId: string) => Promise<{ success: boolean; role: string }>;
  logout: () => void;
  refreshData: () => Promise<void>;
  getAllStudents: () => Promise<StudentData[]>;
  getStudentById: (studentId: string) => Promise<StudentData | null>;
  addFacultyNote: (studentId: string, note: string) => Promise<boolean>;
  getFacultyNotes: (studentId: string) => Promise<FacultyNote[]>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

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

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFaculty, setIsFaculty] = useState(false);

  const updateStudentScores = useCallback(async (studentData: StudentData) => {
    const score = calculateScore(studentData);
    const risk_level = calculateRiskLevel(score);
    const prediction = calculatePrediction(studentData);

    if (
      Math.abs((studentData.score || 0) - score) > 0.01 ||
      studentData.risk_level !== risk_level ||
      studentData.prediction !== prediction
    ) {
      const { error } = await supabase
        .from('student_data')
        .update({
          score,
          risk_level,
          prediction,
          last_updated: new Date().toISOString(),
        })
        .eq('student_id', studentData.student_id);

      if (error) {
        console.error('Error updating scores:', error);
        return { ...studentData, score, risk_level, prediction };
      }

      return { ...studentData, score, risk_level, prediction, last_updated: new Date().toISOString() };
    }

    return studentData;
  }, []);

  const login = useCallback(async (studentId: string): Promise<{ success: boolean; role: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_data')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) {
        toast.error('Error fetching data');
        return { success: false, role: '' };
      }

      if (!data) {
        toast.error('ID not found');
        return { success: false, role: '' };
      }

      const role = data.role || 'student';
      setIsFaculty(role === 'faculty');

      const updatedStudent = await updateStudentScores(data as StudentData);
      setStudent(updatedStudent);
      toast.success(`Welcome, ${updatedStudent.name}!`);
      return { success: true, role };
    } catch (err) {
      toast.error('An error occurred');
      return { success: false, role: '' };
    } finally {
      setIsLoading(false);
    }
  }, [updateStudentScores]);

  const logout = useCallback(() => {
    setStudent(null);
    setIsFaculty(false);
    toast.info('Logged out successfully');
  }, []);

  const refreshData = useCallback(async () => {
    if (!student) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_data')
        .select('*')
        .eq('student_id', student.student_id)
        .maybeSingle();

      if (error || !data) {
        toast.error('Error refreshing data');
        return;
      }

      const updatedStudent = await updateStudentScores(data as StudentData);
      setStudent(updatedStudent);
      toast.success('Data refreshed successfully');
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [student, updateStudentScores]);

  const getAllStudents = useCallback(async (): Promise<StudentData[]> => {
    const { data, error } = await supabase
      .from('student_data')
      .select('*')
      .eq('role', 'student')
      .order('name');

    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }

    return (data || []) as StudentData[];
  }, []);

  const getStudentById = useCallback(async (studentId: string): Promise<StudentData | null> => {
    const { data, error } = await supabase
      .from('student_data')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error || !data) return null;
    return data as StudentData;
  }, []);

  const addFacultyNote = useCallback(async (studentId: string, note: string): Promise<boolean> => {
    if (!student) return false;

    const { error } = await supabase
      .from('faculty_notes')
      .insert({
        student_id: studentId,
        faculty_id: student.student_id,
        note,
      });

    if (error) {
      toast.error('Error saving note');
      return false;
    }

    toast.success('Note saved successfully');
    return true;
  }, [student]);

  const getFacultyNotes = useCallback(async (studentId: string): Promise<FacultyNote[]> => {
    const { data, error } = await supabase
      .from('faculty_notes')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }

    return (data || []) as FacultyNote[];
  }, []);

  return (
    <StudentContext.Provider value={{ 
      student, 
      isLoading, 
      isFaculty,
      login, 
      logout, 
      refreshData,
      getAllStudents,
      getStudentById,
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
