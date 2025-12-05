-- Add role column to student_data
ALTER TABLE public.student_data ADD COLUMN IF NOT EXISTS role text DEFAULT 'student';

-- Update existing records to have 'student' role
UPDATE public.student_data SET role = 'student' WHERE role IS NULL;

-- Insert faculty records
INSERT INTO public.student_data (student_id, name, department, semester, attendance, avg_assignment, avg_quiz, stress_index, social_media_hours, travel_time, class_interaction, score, risk_level, prediction, role)
VALUES 
  ('FAC001', 'Dr. Sarah Johnson', 'Computer Science', 'Faculty', 100, 100, 100, 20, 1, 15, 100, 100, 'Low Risk', 'On Track', 'faculty'),
  ('FAC002', 'Prof. Michael Chen', 'Engineering', 'Faculty', 100, 100, 100, 25, 0.5, 20, 100, 100, 'Low Risk', 'On Track', 'faculty')
ON CONFLICT (student_id) DO NOTHING;

-- Create faculty_notes table
CREATE TABLE IF NOT EXISTS public.faculty_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id text NOT NULL,
  faculty_id text NOT NULL,
  note text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on faculty_notes
ALTER TABLE public.faculty_notes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to faculty_notes
CREATE POLICY "Allow public read access on faculty_notes"
ON public.faculty_notes
FOR SELECT
USING (true);

-- Allow public insert access to faculty_notes
CREATE POLICY "Allow public insert access on faculty_notes"
ON public.faculty_notes
FOR INSERT
WITH CHECK (true);