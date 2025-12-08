-- ============================================================================
-- COMPREHENSIVE STUDENT RISK PREDICTION DASHBOARD SCHEMA
-- ============================================================================
-- This migration creates a complete schema with authentication, student data,
-- faculty management, performance tracking, and role-based access control

-- ============================================================================
-- 1. CREATE ENUM TYPES
-- ============================================================================
CREATE TYPE app_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE risk_level AS ENUM ('Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Late', 'Excused');

-- ============================================================================
-- 2. CREATE PROFILES TABLE (Linked to Supabase Auth)
-- ============================================================================
-- This table extends the Supabase auth.users table with additional profile info
CREATE TABLE public.profiles (
  -- User ID from Supabase authentication
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic Profile Information
  full_name TEXT,
  email TEXT UNIQUE,
  student_id TEXT UNIQUE,
  
  -- Academic Information
  department TEXT,
  semester INTEGER,
  
  -- Role Management
  role app_role DEFAULT 'student',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE USER ROLES TABLE (For flexible role management)
-- ============================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  
  UNIQUE(user_id, role)
);

-- ============================================================================
-- 4. CREATE STUDENT PERFORMANCE TABLE
-- ============================================================================
CREATE TABLE public.student_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Academic Metrics (0-100)
  attendance NUMERIC(5,2) DEFAULT 0 CHECK (attendance >= 0 AND attendance <= 100),
  avg_assignment NUMERIC(5,2) DEFAULT 0 CHECK (avg_assignment >= 0 AND avg_assignment <= 100),
  avg_quiz NUMERIC(5,2) DEFAULT 0 CHECK (avg_quiz >= 0 AND avg_quiz <= 100),
  class_interaction NUMERIC(5,2) DEFAULT 0 CHECK (class_interaction >= 0 AND class_interaction <= 100),
  
  -- Behavioral Metrics
  stress_index NUMERIC(5,2) DEFAULT 0 CHECK (stress_index >= 0 AND stress_index <= 100),
  social_media_hours NUMERIC(5,2) DEFAULT 0,
  travel_time NUMERIC(5,2) DEFAULT 0,
  
  -- Calculated Fields
  calculated_score NUMERIC(5,2),
  risk_level risk_level DEFAULT 'Medium Risk',
  prediction TEXT,
  
  -- Metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. CREATE ATTENDANCE RECORDS TABLE
-- ============================================================================
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Attendance Details
  attendance_date DATE NOT NULL,
  status attendance_status NOT NULL,
  subject TEXT,
  class_duration NUMERIC(5,2), -- in minutes
  
  -- Additional Info
  marked_by UUID REFERENCES profiles(id),
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: One record per student per date per subject
  UNIQUE(student_id, attendance_date, subject)
);

-- ============================================================================
-- 6. CREATE ASSIGNMENT SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Assignment Details
  assignment_id TEXT NOT NULL,
  assignment_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  assignment_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Submission Details
  submission_date TIMESTAMP WITH TIME ZONE,
  score NUMERIC(5,2),
  total_points NUMERIC(5,2),
  percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_points > 0 THEN (score / total_points) * 100 ELSE 0 END
  ) STORED,
  submitted BOOLEAN DEFAULT FALSE,
  late BOOLEAN DEFAULT FALSE,
  
  -- Feedback
  feedback TEXT,
  graded_by UUID REFERENCES profiles(id),
  graded_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. CREATE QUIZ RESULTS TABLE
-- ============================================================================
CREATE TABLE public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Quiz Details
  quiz_id TEXT NOT NULL,
  quiz_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  quiz_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Score Details
  score NUMERIC(5,2) NOT NULL,
  total_points NUMERIC(5,2) NOT NULL,
  percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_points > 0 THEN (score / total_points) * 100 ELSE 0 END
  ) STORED,
  
  -- Question Details
  total_questions INTEGER,
  correct_answers INTEGER,
  incorrect_answers INTEGER,
  time_spent NUMERIC(5,2), -- in minutes
  
  -- Analysis
  difficulty_level TEXT, -- 'Easy', 'Medium', 'Hard'
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. CREATE STRESS INDICATORS TABLE
-- ============================================================================
CREATE TABLE public.stress_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Stress Metrics (0-100)
  stress_score NUMERIC(5,2) NOT NULL CHECK (stress_score >= 0 AND stress_score <= 100),
  sleep_hours NUMERIC(5,2),
  exercise_frequency INTEGER, -- times per week
  social_engagement NUMERIC(5,2),
  academic_pressure NUMERIC(5,2),
  personal_issues NUMERIC(5,2),
  
  -- Mental Health Indicators
  motivation_level NUMERIC(5,2),
  focus_level NUMERIC(5,2),
  
  -- Assessment Date
  assessment_date DATE NOT NULL,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. CREATE SOCIAL MEDIA ENGAGEMENT TABLE
