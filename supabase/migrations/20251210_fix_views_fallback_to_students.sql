-- Fix views to properly show data from student_performance table first, then aggregate from detail tables
-- If detail tables have data, use those aggregates; otherwise use student_performance table values

DROP VIEW IF EXISTS v_student_overall;
DROP VIEW IF EXISTS v_student_subject_averages;

CREATE OR REPLACE VIEW v_student_overall AS
SELECT
    s.id AS student_id,
    s.student_id AS student_code,
    s.full_name,
    s.email,
    s.department,
    s.semester,
    -- Attendance: use detail table avg if exists and > 0, otherwise use student_performance table
    CASE 
        WHEN COALESCE(AVG(wa.attendance_percentage), 0) > 0 THEN COALESCE(AVG(wa.attendance_percentage), 0)
        ELSE COALESCE(sp.attendance, 0)
    END AS attendance,
    -- Assignment: use detail table avg if exists and > 0, otherwise use student_performance table
    CASE 
        WHEN COALESCE(AVG(asub.marks_obtained), 0) > 0 THEN COALESCE(AVG(asub.marks_obtained), 0)
        ELSE COALESCE(sp.avg_assignment, 0)
    END AS avg_assignment,
    -- Quiz: use detail table avg if exists and > 0, otherwise use student_performance table
    CASE 
        WHEN COALESCE(AVG(q.marks_obtained), 0) > 0 THEN COALESCE(AVG(q.marks_obtained), 0)
        ELSE COALESCE(sp.avg_quiz, 0)
    END AS avg_quiz,
    -- Stress: use detail table avg if exists, otherwise use student_performance table
    COALESCE(AVG(ws.stress_index), sp.stress_index, 0) AS stress_index,
    -- Social media: use detail table avg if exists, otherwise use student_performance table
    COALESCE(AVG(ws.social_media_hours), sp.social_media_hours, 0) AS social_media_hours,
    -- Travel time: use detail table avg if exists, otherwise use student_performance table (convert from minutes if needed)
    COALESCE(AVG(ws.travel_time_minutes), sp.travel_time, 0) AS travel_time,
    -- Class interaction: use detail table avg if exists, otherwise use student_performance table
    COALESCE(AVG(ci.interaction_score), sp.class_interaction, 0) AS class_interaction,
    COALESCE(sp.score, 0) AS score,
    sp.risk_level AS risk_level,
    sp.prediction AS prediction,
    GREATEST(
        s.updated_at,
        COALESCE(sp.updated_at, 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM weekly_attendance WHERE student_id = s.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM assignment_submissions WHERE student_id = s.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM quiz_results WHERE student_id = s.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM weekly_stress WHERE student_id = s.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM class_interactions WHERE student_id = s.id), 'epoch'::timestamptz)
    ) AS last_updated
FROM students s
LEFT JOIN student_performance sp ON s.id = sp.student_id
LEFT JOIN weekly_attendance wa ON s.id = wa.student_id
LEFT JOIN assignment_submissions asub ON s.id = asub.student_id
LEFT JOIN quiz_results q ON s.id = q.student_id
LEFT JOIN weekly_stress ws ON s.id = ws.student_id
LEFT JOIN class_interactions ci ON s.id = ci.student_id
GROUP BY s.id, s.student_id, s.full_name, s.email, s.department, s.semester, sp.attendance, sp.avg_assignment, sp.avg_quiz, sp.stress_index, sp.social_media_hours, sp.travel_time, sp.class_interaction, sp.score, sp.risk_level, sp.prediction, s.updated_at, sp.updated_at;

-- For subject averages, filter attendance/assignments/quizzes by subject_id
-- Show 0 for subjects with no data; will update automatically when faculty adds data
-- Stress, social media, travel time, and interaction are general (not subject-specific)

CREATE OR REPLACE VIEW v_student_subject_averages AS
SELECT 
    s.id AS student_id,
    s.student_id AS student_code,
    s.full_name,
    s.email,
    s.department,
    s.semester,
    subj.id AS subject_id,
    subj.code AS subject_code,
    subj.name AS subject_name,
    subj.department AS subject_department,
    -- For subject-specific metrics, filter by subject_id and show 0 if no data
    -- Attendance: filter by subject_id
    COALESCE(AVG(wa.attendance_percentage) FILTER (WHERE wa.subject_id = subj.id), 0) AS avg_attendance,
    -- Assignment: filter by subject_id
    COALESCE(AVG(asub.marks_obtained) FILTER (WHERE asub.subject_id = subj.id), 0) AS avg_assignment,
    -- Quiz: filter by subject_id
    COALESCE(AVG(q.marks_obtained) FILTER (WHERE q.subject_id = subj.id), 0) AS avg_quiz,
    -- Stress: general, not subject-specific (use overall average)
    COALESCE(AVG(ws.stress_index), 0) AS avg_stress_index,
    -- Social media: general, not subject-specific (use overall average)
    COALESCE(AVG(ws.social_media_hours), 0) AS avg_social_media_hours,
    -- Travel time: general, not subject-specific (use overall average)
    COALESCE(AVG(ws.travel_time_minutes), 0) AS avg_travel_time,
    -- Class interaction: general, not subject-specific (use overall average)
    COALESCE(AVG(ci.interaction_score), 0) AS avg_class_interaction,
    GREATEST(
        s.updated_at,
        COALESCE(sp.updated_at, 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM weekly_attendance WHERE student_id = s.id AND subject_id = subj.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM assignment_submissions WHERE student_id = s.id AND subject_id = subj.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM quiz_results WHERE student_id = s.id AND subject_id = subj.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM weekly_stress WHERE student_id = s.id), 'epoch'::timestamptz),
        COALESCE((SELECT MAX(updated_at) FROM class_interactions WHERE student_id = s.id), 'epoch'::timestamptz)
    ) AS last_updated
FROM students s
CROSS JOIN subjects subj
LEFT JOIN student_performance sp ON s.id = sp.student_id
LEFT JOIN weekly_attendance wa ON s.id = wa.student_id
LEFT JOIN assignment_submissions asub ON s.id = asub.student_id
LEFT JOIN quiz_results q ON s.id = q.student_id
LEFT JOIN weekly_stress ws ON s.id = ws.student_id
LEFT JOIN class_interactions ci ON s.id = ci.student_id
WHERE subj.department = s.department
GROUP BY s.id, s.student_id, s.full_name, s.email, s.department, s.semester, subj.id, subj.code, subj.name, subj.department, s.updated_at, sp.updated_at;
