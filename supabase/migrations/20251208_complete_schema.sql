-- ============================================
-- STUDENT RISK PREDICTION SYSTEM - DATABASE SCHEMA
-- Created: December 8, 2025
-- Purpose: Complete schema with Admin, Faculty, Student management
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- User role enum
CREATE TYPE app_role AS ENUM ('admin', 'faculty', 'student');

-- Risk level enum
CREATE TYPE risk_level AS ENUM ('Low Risk', 'Medium Risk', 'High Risk');

-- Prediction status enum
CREATE TYPE prediction_status AS ENUM ('On Track', 'Needs Support');

-- ============================================
-- TABLES
-- ============================================

-- 1. PROFILES TABLE
-- Extends auth.users with additional user information
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. FACULTY TABLE
-- Stores faculty-specific information
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    faculty_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    specialization TEXT,
    phone TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT faculty_faculty_id_format CHECK (faculty_id ~* '^FAC[0-9]{3,}$')
);

-- 3. STUDENTS TABLE
-- Stores student-specific information
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    semester INTEGER CHECK (semester >= 1 AND semester <= 8),
    phone TEXT,
    date_of_birth DATE,
    enrollment_year INTEGER,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT students_student_id_format CHECK (student_id ~* '^STU[0-9]{3,}$')
);

-- 4. STUDENT PERFORMANCE TABLE
-- Stores all performance metrics for students
CREATE TABLE student_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    
    -- Academic metrics
    attendance DECIMAL(5,2) CHECK (attendance >= 0 AND attendance <= 100),
    avg_assignment DECIMAL(5,2) CHECK (avg_assignment >= 0 AND avg_assignment <= 100),
    avg_quiz DECIMAL(5,2) CHECK (avg_quiz >= 0 AND avg_quiz <= 100),
    
    -- Behavioral metrics
    stress_index DECIMAL(5,2) CHECK (stress_index >= 0 AND stress_index <= 100),
    social_media_hours DECIMAL(5,2) CHECK (social_media_hours >= 0),
    travel_time DECIMAL(5,2) CHECK (travel_time >= 0),
    class_interaction DECIMAL(5,2) CHECK (class_interaction >= 0 AND class_interaction <= 10),
    
    -- Calculated fields
    score DECIMAL(6,2),
    risk_level risk_level,
    prediction prediction_status,
    
    -- Metadata
    updated_by UUID REFERENCES faculty(id),
    semester INTEGER,
    academic_year TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(student_id, semester, academic_year)
);