-- ============================================================================
CREATE TABLE public.social_media_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Daily Usage Metrics
  tracking_date DATE NOT NULL,
  hours_spent NUMERIC(5,2),
  sessions_count INTEGER,
  
  -- Platform-specific Data
  platforms TEXT[], -- array of platforms used
  primary_platform TEXT,
  
  -- Impact Assessment
  impact_on_studies NUMERIC(5,2),
  engagement_score NUMERIC(5,2),
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(student_id, tracking_date)
);

-- ============================================================================
-- 10. CREATE RISK ASSESSMENTS TABLE
-- ============================================================================
CREATE TABLE public.risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Assessment Details
  assessment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  risk_level risk_level NOT NULL,
  risk_score NUMERIC(5,2) CHECK (risk_score >= 0 AND risk_score <= 100),
  
  -- Risk Factors
  attendance_factor NUMERIC(5,2),
  academic_performance_factor NUMERIC(5,2),
  stress_factor NUMERIC(5,2),
  behavioral_factor NUMERIC(5,2),
  
  -- Recommendation
  recommended_action TEXT,
  severity TEXT, -- 'Low', 'Medium', 'High', 'Critical'
  
  -- Follow-up
  intervention_plan TEXT,
  follow_up_date DATE,
  
  -- Metadata
  assessed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. CREATE FACULTY NOTES TABLE
-- ============================================================================
CREATE TABLE public.faculty_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Note Details
  note TEXT NOT NULL,
  note_type TEXT, -- 'Observation', 'Concern', 'Positive', 'Intervention'
  subject TEXT,
  
  -- Visibility
  is_confidential BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 12. CREATE STUDENT COMMUNICATIONS TABLE
-- ============================================================================
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Message Details
  subject TEXT,
  message TEXT NOT NULL,
  message_type TEXT, -- 'Alert', 'Notification', 'Support', 'Feedback'
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 13. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_student_performance_student_id ON public.student_performance(student_id);
CREATE INDEX idx_student_performance_risk_level ON public.student_performance(risk_level);
CREATE INDEX idx_attendance_student_id ON public.attendance_records(student_id);
CREATE INDEX idx_attendance_date ON public.attendance_records(attendance_date);
CREATE INDEX idx_assignments_student_id ON public.assignment_submissions(student_id);
CREATE INDEX idx_assignments_due_date ON public.assignment_submissions(due_date);
CREATE INDEX idx_quiz_student_id ON public.quiz_results(student_id);
CREATE INDEX idx_quiz_date ON public.quiz_results(quiz_date);
CREATE INDEX idx_stress_student_id ON public.stress_indicators(student_id);
CREATE INDEX idx_stress_date ON public.stress_indicators(assessment_date);
CREATE INDEX idx_social_student_id ON public.social_media_engagement(student_id);
CREATE INDEX idx_risk_student_id ON public.risk_assessments(student_id);
CREATE INDEX idx_risk_level ON public.risk_assessments(risk_level);
CREATE INDEX idx_faculty_notes_student_id ON public.faculty_notes(student_id);
CREATE INDEX idx_faculty_notes_faculty_id ON public.faculty_notes(faculty_id);

-- ============================================================================
-- 14. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 15. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ============ PROFILES RLS ============
-- Students can only see their own profile
CREATE POLICY "Students see own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Faculty/Admin can see all profiles
CREATE POLICY "Faculty/Admin see all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============ STUDENT PERFORMANCE RLS ============
-- Students see their own performance data
CREATE POLICY "Students see own performance" ON public.student_performance
  FOR SELECT USING (student_id = auth.uid());

-- Faculty/Admin see performance data
CREATE POLICY "Faculty/Admin see performance" ON public.student_performance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- Only admins can update performance data
CREATE POLICY "Admins update performance" ON public.student_performance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============ ATTENDANCE RECORDS RLS ============
-- Students see their own attendance
CREATE POLICY "Students see own attendance" ON public.attendance_records
  FOR SELECT USING (student_id = auth.uid());

