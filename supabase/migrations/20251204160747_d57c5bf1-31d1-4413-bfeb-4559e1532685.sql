-- Create student_data table for the predictive insight dashboard
CREATE TABLE public.student_data (
  student_id text PRIMARY KEY,
  name text NOT NULL,
  department text NOT NULL,
  semester text NOT NULL,
  attendance int NOT NULL DEFAULT 0 CHECK (attendance >= 0 AND attendance <= 100),
  avg_assignment int NOT NULL DEFAULT 0 CHECK (avg_assignment >= 0 AND avg_assignment <= 100),
  avg_quiz int NOT NULL DEFAULT 0 CHECK (avg_quiz >= 0 AND avg_quiz <= 100),
  stress_index int NOT NULL DEFAULT 0 CHECK (stress_index >= 0 AND stress_index <= 100),
  social_media_hours float NOT NULL DEFAULT 0,
  travel_time int NOT NULL DEFAULT 0,
  class_interaction int NOT NULL DEFAULT 0 CHECK (class_interaction >= 0 AND class_interaction <= 100),
  score float DEFAULT 0,
  risk_level text DEFAULT 'Medium Risk',
  prediction text DEFAULT 'Needs Support',
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (public read for demo, but secure pattern)
ALTER TABLE public.student_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes (no auth required)
CREATE POLICY "Allow public read access" ON public.student_data
  FOR SELECT USING (true);

-- Allow public update for demo purposes
CREATE POLICY "Allow public update access" ON public.student_data
  FOR UPDATE USING (true);

-- Insert sample student data for demonstration
INSERT INTO public.student_data (student_id, name, department, semester, attendance, avg_assignment, avg_quiz, stress_index, social_media_hours, travel_time, class_interaction)
VALUES 
  ('STU001', 'Alex Johnson', 'Computer Science', 'Fall 2024', 85, 78, 82, 45, 2.5, 30, 75),
  ('STU002', 'Sarah Williams', 'Engineering', 'Fall 2024', 72, 65, 58, 78, 4.5, 45, 42),
  ('STU003', 'Michael Chen', 'Mathematics', 'Fall 2024', 92, 88, 91, 32, 1.5, 20, 88),
  ('STU004', 'Emily Davis', 'Physics', 'Fall 2024', 68, 72, 55, 85, 5.0, 60, 35),
  ('STU005', 'James Brown', 'Computer Science', 'Fall 2024', 78, 82, 76, 55, 3.0, 35, 65);