-- 5. FACULTY NOTES TABLE
-- Stores notes faculty add about students
CREATE TABLE faculty_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PASSWORD RESET TOKENS TABLE
-- Stores password reset tokens for forgot password functionality
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. AUDIT LOG TABLE
-- Tracks all important actions for accountability
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_faculty_faculty_id ON faculty(faculty_id);
CREATE INDEX idx_faculty_department ON faculty(department);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_student_performance_student_id ON student_performance(student_id);
CREATE INDEX idx_student_performance_risk_level ON student_performance(risk_level);
CREATE INDEX idx_faculty_notes_student_id ON faculty_notes(student_id);
CREATE INDEX idx_faculty_notes_faculty_id ON faculty_notes(faculty_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate student score
CREATE OR REPLACE FUNCTION calculate_student_score(
    p_attendance DECIMAL,
    p_avg_quiz DECIMAL,
    p_avg_assignment DECIMAL,
    p_class_interaction DECIMAL,
    p_stress_index DECIMAL,
    p_social_media_hours DECIMAL,
    p_travel_time DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        (COALESCE(p_attendance, 0) * 0.45) +
        (COALESCE(p_avg_quiz, 0) * 0.25) +
        (COALESCE(p_avg_assignment, 0) * 0.20) +
        (COALESCE(p_class_interaction, 0) * 2) -
        (COALESCE(p_stress_index, 0) * 0.30) -
        (COALESCE(p_social_media_hours, 0) * 3) -
        (COALESCE(p_travel_time, 0) * 0.05)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to determine risk level from score
CREATE OR REPLACE FUNCTION get_risk_level(p_score DECIMAL)
RETURNS risk_level AS $$
BEGIN
    IF p_score >= 70 THEN
        RETURN 'Low Risk'::risk_level;
    ELSIF p_score >= 50 THEN
        RETURN 'Medium Risk'::risk_level;
    ELSE
        RETURN 'High Risk'::risk_level;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to determine prediction status
CREATE OR REPLACE FUNCTION get_prediction_status(
    p_attendance DECIMAL,
    p_avg_assignment DECIMAL,
    p_avg_quiz DECIMAL
)
RETURNS prediction_status AS $$
BEGIN
    IF p_attendance > 75 AND p_avg_assignment > 70 AND p_avg_quiz > 70 THEN
        RETURN 'On Track'::prediction_status;
    ELSE
        RETURN 'Needs Support'::prediction_status;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-calculate score, risk, and prediction before insert/update
CREATE OR REPLACE FUNCTION auto_calculate_performance()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate score
    NEW.score := calculate_student_score(
        NEW.attendance,
        NEW.avg_quiz,
        NEW.avg_assignment,
        NEW.class_interaction,
        NEW.stress_index,
        NEW.social_media_hours,
        NEW.travel_time
    );
    
    -- Calculate risk level
    NEW.risk_level := get_risk_level(NEW.score);
    
    -- Calculate prediction
    NEW.prediction := get_prediction_status(
        NEW.attendance,
        NEW.avg_assignment,
        NEW.avg_quiz
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS app_role AS $$
DECLARE
    v_role app_role;
BEGIN
    SELECT role INTO v_role FROM profiles WHERE id = p_user_id;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'admin' FROM profiles WHERE id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is faculty
CREATE OR REPLACE FUNCTION is_faculty(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role IN ('admin', 'faculty') FROM profiles WHERE id = p_user_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on faculty
CREATE TRIGGER update_faculty_updated_at
    BEFORE UPDATE ON faculty
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on students
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on student_performance
CREATE TRIGGER update_student_performance_updated_at
    BEFORE UPDATE ON student_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-calculate performance metrics
CREATE TRIGGER auto_calculate_performance_trigger
    BEFORE INSERT OR UPDATE ON student_performance
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_performance();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

-- Admins can see all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin(auth.uid()));

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "Admins can update profiles"
    ON profiles FOR UPDATE
    USING (is_admin(auth.uid()));

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - FACULTY
-- ============================================

-- Admins and faculty can view all faculty
CREATE POLICY "Admin and faculty can view faculty"
    ON faculty FOR SELECT
    USING (is_faculty(auth.uid()));

-- Admins can insert faculty
CREATE POLICY "Admins can insert faculty"
    ON faculty FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- Admins can update faculty
CREATE POLICY "Admins can update faculty"
    ON faculty FOR UPDATE
    USING (is_admin(auth.uid()));

-- Admins can delete faculty
CREATE POLICY "Admins can delete faculty"
    ON faculty FOR DELETE
    USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - STUDENTS
-- ============================================

-- Admins and faculty can view all students
CREATE POLICY "Admin and faculty can view students"
    ON students FOR SELECT
    USING (is_faculty(auth.uid()));

-- Students can view their own record
CREATE POLICY "Students can view own record"
    ON students FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can insert students
CREATE POLICY "Admins can insert students"
    ON students FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- Admins can update students
CREATE POLICY "Admins can update students"
    ON students FOR UPDATE
    USING (is_admin(auth.uid()));

-- Admins can delete students
CREATE POLICY "Admins can delete students"
    ON students FOR DELETE
    USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - STUDENT PERFORMANCE
-- ============================================

-- Faculty can view all student performance
CREATE POLICY "Faculty can view all performance"
    ON student_performance FOR SELECT
    USING (is_faculty(auth.uid()));

-- Students can view their own performance
CREATE POLICY "Students can view own performance"
    ON student_performance FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE students.id = student_performance.student_id
            AND students.user_id = auth.uid()
        )
    );

-- Faculty can insert performance records
CREATE POLICY "Faculty can insert performance"
    ON student_performance FOR INSERT
    WITH CHECK (is_faculty(auth.uid()));

-- Faculty can update performance records
CREATE POLICY "Faculty can update performance"
    ON student_performance FOR UPDATE
    USING (is_faculty(auth.uid()));

-- Admins can delete performance records
CREATE POLICY "Admins can delete performance"
    ON student_performance FOR DELETE
    USING (is_admin(auth.uid()));

-- ============================================
-- RLS POLICIES - FACULTY NOTES
-- ============================================

-- Faculty can view all notes
CREATE POLICY "Faculty can view notes"
    ON faculty_notes FOR SELECT
    USING (is_faculty(auth.uid()));

-- Faculty can insert notes
CREATE POLICY "Faculty can insert notes"
    ON faculty_notes FOR INSERT
    WITH CHECK (
        is_faculty(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM faculty
            WHERE faculty.user_id = auth.uid()
            AND faculty.id = faculty_notes.faculty_id
        )
    );

-- Faculty can update their own notes
CREATE POLICY "Faculty can update own notes"
    ON faculty_notes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM faculty
            WHERE faculty.user_id = auth.uid()
            AND faculty.id = faculty_notes.faculty_id
        )
    );

