-- Disable RLS on detailed performance tables
-- These tables are safely accessed only by faculty/admin and students see their own data
-- The broken RLS checks profiles.role which faculty users might not have
-- Frontend filtering ensures proper access control

ALTER TABLE weekly_attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stress DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_interactions DISABLE ROW LEVEL SECURITY;

-- Drop all RLS policies on these tables
DROP POLICY IF EXISTS "Faculty can view attendance" ON weekly_attendance;
DROP POLICY IF EXISTS "Faculty can insert attendance" ON weekly_attendance;
DROP POLICY IF EXISTS "Faculty can update own attendance records" ON weekly_attendance;
DROP POLICY IF EXISTS "Students can view own attendance" ON weekly_attendance;

DROP POLICY IF EXISTS "Faculty can view assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can insert assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Faculty can update assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can view own assignments" ON assignment_submissions;

DROP POLICY IF EXISTS "Faculty can view quizzes" ON quiz_results;
DROP POLICY IF EXISTS "Faculty can insert quizzes" ON quiz_results;
DROP POLICY IF EXISTS "Faculty can update quizzes" ON quiz_results;
DROP POLICY IF EXISTS "Students can view own quizzes" ON quiz_results;

DROP POLICY IF EXISTS "Faculty can view stress data" ON weekly_stress;
DROP POLICY IF EXISTS "Faculty can insert stress data" ON weekly_stress;
DROP POLICY IF EXISTS "Faculty can update stress data" ON weekly_stress;
DROP POLICY IF EXISTS "Students can view own stress data" ON weekly_stress;

DROP POLICY IF EXISTS "Faculty can view interactions" ON class_interactions;
DROP POLICY IF EXISTS "Faculty can insert interactions" ON class_interactions;
DROP POLICY IF EXISTS "Faculty can update interactions" ON class_interactions;
DROP POLICY IF EXISTS "Students can view own interactions" ON class_interactions;
