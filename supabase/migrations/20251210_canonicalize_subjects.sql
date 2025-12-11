-- Canonicalize subjects.department to match system codes and seed required subjects
-- Created: 2025-12-10

-- 1) Canonicalize existing department values to codes used elsewhere (IT, CSE, Biotech, ECE, ME, EE)
UPDATE subjects
SET department = CASE
    WHEN lower(trim(department)) IN ('it', 'information technology') THEN 'IT'
    WHEN lower(trim(department)) IN ('cse', 'cs', 'computer science', 'computer science and engineering') THEN 'CSE'
    WHEN lower(trim(department)) IN ('biotech', 'biotechnology') THEN 'Biotech'
    WHEN lower(trim(department)) IN ('ece', 'ec', 'electronics', 'electronics and communication', 'electronics and communication engineering') THEN 'ECE'
    WHEN lower(trim(department)) IN ('me', 'mechanical', 'mechanical engineering') THEN 'ME'
    WHEN lower(trim(department)) IN ('ee', 'eee', 'electrical', 'electrical engineering') THEN 'EE'
    ELSE department
END;

-- 2) Ensure active flag defaults to true for existing rows (if column present)
UPDATE subjects SET is_active = COALESCE(is_active, true);

-- 3) Seed CSE subjects (codes CS101-CS106) with canonical department code
INSERT INTO subjects (code, name, department, is_active) VALUES
    ('CS101', 'Data Structures', 'CSE', true),
    ('CS102', 'Algorithms', 'CSE', true),
    ('CS103', 'Operating Systems', 'CSE', true),
    ('CS104', 'Database Management Systems', 'CSE', true),
    ('CS105', 'Computer Networks', 'CSE', true),
    ('CS106', 'Artificial Intelligence', 'CSE', true)
ON CONFLICT (code) DO NOTHING;

-- 4) Seed Biotechnology subjects (codes BT101-BT106) with canonical department code
INSERT INTO subjects (code, name, department, is_active) VALUES
    ('BT101', 'Cell Biology', 'Biotech', true),
    ('BT102', 'Molecular Biology', 'Biotech', true),
    ('BT103', 'Microbiology', 'Biotech', true),
    ('BT104', 'Immunology', 'Biotech', true),
    ('BT105', 'Biochemistry', 'Biotech', true),
    ('BT106', 'Genetic Engineering', 'Biotech', true)
ON CONFLICT (code) DO NOTHING;

-- 5) Optional: add check constraint to enforce canonical codes
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_department_check;
ALTER TABLE subjects
  ADD CONSTRAINT subjects_department_check
  CHECK (department = ANY (ARRAY['CSE','IT','Biotech','ECE','ME','EE']));

-- 6) Recreate subject-scoped views to ensure joins use canonical departments and active subjects
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
    COALESCE(AVG(wa.attendance_percentage), 0) AS avg_attendance,
    COALESCE(AVG(a.marks_obtained), 0) AS avg_assignment,
    COALESCE(AVG(q.marks_obtained), 0) AS avg_quiz,
    COALESCE(AVG(ws.stress_index), 0) AS avg_stress_index,
    COALESCE(AVG(ws.social_media_hours), 0) AS avg_social_media_hours,
    COALESCE(AVG(ws.travel_time_minutes), 0) AS avg_travel_time,
    COALESCE(AVG(ci.interaction_score), 0) AS avg_class_interaction,
    GREATEST(
        COALESCE(MAX(wa.updated_at), 'epoch'),
        COALESCE(MAX(a.updated_at), 'epoch'),
        COALESCE(MAX(q.updated_at), 'epoch'),
        COALESCE(MAX(ws.updated_at), 'epoch'),
        COALESCE(MAX(ci.updated_at), 'epoch')
    ) AS last_updated
FROM students s
JOIN subjects subj ON subj.department = s.department AND subj.is_active = true
LEFT JOIN weekly_attendance wa ON s.id = wa.student_id AND wa.subject_id = subj.id
LEFT JOIN assignment_submissions a ON s.id = a.student_id AND a.subject_id = subj.id
LEFT JOIN quiz_results q ON s.id = q.student_id AND q.subject_id = subj.id
LEFT JOIN weekly_stress ws ON s.id = ws.student_id
LEFT JOIN class_interactions ci ON s.id = ci.student_id
GROUP BY s.id, s.student_id, s.full_name, s.email, s.department, s.semester, subj.id, subj.code, subj.name, subj.department;

CREATE OR REPLACE VIEW v_student_overall AS
SELECT
    student_id,
    student_code,
    full_name,
    email,
    department,
    semester,
    AVG(avg_attendance) AS avg_attendance,
    AVG(avg_assignment) AS avg_assignment,
    AVG(avg_quiz) AS avg_quiz,
    AVG(avg_stress_index) AS avg_stress_index,
    AVG(avg_social_media_hours) AS avg_social_media_hours,
    AVG(avg_travel_time) AS avg_travel_time,
    AVG(avg_class_interaction) AS avg_class_interaction,
    MAX(last_updated) AS last_updated
FROM v_student_subject_averages
GROUP BY student_id, student_code, full_name, email, department, semester;
