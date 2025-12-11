-- ============================================
-- NORMALIZE STUDENTS.DEPARTMENT TO CANONICAL CODES
-- Created: December 10, 2025
-- Purpose: Ensure students.department matches canonical codes (CSE, IT, Biotech, ECE, ME, EE)
-- ============================================

-- Normalize students.department to canonical codes
UPDATE students
SET department = CASE
    WHEN lower(department) IN ('it', 'information technology') THEN 'IT'
    WHEN lower(department) IN ('cse', 'cs', 'computer science', 'computer science and engineering') THEN 'CSE'
    WHEN lower(department) IN ('biotech', 'biotechnology') THEN 'Biotech'
    WHEN lower(department) IN ('ece', 'electronics', 'electronics and communication', 'electronics and communication engineering') THEN 'ECE'
    WHEN lower(department) IN ('me', 'mechanical', 'mechanical engineering') THEN 'ME'
    WHEN lower(department) IN ('ee', 'eee', 'electrical', 'electrical engineering') THEN 'EE'
    ELSE department
END;

-- Add check constraint to enforce canonical codes only
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_department_check;
ALTER TABLE students
  ADD CONSTRAINT students_department_check
  CHECK (department = ANY (ARRAY['CSE','IT','Biotech','ECE','ME','EE']));
