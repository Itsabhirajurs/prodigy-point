-- ============================================
-- AGGREGATE DETAILED PERFORMANCE TO SUMMARY TABLE
-- Created: December 11, 2025
-- Purpose: Fill student_performance table from detailed performance tables
-- ============================================

-- ============================================
-- AGGREGATE DATA FROM DETAILED TABLES TO SUMMARY
-- ============================================

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
    '2025' as academic_year,
    NOW() as created_at,
    NOW() as updated_at
FROM students s
LEFT JOIN weekly_attendance wa ON s.id = wa.student_id
LEFT JOIN assignment_submissions a ON s.id = a.student_id
LEFT JOIN quiz_results q ON s.id = q.student_id
LEFT JOIN weekly_stress ws ON s.id = ws.student_id
LEFT JOIN class_interactions ci ON s.id = ci.student_id
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

-- ============================================
-- SUMMARY
-- ============================================
-- This migration:
-- 1. ✓ Aggregates all detailed performance data to student_performance table
-- 2. ✓ Handles ON CONFLICT to update if record exists
-- 3. ✓ Sets academic_year to 2025
--
-- RESULT: Faculty dashboard can now see all student data
-- ============================================
