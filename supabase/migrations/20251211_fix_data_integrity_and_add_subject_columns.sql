-- ============================================
-- FIX DATA INTEGRITY AND ADD MISSING COLUMNS
-- Created: December 11, 2025
-- Purpose: 
--   1. Add missing subject_id columns to detailed performance tables
--   2. Update UNIQUE constraints to include subject_id
--   3. Delete all orphaned performance records (student_ids that don't exist)
--   4. Ensure data consistency across all tables
-- ============================================

-- ============================================
-- STEP 1: DELETE ORPHANED DATA
-- Delete records that reference student IDs not in the students table
-- ============================================

-- Delete orphaned weekly_attendance records
DELETE FROM weekly_attendance
WHERE student_id NOT IN (SELECT id FROM students);

-- Delete orphaned assignment_submissions records
DELETE FROM assignment_submissions
WHERE student_id NOT IN (SELECT id FROM students);

-- Delete orphaned quiz_results records
DELETE FROM quiz_results
WHERE student_id NOT IN (SELECT id FROM students);

-- Delete orphaned weekly_stress records
DELETE FROM weekly_stress
WHERE student_id NOT IN (SELECT id FROM students);

-- Delete orphaned class_interactions records
DELETE FROM class_interactions
WHERE student_id NOT IN (SELECT id FROM students);

-- ============================================
-- STEP 2: ADD SUBJECT_ID COLUMNS (if they don't exist)
-- These columns are needed because UpdateStudentData.tsx tries to save subject_id
-- ============================================

-- Add subject_id to weekly_attendance if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'weekly_attendance' AND column_name = 'subject_id'
    ) THEN
        ALTER TABLE weekly_attendance
        ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE;
        
        -- Create index for performance
        CREATE INDEX idx_weekly_attendance_subject ON weekly_attendance(subject_id);
    END IF;
END
$$;

-- Add subject_id to assignment_submissions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assignment_submissions' AND column_name = 'subject_id'
    ) THEN
        ALTER TABLE assignment_submissions
        ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE;
        
        -- Create index for performance
        CREATE INDEX idx_assignment_submissions_subject ON assignment_submissions(subject_id);
    END IF;
END
$$;

-- Add subject_id to quiz_results if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_results' AND column_name = 'subject_id'
    ) THEN
        ALTER TABLE quiz_results
        ADD COLUMN subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE;
        
        -- Create index for performance
        CREATE INDEX idx_quiz_results_subject ON quiz_results(subject_id);
    END IF;
END
$$;

-- ============================================
-- STEP 3: DROP EXISTING CONSTRAINTS THAT CONFLICT
-- We need to drop old UNIQUE constraints that don't include subject_id
-- ============================================

-- Drop old UNIQUE constraint on weekly_attendance (without subject_id)
ALTER TABLE weekly_attendance 
DROP CONSTRAINT IF EXISTS weekly_attendance_student_id_week_number_academic_year_key;

-- Drop old UNIQUE constraint on assignment_submissions (without subject_id)
ALTER TABLE assignment_submissions 
DROP CONSTRAINT IF EXISTS assignment_submissions_student_id_assignment_number_key;

-- Drop old UNIQUE constraint on quiz_results (without subject_id)
ALTER TABLE quiz_results 
DROP CONSTRAINT IF EXISTS quiz_results_student_id_quiz_number_key;

-- ============================================
-- STEP 4: ADD NEW UNIQUE CONSTRAINTS THAT INCLUDE SUBJECT_ID
-- ============================================

-- Add new UNIQUE constraint for weekly_attendance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'weekly_attendance' 
        AND constraint_name = 'weekly_attendance_student_subject_week_academic_key'
    ) THEN
        ALTER TABLE weekly_attendance
        ADD CONSTRAINT weekly_attendance_student_subject_week_academic_key 
        UNIQUE(student_id, subject_id, week_number, academic_year);
    END IF;
END
$$;

