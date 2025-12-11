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
      {students.map((student) => (
        <div
          key={student.student_id}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
          onClick={() => navigate(`/admin/student/${student.student_id}`)}
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{student.name}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{student.department}</span>
              <span className="text-muted-foreground">•</span>
              <span className={(student.score || 0) < 50 ? 'text-danger font-semibold' : 'text-foreground'}>
                Score: {(student.score || 0).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">{student.risk_level}</Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => handleMessage(student.id || student.student_id, e)}
              title="Send message"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/student/${student.student_id}`);
              }}
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