-- Faculty can delete their own notes
CREATE POLICY "Faculty can delete own notes"
    ON faculty_notes FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM faculty
            WHERE faculty.user_id = auth.uid()
            AND faculty.id = faculty_notes.faculty_id
        )
    );

-- ============================================
-- RLS POLICIES - PASSWORD RESET TOKENS
-- ============================================

-- Users can view their own reset tokens
CREATE POLICY "Users can view own reset tokens"
    ON password_reset_tokens FOR SELECT
    USING (auth.uid() = user_id);

-- Anyone can insert reset tokens (for forgot password)
CREATE POLICY "Anyone can insert reset tokens"
    ON password_reset_tokens FOR INSERT
    WITH CHECK (true);

-- Users can update their own tokens
CREATE POLICY "Users can update own tokens"
    ON password_reset_tokens FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - AUDIT LOG
-- ============================================

-- Admins can view all audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_log FOR SELECT
    USING (is_admin(auth.uid()));

-- All authenticated users can insert audit logs
CREATE POLICY "Users can insert audit logs"
    ON audit_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INITIAL DATA - CREATE ADMIN ACCOUNT
-- ============================================

-- Note: This will be executed manually after auth.users is created
-- The admin credentials will be:
-- Email: admin@prodigypoint.com
-- Password: Admin@123456
-- This user must be created via Supabase Auth first, then we'll insert the profile

-- Insert will be done via application after auth.users entry is created

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Complete student information with latest performance
CREATE OR REPLACE VIEW v_student_details AS
SELECT 
    s.id,
    s.student_id,
    s.full_name,
    s.email,
    s.department,
    s.semester,
    s.phone,
    s.enrollment_year,
    sp.attendance,
    sp.avg_assignment,
    sp.avg_quiz,
    sp.stress_index,
    sp.social_media_hours,
    sp.travel_time,
    sp.class_interaction,
    sp.score,
    sp.risk_level,
    sp.prediction,
    sp.updated_at as last_performance_update,
    s.created_at
FROM students s
LEFT JOIN LATERAL (
    SELECT *
    FROM student_performance
    WHERE student_id = s.id
    ORDER BY updated_at DESC
    LIMIT 1
) sp ON true;

-- View: Faculty with student count
CREATE OR REPLACE VIEW v_faculty_summary AS
SELECT 
    f.id,
    f.faculty_id,
    f.full_name,
    f.email,
    f.department,
    f.specialization,
    COUNT(DISTINCT fn.student_id) as students_monitored,
    f.created_at
FROM faculty f
LEFT JOIN faculty_notes fn ON f.id = fn.faculty_id
GROUP BY f.id, f.faculty_id, f.full_name, f.email, f.department, f.specialization, f.created_at;

-- View: Risk statistics by department
CREATE OR REPLACE VIEW v_risk_stats_by_department AS
SELECT 
    s.department,
    COUNT(s.id) as total_students,
    COUNT(CASE WHEN sp.risk_level = 'Low Risk' THEN 1 END) as low_risk_count,
    COUNT(CASE WHEN sp.risk_level = 'Medium Risk' THEN 1 END) as medium_risk_count,
    COUNT(CASE WHEN sp.risk_level = 'High Risk' THEN 1 END) as high_risk_count,
    AVG(sp.score) as avg_score,
    AVG(sp.attendance) as avg_attendance
FROM students s
LEFT JOIN LATERAL (
    SELECT *
    FROM student_performance
    WHERE student_id = s.id
    ORDER BY updated_at DESC
    LIMIT 1
) sp ON true
GROUP BY s.department;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE profiles IS 'Extends auth.users with role and basic profile information';
COMMENT ON TABLE faculty IS 'Stores faculty member details and credentials';
COMMENT ON TABLE students IS 'Stores student details and credentials';
COMMENT ON TABLE student_performance IS 'Tracks all student performance metrics with automatic score calculation';
COMMENT ON TABLE faculty_notes IS 'Notes added by faculty about student progress';
COMMENT ON TABLE password_reset_tokens IS 'Manages password reset functionality';
COMMENT ON TABLE audit_log IS 'Tracks all important system actions for accountability';

COMMENT ON FUNCTION calculate_student_score IS 'Calculates weighted performance score based on multiple metrics';
COMMENT ON FUNCTION get_risk_level IS 'Determines risk level category based on performance score';
COMMENT ON FUNCTION get_prediction_status IS 'Predicts student trajectory based on key metrics';

-- ============================================
-- END OF SCHEMA
-- ============================================
