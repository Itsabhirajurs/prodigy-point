-- ============================================
-- CREATE FUNCTION TO AGGREGATE STUDENT PERFORMANCE
-- Created: December 11, 2025
-- Purpose: Automatically aggregate detailed performance to summary table for a specific student
-- ============================================

CREATE OR REPLACE FUNCTION aggregate_student_performance(p_student_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Aggregate data from detailed tables to student_performance for the specified student
  INSERT INTO student_performance (
    student_id,
    attendance,
    avg_assignment,
    avg_quiz,
    stress_index,
    social_media_hours,
    travel_time,
    class_interaction,
    semester,
    academic_year,
    created_at,
    updated_at
  )
  SELECT 
    s.id as student_id,
    COALESCE(AVG(wa.attendance_percentage), 0) as attendance,
    COALESCE(AVG(a.marks_obtained), 0) as avg_assignment,
    COALESCE(AVG(q.marks_obtained), 0) as avg_quiz,
    COALESCE(AVG(ws.stress_index), 0) as stress_index,
    COALESCE(AVG(ws.social_media_hours), 0) as social_media_hours,
    COALESCE(AVG(ws.travel_time_minutes), 0) as travel_time,
    COALESCE(AVG(ci.interaction_score), 0) as class_interaction,
    s.semester,
    EXTRACT(YEAR FROM NOW())::TEXT as academic_year,
    NOW() as created_at,
    NOW() as updated_at
  FROM students s
  LEFT JOIN weekly_attendance wa ON s.id = wa.student_id
  LEFT JOIN assignment_submissions a ON s.id = a.student_id
  LEFT JOIN quiz_results q ON s.id = q.student_id
  LEFT JOIN weekly_stress ws ON s.id = ws.student_id
  LEFT JOIN class_interactions ci ON s.id = ci.student_id
  WHERE s.id = p_student_id
  GROUP BY s.id, s.semester
  ON CONFLICT (student_id, semester, academic_year) DO UPDATE SET
    attendance = EXCLUDED.attendance,
    avg_assignment = EXCLUDED.avg_assignment,
    avg_quiz = EXCLUDED.avg_quiz,
    stress_index = EXCLUDED.stress_index,
    social_media_hours = EXCLUDED.social_media_hours,
    travel_time = EXCLUDED.travel_time,
    class_interaction = EXCLUDED.class_interaction,
    updated_at = NOW();

  -- Calculate score and risk level
  UPDATE student_performance
  SET 
    score = (
      (attendance * 0.20) +
      (avg_assignment * 0.25) +
      (avg_quiz * 0.25) +
      ((100 - LEAST(stress_index, 100)) * 0.15) +
      ((10 - LEAST(social_media_hours, 10)) * 10 * 0.10) +
      (class_interaction * 0.05)
    ),
    risk_level = CASE
      WHEN (
        (attendance * 0.20) +
        (avg_assignment * 0.25) +
        (avg_quiz * 0.25) +
        ((100 - LEAST(stress_index, 100)) * 0.15) +
        ((10 - LEAST(social_media_hours, 10)) * 10 * 0.10) +
        (class_interaction * 0.05)
      ) >= 70 THEN 'Low Risk'
      WHEN (
        (attendance * 0.20) +
        (avg_assignment * 0.25) +
        (avg_quiz * 0.25) +
        ((100 - LEAST(stress_index, 100)) * 0.15) +
        ((10 - LEAST(social_media_hours, 10)) * 10 * 0.10) +
        (class_interaction * 0.05)
      ) >= 50 THEN 'Medium Risk'
      ELSE 'High Risk'
    END,
    updated_at = NOW()
  WHERE student_id = p_student_id
    AND semester = (SELECT semester FROM students WHERE id = p_student_id)
    AND academic_year = EXTRACT(YEAR FROM NOW())::TEXT;

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION aggregate_student_performance(UUID) TO authenticated;

-- ============================================
-- SUMMARY
-- ============================================
-- This migration creates a function that:
-- 1. ✓ Aggregates detailed performance data for a specific student
-- 2. ✓ Updates student_performance summary table
-- 3. ✓ Calculates score and risk level
-- 4. ✓ Can be called after saving detailed data
--
-- USAGE: SELECT aggregate_student_performance('student-uuid-here');
-- ============================================
