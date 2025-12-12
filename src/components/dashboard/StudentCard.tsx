import React from 'react';
import { GraduationCap, Building2, Calendar } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';

export const StudentCard: React.FC = () => {
  const { student } = useStudent();

  if (!student) return null;

  return (
    <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 rounded-2xl p-6 card-shadow animate-fade-in border-2 border-primary/30 hover:border-primary/60 transition-all duration-300 hover:shadow-neon-lg hover:scale-102 group">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:shadow-neon shadow-lg">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
          <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/10 rounded-lg p-3 transition-all duration-300 group-hover:bg-primary/20 group-hover:text-primary">
          <Building2 className="w-4 h-4" />
          <span>{student.department}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/10 rounded-lg p-3 transition-all duration-300 group-hover:bg-accent/20 group-hover:text-accent">
          <Calendar className="w-4 h-4" />
          <span>{student.semester}</span>
        </div>
      </div>
    </div>
  );
};
