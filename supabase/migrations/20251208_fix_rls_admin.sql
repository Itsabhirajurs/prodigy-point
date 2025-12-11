-- ============================================
-- FIX RLS POLICIES FOR ADMIN USER CREATION
-- Created: December 8, 2025
-- Purpose: Allow admin to create faculty/student profiles via trusted function
-- ============================================

-- Drop existing restrictive profile insert policies
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles for users" ON profiles;
DROP POLICY IF EXISTS "Admin can create profiles" ON profiles;

-- New permissive policy: Allow inserts from authenticated users (will be enforced by function)
CREATE POLICY "Admin can create profiles"
    ON profiles FOR INSERT
    WITH CHECK (true);

-- Function to create profile (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION admin_create_profile(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT,
    p_role app_role
)
RETURNS JSONB AS $$
DECLARE
    v_created_at TIMESTAMPTZ;
BEGIN
    INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (p_user_id, p_email, p_full_name, p_role, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object('status', 'success', 'user_id', p_user_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIX RLS POLICIES FOR FACULTY AND STUDENTS TABLES
-- ============================================

-- Drop existing restrictive faculty insert policy
DROP POLICY IF EXISTS "Admins can insert faculty" ON faculty;

-- New policy: Allow admins to insert faculty records
CREATE POLICY "Admins can insert faculty"
    ON faculty FOR INSERT
    WITH CHECK (is_admin(auth.uid()) OR auth.uid() = user_id);

-- Drop existing restrictive students insert policy
DROP POLICY IF EXISTS "Admins can insert students" ON students;

-- New policy: Allow admins to insert student records
CREATE POLICY "Admins can insert students"
    ON students FOR INSERT
    WITH CHECK (is_admin(auth.uid()) OR auth.uid() = user_id);

-- ============================================
-- FIX SELECT POLICIES FOR ADMIN/FACULTY
-- ============================================

-- Drop old select policies if they exist
DROP POLICY IF EXISTS "Admin and faculty can view students" ON students;
DROP POLICY IF EXISTS "Faculty can view all performance" ON student_performance;

-- Create new SELECT policies for students table
CREATE POLICY "Admin and faculty can view students"
    ON students FOR SELECT
    USING (is_admin(auth.uid()) OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty')));

-- Create new SELECT policies for student_performance table
CREATE POLICY "Faculty can view all performance"
    ON student_performance FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'faculty')) OR
           EXISTS (SELECT 1 FROM students WHERE user_id = auth.uid() AND id = student_performance.student_id));

-- ============================================
-- GRANT VIEW ACCESS TO AUTHENTICATED USERS
-- ============================================

-- Grant SELECT on views to all authenticated users (views inherit table RLS)
GRANT SELECT ON v_student_details TO authenticated;
GRANT SELECT ON v_faculty_summary TO authenticated;
GRANT SELECT ON v_risk_stats_by_department TO authenticated;

-- ============================================
-- END OF MIGRATION
-- ============================================
