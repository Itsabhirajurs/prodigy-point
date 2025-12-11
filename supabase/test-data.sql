-- Test Account Setup Script
-- Run this in Supabase SQL Editor to create test accounts
-- NOTE: Adjust email/password as needed before running

-- First, create test student account via SQL (if auth user already exists)
-- Or use Supabase Dashboard > Auth to create auth users first

-- Create profile entries (run after auth users are created)
INSERT INTO profiles (id, email, full_name, role, department, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'student@example.com', 'Test Student', 'student', 'CSE', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'faculty@example.com', 'Test Faculty', 'faculty', 'CSE', NOW()),
  ('00000000-0000-0000-0000-000000000003', 'admin@example.com', 'Test Admin', 'admin', 'CSE', NOW())
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role, department = EXCLUDED.department, updated_at = NOW();

-- Create student record with sample data
INSERT INTO students (id, student_id, name, email, department, semester, attendance, avg_assignment, avg_quiz, stress_index, social_media_hours, travel_time, class_interaction, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'STU001', 'Test Student', 'student@example.com', 'CSE', '3', 75, 80, 78, 45, 2.5, 30, 70, NOW())
ON CONFLICT (id) DO UPDATE
SET student_id = EXCLUDED.student_id, name = EXCLUDED.name, email = EXCLUDED.email, department = EXCLUDED.department, semester = EXCLUDED.semester, attendance = EXCLUDED.attendance, avg_assignment = EXCLUDED.avg_assignment, avg_quiz = EXCLUDED.avg_quiz, stress_index = EXCLUDED.stress_index, social_media_hours = EXCLUDED.social_media_hours, travel_time = EXCLUDED.travel_time, class_interaction = EXCLUDED.class_interaction, updated_at = NOW();
