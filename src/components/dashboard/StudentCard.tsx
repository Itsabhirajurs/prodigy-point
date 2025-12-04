import React from 'react';
import { GraduationCap, Building2, Calendar } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';

export const StudentCard: React.FC = () => {
  const { student } = useStudent();

  if (!student) return null;

  return (
    <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
          {student.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
          <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>{student.department}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{student.semester}</span>
        </div>
      </div>
    </div>
  );
};