-- Faculty/Admin see all attendance
CREATE POLICY "Faculty/Admin see attendance" ON public.attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- Faculty/Admin can insert attendance
CREATE POLICY "Faculty/Admin insert attendance" ON public.attendance_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- ============ ASSIGNMENT SUBMISSIONS RLS ============
-- Students see their own submissions
CREATE POLICY "Students see own submissions" ON public.assignment_submissions
  FOR SELECT USING (student_id = auth.uid());

-- Faculty/Admin see all submissions
CREATE POLICY "Faculty/Admin see submissions" ON public.assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- ============ QUIZ RESULTS RLS ============
-- Students see their own quiz results
CREATE POLICY "Students see own quiz results" ON public.quiz_results
  FOR SELECT USING (student_id = auth.uid());

-- Faculty/Admin see all quiz results
CREATE POLICY "Faculty/Admin see quiz results" ON public.quiz_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- ============ STRESS INDICATORS RLS ============
-- Students see their own stress data
CREATE POLICY "Students see own stress data" ON public.stress_indicators
  FOR SELECT USING (student_id = auth.uid());

-- Faculty/Admin see all stress data
CREATE POLICY "Faculty/Admin see stress data" ON public.stress_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- ============ SOCIAL MEDIA ENGAGEMENT RLS ============
-- Students see their own social media data
CREATE POLICY "Students see own social media" ON public.social_media_engagement
  FOR SELECT USING (student_id = auth.uid());

-- Faculty/Admin see all social media data
CREATE POLICY "Faculty/Admin see social media" ON public.social_media_engagement
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- ============ RISK ASSESSMENTS RLS ============
-- Students see their own risk assessments
CREATE POLICY "Students see own risk assessments" ON public.risk_assessments
  FOR SELECT USING (student_id = auth.uid());

-- Faculty/Admin see all risk assessments
CREATE POLICY "Faculty/Admin see risk assessments" ON public.risk_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- Only admins can insert/update risk assessments
CREATE POLICY "Admins manage risk assessments" ON public.risk_assessments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============ FACULTY NOTES RLS ============
-- Faculty/Admin see notes
CREATE POLICY "Faculty/Admin see notes" ON public.faculty_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
    OR student_id = auth.uid()
  );

-- Faculty/Admin can add notes
CREATE POLICY "Faculty/Admin add notes" ON public.faculty_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('faculty', 'admin')
    )
  );

-- ============ COMMUNICATIONS RLS ============
-- Users see their own communications
CREATE POLICY "Users see own communications" ON public.communications
  FOR SELECT USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Users can send messages
CREATE POLICY "Users send messages" ON public.communications
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Users can mark their received messages as read
CREATE POLICY "Users update own messages" ON public.communications
  FOR UPDATE USING (recipient_id = auth.uid());

-- ============================================================================
-- 16. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = user_id LIMIT 1),
    'student'
  )
$$ LANGUAGE SQL STABLE;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role app_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1
    AND user_roles.role = $2
  )
$$ LANGUAGE SQL STABLE;

-- Function to calculate risk level based on metrics
CREATE OR REPLACE FUNCTION public.calculate_risk_level(
  attendance_val NUMERIC,
  avg_assignment_val NUMERIC,
  stress_val NUMERIC,
  social_media_val NUMERIC
)
RETURNS risk_level AS $$
DECLARE
  risk_score NUMERIC;
BEGIN
  -- Calculate weighted risk score (0-100)
  risk_score := (
    (100 - attendance_val) * 0.30 +
    (100 - avg_assignment_val) * 0.25 +
    stress_val * 0.25 +
    (social_media_val / 24) * 0.20
  );
  
  CASE
    WHEN risk_score >= 75 THEN RETURN 'Critical Risk';
    WHEN risk_score >= 50 THEN RETURN 'High Risk';
    WHEN risk_score >= 25 THEN RETURN 'Medium Risk';
    ELSE RETURN 'Low Risk';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 17. INSERT SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Note: These are sample inserts - adapt based on your actual Supabase Auth users
-- Insert sample data only after creating actual users through Supabase Auth UI

-- INSERT INTO public.profiles (
--   id, full_name, email, student_id, department, semester, role
-- ) VALUES (
--   'sample-uuid-1', 'Alex Johnson', 'alex@example.com', 'STU001', 'Computer Science', 4, 'student'
-- );

-- ============================================================================
-- 18. MIGRATION COMPLETE
-- ============================================================================
-- This migration creates a comprehensive database schema for the Student Risk
-- Prediction Dashboard with proper authentication, security policies, and
-- scalable data structure for student performance tracking.
