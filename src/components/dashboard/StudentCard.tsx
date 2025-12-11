import React from 'react';
import { GraduationCap, Building2, Calendar } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';

export const StudentCard: React.FC = () => {
  const { student } = useStudent();

  if (!student) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 card-shadow-xl animate-slide-up border border-border/50 bg-gradient-to-br from-card via-card to-card/50">
      {/* Decorative gradient background */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-4xl font-bold text-primary-foreground shadow-lg">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground mb-1">{student.name}</h2>
              <p className="text-sm text-muted-foreground font-medium">Student ID: {student.student_id}</p>
            </div>
          </div>
          <GraduationCap className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect rounded-xl p-4 backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</span>
            </div>
            <p className="text-lg font-bold text-foreground">{student.department}</p>
          </div>
          <div className="glass-effect rounded-xl p-4 backdrop-blur">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Semester</span>
            </div>
            <p className="text-lg font-bold text-foreground">Sem {student.semester}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
