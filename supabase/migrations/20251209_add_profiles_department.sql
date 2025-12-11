-- ============================================
-- ADD DEPARTMENT TO PROFILES AND BACKFILL
-- Created: December 9, 2025
-- Purpose: Ensure faculty/admin profiles carry department for UI guards
-- ============================================

-- Add column if missing
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS department TEXT;

-- Helpful index for department lookups/filters
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department);

-- Backfill from faculty table
UPDATE profiles p
SET department = f.department
FROM faculty f
WHERE f.user_id = p.id
  AND f.department IS NOT NULL
  AND (p.department IS NULL OR p.department = '');

-- Backfill from students table as a fallback
UPDATE profiles p
SET department = s.department
FROM students s
WHERE s.user_id = p.id
  AND s.department IS NOT NULL
  AND (p.department IS NULL OR p.department = '');

-- Update admin_create_profile to store department (idempotent)
CREATE OR REPLACE FUNCTION admin_create_profile(
    p_user_id UUID,
    p_email TEXT,
    p_full_name TEXT,
    p_role app_role,
    p_department TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
    VALUES (p_user_id, p_email, p_full_name, p_role, p_department, NOW(), NOW())
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
