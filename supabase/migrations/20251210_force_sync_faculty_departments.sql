-- ============================================
-- FORCE SYNC PROFILES.DEPARTMENT FROM FACULTY (AGGRESSIVE)
-- Created: December 10, 2025
-- Purpose: Unconditionally sync all faculty profiles from faculty table with canonicalization
-- ============================================

-- STEP 1: Unconditionally update ALL faculty profiles from faculty table (no conditions, just overwrite)
UPDATE profiles p
SET department = CASE
    WHEN lower(trim(f.department)) IN ('it', 'information technology') THEN 'IT'
    WHEN lower(trim(f.department)) IN ('cse', 'cs', 'computer science', 'computer science and engineering') THEN 'CSE'
    WHEN lower(trim(f.department)) IN ('biotech', 'biotechnology') THEN 'Biotech'
    WHEN lower(trim(f.department)) IN ('ece', 'ec', 'electronics', 'electronics and communication', 'electronics and communication engineering') THEN 'ECE'
    WHEN lower(trim(f.department)) IN ('me', 'mechanical', 'mechanical engineering') THEN 'ME'
    WHEN lower(trim(f.department)) IN ('ee', 'eee', 'electrical', 'electrical engineering') THEN 'EE'
    ELSE trim(f.department)
END
FROM faculty f
WHERE f.user_id = p.id;

-- STEP 2: Verify sync (run this to check all faculty now have correct departments)
-- SELECT f.full_name, f.department as faculty_dept, p.department as profiles_dept
-- FROM faculty f
-- JOIN profiles p ON p.id = f.user_id
-- ORDER BY f.full_name;
