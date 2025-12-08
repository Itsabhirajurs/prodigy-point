# Supabase Database Schema Setup Guide

## Overview
This guide covers setting up your Supabase database schema for the Student Risk Prediction Dashboard project with proper authentication, security, and data structure.

## Database Structure

### Core Tables

#### 1. **profiles** - User Profile Information
Extends Supabase `auth.users` with application-specific fields.

```
Columns:
- id (UUID, PK, FK to auth.users)
- full_name (TEXT)
- email (TEXT, UNIQUE)
- student_id (TEXT, UNIQUE)
- department (TEXT)
- semester (INTEGER)
- role (app_role: 'student', 'faculty', 'admin')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. **user_roles** - Role Management
Flexible role assignment system allowing multiple roles per user.

```
Columns:
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- role (app_role)
- assigned_at (TIMESTAMP)
- assigned_by (UUID, FK to auth.users)
```

#### 3. **student_performance** - Performance Metrics
Aggregated student performance data with risk calculations.

```
Columns:
- id (UUID, PK)
- student_id (UUID, FK to profiles)
- attendance (0-100)
- avg_assignment (0-100)
- avg_quiz (0-100)
- class_interaction (0-100)
- stress_index (0-100)
- social_media_hours (NUMERIC)
- travel_time (NUMERIC)
- calculated_score (NUMERIC)
- risk_level (enum: Low/Medium/High/Critical Risk)
- prediction (TEXT)
- last_updated (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### 4. **attendance_records** - Granular Attendance Tracking
Daily attendance records with status tracking.

```
Columns:
- id (UUID, PK)
- student_id (UUID, FK to profiles)
- attendance_date (DATE)
- status (enum: Present/Absent/Late/Excused)
- subject (TEXT)
- class_duration (NUMERIC, minutes)
- marked_by (UUID, FK to profiles)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 5. **assignment_submissions** - Assignment Tracking
Assignment submission and grading records.

```
Columns:
- id (UUID, PK)
- student_id (UUID, FK to profiles)
- assignment_id (TEXT)
- assignment_name (TEXT)
- subject (TEXT)
- assignment_date (DATE)
- due_date (DATE)
- submission_date (TIMESTAMP)
- score (NUMERIC)
- total_points (NUMERIC)
- percentage (NUMERIC, auto-calculated)
- submitted (BOOLEAN)
- late (BOOLEAN)
- feedback (TEXT)
- graded_by (UUID, FK to profiles)
- graded_date (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 6. **quiz_results** - Quiz Performance
Quiz results and performance analytics.

```
Columns:
- id (UUID, PK)
- student_id (UUID, FK to profiles)
- quiz_id (TEXT)
- quiz_name (TEXT)
- subject (TEXT)
- quiz_date (TIMESTAMP)
- score (NUMERIC)
- total_points (NUMERIC)
- percentage (NUMERIC, auto-calculated)
- total_questions (INTEGER)
- correct_answers (INTEGER)
- incorrect_answers (INTEGER)
- time_spent (NUMERIC, minutes)
- difficulty_level (TEXT)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 7. **stress_indicators** - Mental Health & Stress Tracking
Regular stress assessments and mental health metrics.

```
Columns:
- id (UUID, PK)
- student_id (UUID, FK to profiles)
- stress_score (0-100)
- sleep_hours (NUMERIC)
- exercise_frequency (INTEGER)
- social_engagement (NUMERIC)
- academic_pressure (NUMERIC)
- personal_issues (NUMERIC)
- motivation_level (NUMERIC)
- focus_level (NUMERIC)
- assessment_date (DATE)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 8. **social_media_engagement** - Social Media Tracking
Daily social media usage and impact assessment.

```
Columns:
- id (UUID, PK)
- student_id (UUID, FK to profiles)
- tracking_date (DATE)
- hours_spent (NUMERIC)
- sessions_count (INTEGER)
- platforms (TEXT[], array)
- primary_platform (TEXT)
- impact_on_studies (NUMERIC)
- engagement_score (NUMERIC)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 9. **risk_assessments** - Risk Evaluation
Comprehensive risk assessments with intervention plans.

```
Columns:
- id (UUID, PK)
- student_id (UUID, FK to profiles)
- assessment_date (TIMESTAMP)
- risk_level (enum: Low/Medium/High/Critical Risk)
- risk_score (0-100)
- attendance_factor (NUMERIC)
- academic_performance_factor (NUMERIC)
- stress_factor (NUMERIC)
- behavioral_factor (NUMERIC)
- recommended_action (TEXT)
- severity (TEXT)
- intervention_plan (TEXT)
- follow_up_date (DATE)
- assessed_by (UUID, FK to profiles)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 10. **faculty_notes** - Observations & Feedback
Faculty observations and student notes.

```
Columns:
- id (UUID, PK)
- student_id (UUID, FK to profiles)
- faculty_id (UUID, FK to profiles)
- note (TEXT)
- note_type (TEXT: Observation/Concern/Positive/Intervention)
- subject (TEXT)
- is_confidential (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 11. **communications** - Messaging System
Message tracking between faculty and students.

```
Columns:
- id (UUID, PK)
- sender_id (UUID, FK to profiles)
- recipient_id (UUID, FK to profiles)
- subject (TEXT)
- message (TEXT)
- message_type (TEXT: Alert/Notification/Support/Feedback)
- is_read (BOOLEAN)
- read_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

---

## Setup Instructions

### Step 1: Delete Existing Data (if needed)
If you already have data in your Supabase project, you may want to back it up first, then run:

```sql
-- Drop all tables and types (WARNING: This deletes all data)
DROP TABLE IF EXISTS public.communications CASCADE;
DROP TABLE IF EXISTS public.faculty_notes CASCADE;
DROP TABLE IF EXISTS public.risk_assessments CASCADE;
DROP TABLE IF EXISTS public.social_media_engagement CASCADE;
DROP TABLE IF EXISTS public.stress_indicators CASCADE;
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.student_performance CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS app_role CASCADE;
```

### Step 2: Deploy Schema via SQL Editor

1. Go to your Supabase project: https://uldxnytimirwehoyngwj.supabase.co
2. Navigate to **SQL Editor** → **New Query**
3. Copy the entire content from `supabase/migrations/20251208_comprehensive_schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** and wait for completion

### Step 3: Verify Schema Creation

```sql
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show: 11 tables
```

### Step 4: Set Up Authentication in Supabase

1. Go to **Authentication** → **Providers**
2. Enable OAuth providers:
   - **Google** (recommended)
   - **GitHub** (optional)
3. Configure redirect URLs:
   - Local: `http://localhost:5173/`
   - Production: `your-domain.com`

### Step 5: Create Initial Admin User

```sql
-- After creating a user through Supabase Auth UI
-- Assign admin role (replace UUID with actual user ID from auth.users)

INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES ('USER-UUID-HERE', 'admin', 'USER-UUID-HERE');

-- Update profile to admin
UPDATE public.profiles 
SET role = 'admin'
WHERE id = 'USER-UUID-HERE';
```

---

## Environment Variables

Add these to your `.env.local`:

```env
VITE_SUPABASE_URL=https://uldxnytimirwehoyngwj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZHhueXRpbWlyd2Vob3luZ3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzIzNDAsImV4cCI6MjA4MDUwODM0MH0.fLMciRwM5bs6XlLzFgtC8UExnZcitqtXF3Ir7wHNu7o
```

---

## Security Best Practices

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Students can only see their own data
- ✅ Faculty/Admin have elevated access
- ✅ Sensitive data (confidential notes) protected

### Authentication
- ✅ OAuth 2.0 with Google/GitHub
- ✅ JWT token management
- ✅ Secure session storage
- ✅ Auto-refresh tokens enabled

### Database
- ✅ Foreign key constraints
- ✅ CHECK constraints on numeric fields (0-100 ranges)
- ✅ Timestamps for audit trail
- ✅ Indexes on frequently queried columns

---

## Common Queries

### Get Student Performance Overview
```sql
SELECT 
  p.full_name,
  sp.attendance,
  sp.avg_assignment,
  sp.avg_quiz,
  sp.risk_level,
  sp.last_updated
FROM public.profiles p
JOIN public.student_performance sp ON p.id = sp.student_id
WHERE p.role = 'student'
ORDER BY sp.risk_level DESC;
```

### Get Attendance Summary
```sql
SELECT 
  p.full_name,
  COUNT(*) as total_classes,
  SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) as present,
  SUM(CASE WHEN ar.status = 'Absent' THEN 1 ELSE 0 END) as absent,
  SUM(CASE WHEN ar.status = 'Late' THEN 1 ELSE 0 END) as late
FROM public.profiles p
JOIN public.attendance_records ar ON p.id = ar.student_id
GROUP BY p.id, p.full_name;
```

### Identify At-Risk Students
```sql
SELECT 
  p.full_name,
  sp.risk_level,
  sp.risk_score,
  ra.recommended_action
FROM public.profiles p
JOIN public.student_performance sp ON p.id = sp.student_id
LEFT JOIN public.risk_assessments ra ON p.id = ra.student_id
WHERE sp.risk_level IN ('High Risk', 'Critical Risk')
ORDER BY sp.risk_score DESC;
```

---

## Troubleshooting

### Issue: Foreign Key Constraint Error
**Solution:** Ensure all referenced UUIDs exist in parent tables first.

### Issue: RLS Blocking Access
**Solution:** Check user role in `user_roles` table. Admin access requires explicit role assignment.

### Issue: Permissions Denied
**Solution:** 
1. Verify user is authenticated (check `auth.uid()`)
2. Check RLS policies in table settings
3. Review role assignments in `user_roles` table

---

## Next Steps

1. **Test Authentication:** Use Login component with Google/GitHub
2. **Load Sample Data:** Insert test students and performance data
3. **Verify RLS:** Confirm students can't access other students' data
4. **Set Up Triggers:** Create update triggers for `updated_at` timestamps
5. **Configure Webhooks:** Optional - for real-time notifications

---

## Support

For issues with Supabase:
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues
