-- ============================================
-- NORMALIZE PROFILES.DEPARTMENT AND RELAX CHECK
-- Created: December 9, 2025
-- Purpose: Map legacy department strings to canonical codes to satisfy check
-- ============================================

-- Normalize existing department values to canonical codes
UPDATE profiles
SET department = CASE
    WHEN lower(department) IN ('it', 'information technology') THEN 'IT'
    WHEN lower(department) IN ('cse', 'cs', 'computer science', 'computer science and engineering') THEN 'CSE'
    WHEN lower(department) IN ('biotech', 'biotechnology') THEN 'Biotech'
    WHEN lower(department) IN ('ece', 'electronics', 'electronics and communication', 'electronics and communication engineering') THEN 'ECE'
    WHEN lower(department) IN ('me', 'mechanical', 'mechanical engineering') THEN 'ME'
    WHEN lower(department) IN ('ee', 'eee', 'electrical', 'electrical engineering') THEN 'EE'
    ELSE department
END
WHERE department IS NOT NULL;

-- Recreate the check constraint to allow canonical codes only
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_department_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_department_check
  CHECK (department IS NULL OR department = ANY (ARRAY['CSE','IT','Biotech','ECE','ME','EE']));

-- Update admin_create_profile to canonicalize incoming department values
CREATE OR REPLACE FUNCTION admin_create_profile(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT,
    p_role app_role,
    p_department TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_department TEXT;
BEGIN
    v_department := CASE
        WHEN p_department IS NULL OR trim(p_department) = '' THEN NULL
        WHEN lower(trim(p_department)) IN ('it', 'information technology') THEN 'IT'
        WHEN lower(trim(p_department)) IN ('cse', 'cs', 'computer science', 'computer science and engineering') THEN 'CSE'
        WHEN lower(trim(p_department)) IN ('biotech', 'biotechnology') THEN 'Biotech'
        WHEN lower(trim(p_department)) IN ('ece', 'electronics', 'electronics and communication', 'electronics and communication engineering') THEN 'ECE'
        WHEN lower(trim(p_department)) IN ('me', 'mechanical', 'mechanical engineering') THEN 'ME'
        WHEN lower(trim(p_department)) IN ('ee', 'eee', 'electrical', 'electrical engineering') THEN 'EE'
        ELSE trim(p_department)
    END;

    INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
    VALUES (p_user_id, p_email, p_full_name, p_role, v_department, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
        SET email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            department = COALESCE(EXCLUDED.department, profiles.department),
            updated_at = NOW();

    RETURN jsonb_build_object('status', 'success', 'user_id', p_user_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
