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
    <div className="space-y-2">
      {students.map((student, index) => (
        <div
          key={student.student_id}
          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-102 hover:-translate-y-1 hover:shadow-neon-lg cursor-pointer border-2 border-transparent hover:border-destructive/40 group
            ${index % 2 === 0 
              ? 'bg-gradient-to-r from-card/80 via-destructive/5 to-card/90 hover:from-destructive/10' 
              : 'bg-gradient-to-r from-card/90 via-card to-destructive/5 hover:to-destructive/10'
            }
          `}
          onClick={() => navigate(`/admin/student/${student.student_id}`)}
        >
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate text-lg group-hover:text-destructive transition-colors">{student.name}</p>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="text-muted-foreground font-medium">{student.department}</span>
              <span className="text-muted-foreground">•</span>
              <span className={(student.score || 0) < 50 ? 'text-destructive font-bold text-base' : 'text-foreground font-semibold'}>
                Score: {(student.score || 0).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-base px-3 py-1">{student.risk_level}</Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 hover:bg-primary/20 hover:text-primary transition-all group-hover:scale-110"
              onClick={(e) => handleMessage(student.id || student.student_id, e)}
              title="Send message"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 hover:bg-accent/20 hover:text-accent transition-all group-hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/student/${student.student_id}`);
              }}
              title="View details"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
