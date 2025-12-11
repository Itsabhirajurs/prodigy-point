import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const SyncData: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSyncAll = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Get all students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, student_id, full_name, semester');

      if (studentsError) throw studentsError;
      if (!students || students.length === 0) {
        setResult({ success: false, message: 'No students found' });
        return;
      }

      console.log(`[SyncData] Found ${students.length} students to sync`);
      let successCount = 0;
      let errorCount = 0;

      // Process each student
      for (const student of students) {
        try {
          // Fetch all detailed data for this student
          const { data: attData } = await supabase
            .from('weekly_attendance')
            .select('attendance_percentage')
            .eq('student_id', student.id);
          
          const { data: assignData } = await supabase
            .from('assignment_submissions')
            .select('marks_obtained')
            .eq('student_id', student.id);
          
          const { data: quizData } = await supabase
            .from('quiz_results')
            .select('marks_obtained')
            .eq('student_id', student.id);
          
          const { data: stressData } = await supabase
            .from('weekly_stress')
            .select('stress_index, social_media_hours, travel_time_minutes')
            .eq('student_id', student.id);
          
          const { data: interactionData } = await supabase
            .from('class_interactions')
            .select('interaction_score')
            .eq('student_id', student.id);

          // Calculate averages
          const avgAttendance = attData && attData.length > 0 
            ? attData.reduce((sum, d) => sum + (d.attendance_percentage || 0), 0) / attData.length 
            : 0;
          
          const avgAssignment = assignData && assignData.length > 0
            ? assignData.reduce((sum, d) => sum + (d.marks_obtained || 0), 0) / assignData.length
            : 0;
          
          const avgQuiz = quizData && quizData.length > 0
            ? quizData.reduce((sum, d) => sum + (d.marks_obtained || 0), 0) / quizData.length
            : 0;
          
          const avgStress = stressData && stressData.length > 0
            ? stressData.reduce((sum, d) => sum + (d.stress_index || 0), 0) / stressData.length
            : 0;
          
          const avgSocialMedia = stressData && stressData.length > 0
            ? stressData.reduce((sum, d) => sum + (d.social_media_hours || 0), 0) / stressData.length
            : 0;
          
          const avgTravelTime = stressData && stressData.length > 0
            ? stressData.reduce((sum, d) => sum + (d.travel_time_minutes || 0), 0) / stressData.length
            : 0;
          
          const avgInteraction = interactionData && interactionData.length > 0
            ? interactionData.reduce((sum, d) => sum + (d.interaction_score || 0), 0) / interactionData.length
            : 0;

          // Calculate score and risk level
          const score = (
            (avgAttendance * 0.20) +
            (avgAssignment * 0.25) +
            (avgQuiz * 0.25) +
            ((100 - Math.min(avgStress, 100)) * 0.15) +
            ((10 - Math.min(avgSocialMedia, 10)) * 10 * 0.10) +
            (avgInteraction * 0.05)
          );

          const riskLevel = score >= 70 ? 'Low Risk' : score >= 50 ? 'Medium Risk' : 'High Risk';

          // Upsert to student_performance
          const { error: perfError } = await supabase
            .from('student_performance')
            .upsert({
              student_id: student.id,
              semester: student.semester,
              academic_year: new Date().getFullYear().toString(),
              attendance: avgAttendance,
              avg_assignment: avgAssignment,
              avg_quiz: avgQuiz,
              stress_index: avgStress,
              social_media_hours: avgSocialMedia,
              travel_time: avgTravelTime,
              class_interaction: avgInteraction,
              score: score,
              risk_level: riskLevel,
              updated_at: new Date().toISOString(),
            }, { 
              onConflict: 'student_id,semester,academic_year' 
            });

          if (perfError) {
            console.error(`[SyncData] Error for student ${student.student_id}:`, perfError);
            errorCount++;
          } else {
            console.log(`[SyncData] Synced ${student.student_id} - ${student.full_name}`);
            successCount++;
          }
        } catch (err) {
          console.error(`[SyncData] Error processing student ${student.student_id}:`, err);
          errorCount++;
        }
      }

      const message = `Successfully synced ${successCount} students. ${errorCount > 0 ? `${errorCount} errors.` : ''}`;
      setResult({ success: errorCount === 0, message });
      toast.success(message);

    } catch (err: any) {
      console.error('[SyncData] Error:', err);
      const message = err.message || 'Failed to sync data';
      setResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Sync Performance Data
          </CardTitle>
          <CardDescription>
            Aggregate detailed performance data to faculty dashboard summary table
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This will calculate averages from detailed performance tables (attendance, assignments, 
              quizzes, stress) and update the student_performance summary table that faculty dashboards use.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleSyncAll} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync All Students
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncData;
