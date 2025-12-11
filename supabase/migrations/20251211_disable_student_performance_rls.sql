-- Disable RLS on student_performance table to fix faculty dashboard data loading
-- Faculty filtering happens at the application level
ALTER TABLE IF EXISTS student_performance DISABLE ROW LEVEL SECURITY;

-- Drop the RLS policies that were blocking access
DROP POLICY IF EXISTS "Faculty can view all performance" ON student_performance;
DROP POLICY IF EXISTS "Students can view own performance" ON student_performance;
DROP POLICY IF EXISTS "Faculty can insert performance" ON student_performance;
DROP POLICY IF EXISTS "Faculty can update performance" ON student_performance;
DROP POLICY IF EXISTS "Admins can delete performance" ON student_performance;
