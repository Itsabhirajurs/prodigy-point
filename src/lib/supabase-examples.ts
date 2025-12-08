import { supabase } from "@/lib/supabaseClient";
import type { Database, Tables } from "@/integrations/supabase/types";

/**
 * EXAMPLE USAGE PATTERNS
 * This file shows how to use the comprehensive Supabase schema
 */

// ============================================================================
// 1. AUTHENTICATION & PROFILE MANAGEMENT
// ============================================================================

/**
 * Sign up a new student
 */
export async function signUpStudent(
  email: string,
  password: string,
  fullName: string,
  studentId: string,
  department: string,
  semester: number
) {
  try {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Step 2: Create profile
    const userId = authData.user?.id;
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          id: userId,
          full_name: fullName,
          email,
          student_id: studentId,
          department,
          semester,
          role: "student",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, user: data };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error };
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return profile;
}

/**
 * Promote user to faculty/admin
 */
export async function promoteUserToRole(
  userId: string,
  role: "faculty" | "admin"
) {
  // Only admins can do this
  const { data, error } = await supabase
    .from("user_roles")
    .insert([
      {
        user_id: userId,
        role,
        assigned_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  // Update profile role
  await supabase.from("profiles").update({ role }).eq("id", userId);

  return data;
}

// ============================================================================
// 2. STUDENT PERFORMANCE TRACKING
// ============================================================================

/**
 * Update student performance metrics
 */
export async function updateStudentPerformance(
  studentId: string,
  metrics: {
    attendance?: number;
    avg_assignment?: number;
    avg_quiz?: number;
    class_interaction?: number;
    stress_index?: number;
    social_media_hours?: number;
    travel_time?: number;
    calculated_score?: number;
    risk_level?: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
    prediction?: string;
  }
) {
  const { data, error } = await supabase
    .from("student_performance")
    .upsert(
      {
        student_id: studentId,
        last_updated: new Date().toISOString(),
        ...metrics,
      },
      { onConflict: "student_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get student performance overview
 */
export async function getStudentPerformance(studentId: string) {
  const { data, error } = await supabase
    .from("student_performance")
    .select("*")
    .eq("student_id", studentId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

/**
 * Get all at-risk students (admin/faculty only)
 */
export async function getAtRiskStudents() {
  const { data, error } = await supabase
    .from("student_performance")
    .select(
      `
      *,
      profiles:student_id (id, full_name, email, department)
    `
    )
    .in("risk_level", ["High Risk", "Critical Risk"])
    .order("risk_level", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================================
// 3. ATTENDANCE MANAGEMENT
// ============================================================================

/**
 * Mark student attendance
 */
export async function markAttendance(
  studentId: string,
  attendanceDate: string,
  status: "Present" | "Absent" | "Late" | "Excused",
  subject: string,
  classDuration?: number
) {
  const { data, error } = await supabase
    .from("attendance_records")
    .upsert(
      {
        student_id: studentId,
        attendance_date: attendanceDate,
        status,
        subject,
        class_duration: classDuration,
        marked_by: (await supabase.auth.getUser()).data.user?.id,
      },
      { onConflict: "student_id,attendance_date,subject" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get attendance summary for a student
 */
export async function getAttendanceSummary(studentId: string, days: number = 30) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("student_id", studentId)
    .gte("attendance_date", fromDate.toISOString().split("T")[0])
    .order("attendance_date", { ascending: false });

  if (error) throw error;

  // Calculate statistics
  const stats = {
    present: data.filter((r) => r.status === "Present").length,
    absent: data.filter((r) => r.status === "Absent").length,
    late: data.filter((r) => r.status === "Late").length,
    excused: data.filter((r) => r.status === "Excused").length,
    total: data.length,
    percentage:
      data.length > 0
        ? ((data.filter((r) => r.status === "Present").length / data.length) *
            100).toFixed(2)
        : 0,
  };

  return { records: data, stats };
}

// ============================================================================
// 4. ASSIGNMENT TRACKING
// ============================================================================

/**
 * Submit or create assignment record
 */
export async function submitAssignment(
  studentId: string,
  assignmentId: string,
  assignmentName: string,
  subject: string,
  assignmentDate: string,
  dueDate: string,
  score?: number,
  totalPoints?: number
) {
  const now = new Date().toISOString();
  const isLate = new Date(now) > new Date(dueDate);

  const { data, error } = await supabase
    .from("assignment_submissions")
    .upsert(
      {
        student_id: studentId,
        assignment_id: assignmentId,
        assignment_name: assignmentName,
        subject,
        assignment_date: assignmentDate,
        due_date: dueDate,
        submission_date: now,
        score,
        total_points: totalPoints,
        submitted: true,
        late: isLate,
      },
      { onConflict: "student_id,assignment_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Grade an assignment
 */
export async function gradeAssignment(
  submissionId: string,
  score: number,
  totalPoints: number,
  feedback: string
) {
  const { data, error } = await supabase
    .from("assignment_submissions")
    .update({
      score,
      total_points: totalPoints,
      feedback,
      graded_by: (await supabase.auth.getUser()).data.user?.id,
      graded_date: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get assignment performance summary
 */
export async function getAssignmentPerformance(studentId: string) {
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select("*")
    .eq("student_id", studentId)
    .eq("submitted", true)
    .order("due_date", { ascending: false });

  if (error) throw error;

  const stats = {
    total: data.length,
    submitted: data.filter((a) => a.submitted).length,
    late: data.filter((a) => a.late).length,
    average:
      data.length > 0
        ? (
            data.reduce((sum, a) => sum + (a.percentage || 0), 0) / data.length
          ).toFixed(2)
        : 0,
  };

  return { submissions: data, stats };
}

// ============================================================================
// 5. QUIZ RESULTS
// ============================================================================

/**
 * Record quiz result
 */
export async function recordQuizResult(
  studentId: string,
  quizId: string,
  quizName: string,
  subject: string,
  quizDate: string,
  score: number,
  totalPoints: number,
  correctAnswers: number,
  timeSpent?: number
) {
  const { data, error } = await supabase
    .from("quiz_results")
    .insert([
      {
        student_id: studentId,
        quiz_id: quizId,
        quiz_name: quizName,
        subject,
        quiz_date: quizDate,
        score,
        total_points: totalPoints,
        correct_answers: correctAnswers,
        time_spent: timeSpent,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get quiz performance summary
 */
export async function getQuizPerformance(studentId: string) {
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("student_id", studentId)
    .order("quiz_date", { ascending: false });

  if (error) throw error;

  const stats = {
    total: data.length,
    average:
      data.length > 0
        ? (
            data.reduce((sum, q) => sum + (q.percentage || 0), 0) / data.length
          ).toFixed(2)
        : 0,
    avgTime:
      data.length > 0
        ? (
            data.reduce((sum, q) => sum + (q.time_spent || 0), 0) / data.length
          ).toFixed(2)
        : 0,
  };

  return { results: data, stats };
}

// ============================================================================
// 6. STRESS & MENTAL HEALTH TRACKING
// ============================================================================

/**
 * Record stress assessment
 */
export async function recordStressAssessment(
  studentId: string,
  assessmentDate: string,
  stressScore: number,
  sleepHours?: number,
  exerciseFrequency?: number,
  socialEngagement?: number,
  academicPressure?: number,
  personalIssues?: number
) {
  const { data, error } = await supabase
    .from("stress_indicators")
    .insert([
      {
        student_id: studentId,
        stress_score: stressScore,
        sleep_hours: sleepHours,
        exercise_frequency: exerciseFrequency,
        social_engagement: socialEngagement,
        academic_pressure: academicPressure,
        personal_issues: personalIssues,
        assessment_date: assessmentDate,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get stress trend
 */
export async function getStressTrend(studentId: string, days: number = 90) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const { data, error } = await supabase
    .from("stress_indicators")
    .select("*")
    .eq("student_id", studentId)
    .gte("assessment_date", fromDate.toISOString().split("T")[0])
    .order("assessment_date", { ascending: true });

  if (error) throw error;
  return data;
}

// ============================================================================
// 7. SOCIAL MEDIA TRACKING
// ============================================================================

/**
 * Log social media usage
 */
export async function logSocialMediaUsage(
  studentId: string,
  trackingDate: string,
  hoursSpent: number,
  sessionsCount?: number,
  platforms?: string[],
  impactOnStudies?: number
) {
  const { data, error } = await supabase
    .from("social_media_engagement")
    .upsert(
      {
        student_id: studentId,
        tracking_date: trackingDate,
        hours_spent: hoursSpent,
        sessions_count: sessionsCount,
        platforms,
        impact_on_studies: impactOnStudies,
      },
      { onConflict: "student_id,tracking_date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// 8. RISK ASSESSMENTS
// ============================================================================

/**
 * Create risk assessment
 */
export async function createRiskAssessment(
  studentId: string,
  riskLevel: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk",
  riskScore: number,
  recommendedAction: string,
  interventionPlan?: string,
  followUpDate?: string
) {
  const { data, error } = await supabase
    .from("risk_assessments")
    .insert([
      {
        student_id: studentId,
        assessment_date: new Date().toISOString(),
        risk_level: riskLevel,
        risk_score: riskScore,
        recommended_action: recommendedAction,
        intervention_plan: interventionPlan,
        follow_up_date: followUpDate,
        assessed_by: (await supabase.auth.getUser()).data.user?.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get risk assessment history
 */
export async function getRiskAssessmentHistory(studentId: string) {
  const { data, error } = await supabase
    .from("risk_assessments")
    .select("*")
    .eq("student_id", studentId)
    .order("assessment_date", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================================
// 9. FACULTY NOTES
// ============================================================================

/**
 * Add faculty note
 */
export async function addFacultyNote(
  studentId: string,
  note: string,
  noteType?: "Observation" | "Concern" | "Positive" | "Intervention",
  subject?: string,
  isConfidential: boolean = false
) {
  const { data, error } = await supabase
    .from("faculty_notes")
    .insert([
      {
        student_id: studentId,
        faculty_id: (await supabase.auth.getUser()).data.user?.id || "",
        note,
        note_type: noteType,
        subject,
        is_confidential: isConfidential,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get notes for a student
 */
export async function getStudentNotes(studentId: string) {
  const { data, error } = await supabase
    .from("faculty_notes")
    .select(
      `
      *,
      faculty:faculty_id (id, full_name, email)
    `
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================================
// 10. COMMUNICATIONS
// ============================================================================

/**
 * Send message
 */
export async function sendMessage(
  recipientId: string,
  message: string,
  subject?: string,
  messageType?: "Alert" | "Notification" | "Support" | "Feedback"
) {
  const { data, error } = await supabase
    .from("communications")
    .insert([
      {
        sender_id: (await supabase.auth.getUser()).data.user?.id || "",
        recipient_id: recipientId,
        subject,
        message,
        message_type: messageType,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get inbox messages
 */
export async function getInboxMessages() {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("communications")
    .select(
      `
      *,
      sender:sender_id (id, full_name, email)
    `
    )
    .eq("recipient_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string) {
  const { data, error } = await supabase
    .from("communications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
