-- Subjects and subject-scoped performance
-- Adds subjects table, maps metrics to subject, and tightens RLS so faculty can edit only their department subjects

-- 1) Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) Helper trigger for updated_at
CREATE OR REPLACE FUNCTION trg_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subjects_updated
    BEFORE UPDATE ON subjects
    FOR EACH ROW
    EXECUTE FUNCTION trg_touch_updated_at();

-- 3) Add subject_id to detailed performance tables
ALTER TABLE weekly_attendance
    ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id);

ALTER TABLE assignment_submissions
    ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id);

ALTER TABLE quiz_results
    ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id);

-- 4) Tighten unique constraints to include subject_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'weekly_attendance_student_id_week_number_academic_year_key'
    ) THEN
        ALTER TABLE weekly_attendance DROP CONSTRAINT weekly_attendance_student_id_week_number_academic_year_key;
    END IF;
    ALTER TABLE weekly_attendance
        ADD CONSTRAINT weekly_attendance_student_subject_unique UNIQUE (student_id, subject_id, week_number, academic_year);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'assignment_submissions_student_id_assignment_number_key'
    ) THEN
        ALTER TABLE assignment_submissions DROP CONSTRAINT assignment_submissions_student_id_assignment_number_key;
    END IF;
    ALTER TABLE assignment_submissions
        ADD CONSTRAINT assignment_submissions_student_subject_unique UNIQUE (student_id, subject_id, assignment_number);
EXCEPTION WHEN others THEN NULL; END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'quiz_results_student_id_quiz_number_key'
    ) THEN
        ALTER TABLE quiz_results DROP CONSTRAINT quiz_results_student_id_quiz_number_key;
    END IF;
    ALTER TABLE quiz_results
        ADD CONSTRAINT quiz_results_student_subject_unique UNIQUE (student_id, subject_id, quiz_number);
EXCEPTION WHEN others THEN NULL; END $$;

-- 5) Subject-scoped views
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
CROSS JOIN subjects subj
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
    AVG(avg_stress_index) AS avg_stress_index,
    AVG(avg_social_media_hours) AS avg_social_media_hours,
    AVG(avg_travel_time) AS avg_travel_time,
    AVG(avg_class_interaction) AS avg_class_interaction,
    MAX(last_updated) AS last_updated
FROM v_student_subject_averages
GROUP BY student_id, student_code, full_name, email, department, semester;

-- 6) RLS: faculty can edit only when subject department matches their profile.department or admin
-- Helper function
CREATE OR REPLACE FUNCTION is_admin_or_faculty_in_subject(p_user uuid, p_subject uuid)
RETURNS BOOLEAN AS $$
DECLARE
    v_role app_role;
    v_dept TEXT;
    v_subj_dept TEXT;
BEGIN
    SELECT role, department INTO v_role, v_dept FROM profiles WHERE id = p_user;
    IF v_role = 'admin' THEN
        RETURN true;
    END IF;
    IF v_role = 'faculty' THEN
        SELECT department INTO v_subj_dept FROM subjects WHERE id = p_subject;
        RETURN v_dept IS NOT NULL AND v_subj_dept = v_dept;
    END IF;
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Attendance policies
DROP POLICY IF EXISTS "Faculty can insert attendance" ON weekly_attendance;
DROP POLICY IF EXISTS "Faculty can update own attendance records" ON weekly_attendance;
CREATE POLICY "Faculty scoped insert attendance"
    ON weekly_attendance FOR INSERT
    WITH CHECK (is_admin_or_faculty_in_subject(auth.uid(), subject_id));

CREATE POLICY "Faculty scoped update attendance"
    ON weekly_attendance FOR UPDATE
    USING (is_admin_or_faculty_in_subject(auth.uid(), subject_id));

-- Assignment policies
DROP POLICY IF EXISTS "Faculty can insert assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can update assignments" ON assignment_submissions;
CREATE POLICY "Faculty scoped insert assignments"
    ON assignment_submissions FOR INSERT
    WITH CHECK (is_admin_or_faculty_in_subject(auth.uid(), subject_id));

CREATE POLICY "Faculty scoped update assignments"
    ON assignment_submissions FOR UPDATE
    USING (is_admin_or_faculty_in_subject(auth.uid(), subject_id));

-- Quiz policies
DROP POLICY IF EXISTS "Faculty can insert quizzes" ON quiz_results;
DROP POLICY IF EXISTS "Faculty can update quizzes" ON quiz_results;
CREATE POLICY "Faculty scoped insert quizzes"
    ON quiz_results FOR INSERT
    WITH CHECK (is_admin_or_faculty_in_subject(auth.uid(), subject_id));

CREATE POLICY "Faculty scoped update quizzes"
    ON quiz_results FOR UPDATE
    USING (is_admin_or_faculty_in_subject(auth.uid(), subject_id));

-- Students can still view their own data (reuse existing policies)

-- 7) Seed four default subjects per department (idempotent)
INSERT INTO subjects (code, name, department) VALUES
    ('CS101', 'Programming Fundamentals', 'Computer Science'),
    ('CS102', 'Data Structures', 'Computer Science'),
    ('CS103', 'Databases', 'Computer Science'),
    ('CS104', 'Algorithms', 'Computer Science'),
    ('EE101', 'Circuit Theory', 'Electrical'),
    ('EE102', 'Signals and Systems', 'Electrical'),
    ('EE103', 'Electromagnetics', 'Electrical'),
    ('EE104', 'Power Systems', 'Electrical'),
    ('ME101', 'Thermodynamics', 'Mechanical'),
    ('ME102', 'Mechanics', 'Mechanical'),
    ('ME103', 'Manufacturing', 'Mechanical'),
    ('ME104', 'Fluid Mechanics', 'Mechanical')
ON CONFLICT (code) DO NOTHING;
