-- ============================================
-- DETAILED PERFORMANCE TRACKING TABLES
-- Created: December 9, 2025
-- Purpose: Allow faculty to enter detailed metrics that auto-calculate to averages
-- ============================================

-- ============================================
-- 1. WEEKLY ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    attendance_percentage DECIMAL(5,2) NOT NULL CHECK (attendance_percentage >= 0 AND attendance_percentage <= 100),
    recorded_by UUID REFERENCES faculty(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, week_number, academic_year)
);

-- ============================================
-- 2. ASSIGNMENT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assignment_number INTEGER NOT NULL CHECK (assignment_number >= 1),
    marks_obtained DECIMAL(5,2) NOT NULL CHECK (marks_obtained >= 0 AND marks_obtained <= 100),
    assignment_date DATE NOT NULL,
    recorded_by UUID REFERENCES faculty(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, assignment_number)
);

-- ============================================
-- 3. QUIZ RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quiz_number INTEGER NOT NULL CHECK (quiz_number >= 1),
    marks_obtained DECIMAL(5,2) NOT NULL CHECK (marks_obtained >= 0 AND marks_obtained <= 100),
    quiz_date DATE NOT NULL,
    recorded_by UUID REFERENCES faculty(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, quiz_number)
);

-- ============================================
-- 4. WEEKLY STRESS INDEX TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_stress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    stress_index DECIMAL(5,2) NOT NULL CHECK (stress_index >= 0 AND stress_index <= 100),
    social_media_hours DECIMAL(5,2) NOT NULL CHECK (social_media_hours >= 0),
    travel_time_minutes DECIMAL(8,2) NOT NULL CHECK (travel_time_minutes >= 0),
    recorded_by UUID REFERENCES faculty(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, week_number, academic_year)
);

-- ============================================
-- 5. CLASS INTERACTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS class_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    interaction_date DATE NOT NULL,
    interaction_score DECIMAL(3,1) NOT NULL CHECK (interaction_score >= 0 AND interaction_score <= 10),
    recorded_by UUID REFERENCES faculty(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_weekly_attendance_student ON weekly_attendance(student_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_quiz_results_student ON quiz_results(student_id);
CREATE INDEX idx_weekly_stress_student ON weekly_stress(student_id);
CREATE INDEX idx_class_interactions_student ON class_interactions(student_id);

-- ============================================
-- VIEWS FOR AGGREGATED DATA
-- ============================================

-- View: Average scores by student (auto-calculated)
CREATE OR REPLACE VIEW v_student_averages AS
SELECT 
    s.id as student_id,
    s.student_id as student_code,
    s.full_name,
    s.email,
    s.department,
    s.semester,
    COALESCE(AVG(wa.attendance_percentage), 0) as avg_attendance,
    COALESCE(AVG(a.marks_obtained), 0) as avg_assignment,
    COALESCE(AVG(q.marks_obtained), 0) as avg_quiz,
    COALESCE(AVG(ws.stress_index), 0) as avg_stress_index,
    COALESCE(AVG(ws.social_media_hours), 0) as avg_social_media_hours,
    COALESCE(AVG(ws.travel_time_minutes), 0) as avg_travel_time,
    COALESCE(AVG(ci.interaction_score), 0) as avg_class_interaction,
    MAX(wa.updated_at) as last_updated
FROM students s
LEFT JOIN weekly_attendance wa ON s.id = wa.student_id
LEFT JOIN assignment_submissions a ON s.id = a.student_id
LEFT JOIN quiz_results q ON s.id = q.student_id
LEFT JOIN weekly_stress ws ON s.id = ws.student_id
LEFT JOIN class_interactions ci ON s.id = ci.student_id
GROUP BY s.id, s.student_id, s.full_name, s.email, s.department, s.semester;

-- ============================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================

-- Enable RLS
ALTER TABLE weekly_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stress ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculty can view attendance"
    ON weekly_attendance FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can insert attendance"
    ON weekly_attendance FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can update own attendance records"
    ON weekly_attendance FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can view assignments"
    ON assignment_submissions FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can insert assignments"
    ON assignment_submissions FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can update assignments"
    ON assignment_submissions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can view quizzes"
    ON quiz_results FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can insert quizzes"
    ON quiz_results FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can update quizzes"
    ON quiz_results FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can view stress data"
    ON weekly_stress FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can insert stress data"
    ON weekly_stress FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can update stress data"
    ON weekly_stress FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can view interactions"
    ON class_interactions FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can insert interactions"
    ON class_interactions FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

CREATE POLICY "Faculty can update interactions"
    ON class_interactions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'faculty')));

-- Students can view their own data
CREATE POLICY "Students can view own attendance"
    ON weekly_attendance FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.user_id = auth.uid()
              AND s.id = weekly_attendance.student_id
        )
    );

CREATE POLICY "Students can view own assignments"
    ON assignment_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.user_id = auth.uid()
              AND s.id = assignment_submissions.student_id
        )
    );

CREATE POLICY "Students can view own quizzes"
    ON quiz_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.user_id = auth.uid()
              AND s.id = quiz_results.student_id
        )
    );

CREATE POLICY "Students can view own stress data"
    ON weekly_stress FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.user_id = auth.uid()
              AND s.id = weekly_stress.student_id
        )
    );

CREATE POLICY "Students can view own interactions"
    ON class_interactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students s
            WHERE s.user_id = auth.uid()
              AND s.id = class_interactions.student_id
        )
    );

-- ============================================
-- END OF MIGRATION
-- ============================================
