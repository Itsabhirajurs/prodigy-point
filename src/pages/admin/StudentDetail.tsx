import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Calendar, FileText, Brain, Heart, Building2 } from 'lucide-react';
import { useStudent, StudentData, FacultyNote } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RiskCard } from '@/components/dashboard/RiskCard';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { AssignmentChart } from '@/components/charts/AssignmentChart';
import { QuizChart } from '@/components/charts/QuizChart';
import { StressChart } from '@/components/charts/StressChart';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';

const StudentDetail: React.FC = () => {
  const { student_id } = useParams<{ student_id: string }>();
  const { getStudentById, addFacultyNote, getFacultyNotes } = useStudent();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [notes, setNotes] = useState<FacultyNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!student_id) return;
      setIsLoading(true);
      const [student, fetchedNotes] = await Promise.all([
        getStudentById(student_id),
        getFacultyNotes(student_id),
      ]);
      setStudentData(student);
      setNotes(fetchedNotes);
      setIsLoading(false);
    };
    fetchData();
  }, [student_id, getStudentById, getFacultyNotes]);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !student_id) return;
    setIsSaving(true);
    const success = await addFacultyNote(student_id, newNote.trim());
    if (success) {
      const updatedNotes = await getFacultyNotes(student_id);
      setNotes(updatedNotes);
      setNewNote('');
    }
    setIsSaving(false);
  };

  const sendMotivation = () => {
    if (studentData) {
      toast.success(`Motivation message sent to ${studentData.name}!`);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!studentData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={() => navigate('/admin/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{studentData.name}</h1>
          <p className="text-muted-foreground">{studentData.student_id} • {studentData.department}</p>
        </div>
        {studentData.risk_level === 'High Risk' && (
          <Button onClick={sendMotivation} className="gap-2">
            <Send className="w-4 h-4" />
            Send Motivation
          </Button>
        )}
      </div>

      {/* Student Overview Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {studentData.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">{studentData.name}</h2>
            <p className="text-sm text-muted-foreground">ID: {studentData.student_id}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>{studentData.department}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{studentData.semester}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Attendance"
          value={`${studentData.attendance}%`}
          icon={Calendar}
          variant={studentData.attendance >= 80 ? 'success' : studentData.attendance >= 60 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Avg Assignment"
          value={studentData.avg_assignment}
          icon={FileText}
          variant={studentData.avg_assignment >= 70 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Avg Quiz"
          value={studentData.avg_quiz}
          icon={Brain}
          variant={studentData.avg_quiz >= 70 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Stress Index"
          value={studentData.stress_index}
          icon={Heart}
          variant={studentData.stress_index > 70 ? 'danger' : 'success'}
        />
      </div>

      {/* Risk Card */}
      <RiskCard
        score={studentData.score || 0}
        riskLevel={studentData.risk_level}
        prediction={studentData.prediction}
      />

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <AttendanceChart currentValue={studentData.attendance} />
        <AssignmentChart currentValue={studentData.avg_assignment} />
        <QuizChart currentValue={studentData.avg_quiz} />
        <StressChart currentValue={studentData.stress_index} />
      </div>

      {/* Faculty Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note about this student..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleSaveNote} 
              disabled={!newNote.trim() || isSaving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>

          {notes.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-foreground">Previous Notes</h4>
              {notes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-sm text-foreground">{note.note}</p>
                  <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                    <span>By: {note.faculty_id}</span>
                    <span>•</span>
                    <span>{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {notes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notes yet for this student
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetail;
