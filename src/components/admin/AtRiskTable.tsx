import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentData } from '@/context/StudentContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageSquare } from 'lucide-react';

interface AtRiskTableProps {
  students: StudentData[];
  onMessageStudent?: (studentId: string) => void;
}

export const AtRiskTable: React.FC<AtRiskTableProps> = ({ students, onMessageStudent }) => {
  const navigate = useNavigate();

  const handleMessage = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessageStudent) {
      onMessageStudent(studentId);
    } else {
      navigate('/admin/messages', { state: { studentId } });
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No at-risk students found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <div
          key={student.student_id}
          className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-card to-card/50 border border-border/50 hover:border-destructive/50 cursor-pointer transition-all duration-300 card-hover card-shadow-lg animate-slide-up"
          onClick={() => navigate(`/admin/student/${student.student_id}`)}
        >
          {/* Decorative gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-sm">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate text-lg">{student.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{student.department}</span>
                    <span>•</span>
                    <span>Sem {student.semester}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Score</p>
                <p className={`text-2xl font-bold ${(student.score || 0) < 50 ? 'text-destructive' : 'text-primary'}`}>
                  {(student.score || 0).toFixed(1)}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Badge variant="destruct" className="w-fit text-xs font-bold px-3 py-1">
                  🚨 {student.risk_level}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-primary/10"
                    onClick={(e) => handleMessage(student.id || student.student_id, e)}
                    title="Send message"
                  >
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-accent/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/student/${student.student_id}`);
                    }}
                    title="View details"
                  >
                    <Eye className="w-4 h-4 text-accent" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
