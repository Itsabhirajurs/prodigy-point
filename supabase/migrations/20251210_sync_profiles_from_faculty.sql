-- ============================================
-- SYNC PROFILES.DEPARTMENT FROM FACULTY.DEPARTMENT
-- Created: December 10, 2025
-- Purpose: Populate profiles.department for faculty from faculty.department; canonicalize both
-- ============================================

-- Update profiles.department from faculty.department (with canonicalization)
UPDATE profiles p
SET department = CASE
    WHEN lower(f.department) IN ('it', 'information technology') THEN 'IT'
    WHEN lower(f.department) IN ('cse', 'cs', 'computer science', 'computer science and engineering') THEN 'CSE'
    WHEN lower(f.department) IN ('biotech', 'biotechnology') THEN 'Biotech'
    WHEN lower(f.department) IN ('ece', 'ec', 'electronics', 'electronics and communication', 'electronics and communication engineering') THEN 'ECE'
    WHEN lower(f.department) IN ('me', 'mechanical', 'mechanical engineering') THEN 'ME'
    WHEN lower(f.department) IN ('ee', 'eee', 'electrical', 'electrical engineering') THEN 'EE'
    ELSE f.department
END
FROM faculty f
WHERE f.user_id = p.id
  AND f.department IS NOT NULL
  AND (p.department IS NULL OR p.department = '');

-- Update admin_create_profile to handle 'ec' and 'electronics' variants
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
        WHEN lower(trim(p_department)) IN ('ece', 'ec', 'electronics', 'electronics and communication', 'electronics and communication engineering') THEN 'ECE'
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
