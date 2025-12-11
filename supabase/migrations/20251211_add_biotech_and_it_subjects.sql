-- Add additional subjects for CS/IT and Biotechnology (idempotent)
-- Also update subject average views to scope subjects to the student's department only

-- Seed additional Computer Science subjects (target 6 total)
INSERT INTO subjects (code, name, department) VALUES
    ('CS105', 'Operating Systems', 'CSE'),
    ('CS106', 'Computer Networks', 'CSE')
ON CONFLICT (code) DO NOTHING;

-- Seed Information Technology subjects (provide 6 options)
INSERT INTO subjects (code, name, department) VALUES
    ('IT101', 'Web Technologies', 'IT'),
    ('IT102', 'Database Management', 'IT'),
    ('IT103', 'Software Engineering', 'IT'),
    ('IT104', 'Cloud Computing', 'IT'),
    ('IT105', 'Cybersecurity Fundamentals', 'IT'),
    ('IT106', 'Data Analytics', 'IT')
ON CONFLICT (code) DO NOTHING;

-- Seed Biotechnology subjects (8 options as requested)
INSERT INTO subjects (code, name, department) VALUES
    ('BT101', 'Cell Biology', 'Biotech'),
    ('BT102', 'Genetics', 'Biotech'),
    ('BT103', 'Biochemistry', 'Biotech'),
    ('BT104', 'Microbiology', 'Biotech'),
    ('BT105', 'Molecular Biology', 'Biotech'),
    ('BT106', 'Bioprocess Engineering', 'Biotech'),
    ('BT107', 'Immunology', 'Biotech'),
    ('BT108', 'Bioinformatics', 'Biotech')
ON CONFLICT (code) DO NOTHING;

-- Update subject-scoped view to only include subjects from the student's department
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
JOIN subjects subj ON subj.department = s.department
LEFT JOIN weekly_attendance wa ON s.id = wa.student_id AND wa.subject_id = subj.id
LEFT JOIN assignment_submissions a ON s.id = a.student_id AND a.subject_id = subj.id
LEFT JOIN quiz_results q ON s.id = q.student_id AND q.subject_id = subj.id
LEFT JOIN weekly_stress ws ON s.id = ws.student_id -- stress is general, not subject-specific
LEFT JOIN class_interactions ci ON s.id = ci.student_id -- interaction is general
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
    AVG(avg_stress_index) AS stress_index,
    AVG(avg_social_media_hours) AS social_media_hours,
    AVG(avg_travel_time) AS travel_time,
    AVG(avg_class_interaction) AS class_interaction,
    MAX(last_updated) AS last_updated
FROM v_student_subject_averages
GROUP BY student_id, student_code, full_name, email, department, semester;