-- Add new UNIQUE constraint for assignment_submissions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'assignment_submissions' 
        AND constraint_name = 'assignment_submissions_student_subject_assignment_key'
    ) THEN
        ALTER TABLE assignment_submissions
        ADD CONSTRAINT assignment_submissions_student_subject_assignment_key 
        UNIQUE(student_id, subject_id, assignment_number);
    END IF;
END
$$;

-- Add new UNIQUE constraint for quiz_results
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'quiz_results' 
        AND constraint_name = 'quiz_results_student_subject_quiz_key'
    ) THEN
        ALTER TABLE quiz_results
        ADD CONSTRAINT quiz_results_student_subject_quiz_key 
        UNIQUE(student_id, subject_id, quiz_number);
    END IF;
END
$$;

-- ============================================
-- STEP 5: VERIFY DATA INTEGRITY
-- Run checks to ensure all remaining records are valid
-- ============================================

-- Verify: All weekly_attendance records have valid student_ids
DO $$
DECLARE
    orphan_count INT;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM weekly_attendance
    WHERE student_id NOT IN (SELECT id FROM students);
    
    IF orphan_count > 0 THEN
        RAISE WARNING 'Found % orphaned weekly_attendance records after cleanup!', orphan_count;
    ELSE
        RAISE NOTICE 'weekly_attendance: All records have valid student references ✓';
    END IF;
END
$$;

-- Verify: All assignment_submissions records have valid student_ids
DO $$
DECLARE
    orphan_count INT;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM assignment_submissions
    WHERE student_id NOT IN (SELECT id FROM students);
    
    IF orphan_count > 0 THEN
        RAISE WARNING 'Found % orphaned assignment_submissions records after cleanup!', orphan_count;
    ELSE
        RAISE NOTICE 'assignment_submissions: All records have valid student references ✓';
    END IF;
END
$$;

-- Verify: All quiz_results records have valid student_ids
DO $$
DECLARE
    orphan_count INT;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM quiz_results
    WHERE student_id NOT IN (SELECT id FROM students);
    
    IF orphan_count > 0 THEN
        RAISE WARNING 'Found % orphaned quiz_results records after cleanup!', orphan_count;
    ELSE
        RAISE NOTICE 'quiz_results: All records have valid student references ✓';
    END IF;
END
$$;

-- Verify: All weekly_stress records have valid student_ids
DO $$
DECLARE
    orphan_count INT;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM weekly_stress
    WHERE student_id NOT IN (SELECT id FROM students);
    
    IF orphan_count > 0 THEN
        RAISE WARNING 'Found % orphaned weekly_stress records after cleanup!', orphan_count;
    ELSE
        RAISE NOTICE 'weekly_stress: All records have valid student references ✓';
    END IF;
END
$$;

-- Verify: All class_interactions records have valid student_ids
DO $$
DECLARE
    orphan_count INT;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM class_interactions
    WHERE student_id NOT IN (SELECT id FROM students);
    
    IF orphan_count > 0 THEN
        RAISE WARNING 'Found % orphaned class_interactions records after cleanup!', orphan_count;
    ELSE
        RAISE NOTICE 'class_interactions: All records have valid student references ✓';
    END IF;
END
$$;

-- ============================================
-- SUMMARY
-- ============================================
-- This migration:
-- 1. ✓ Deleted all orphaned performance records
-- 2. ✓ Added subject_id columns to assignment_submissions, quiz_results, weekly_attendance
-- 3. ✓ Updated UNIQUE constraints to include subject_id
-- 4. ✓ Verified data integrity
--
-- SAFE TO RUN - This will NOT affect:
-- - Students table (no changes)
-- - Faculty table (no changes)
-- - Profiles table (no changes)
-- - RLS policies (no changes)
-- - Views (will work better with new columns)
-- - Existing triggers (no changes)
--
-- IMPACT:
-- - All orphaned data removed (invalid student references)
-- - New subject_id columns allow UpdateStudentData.tsx to work correctly
-- - UpdateStudentData UI can now track performance per-subject
-- ============================================
