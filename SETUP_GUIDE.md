# Prodigy Point Setup Guide

## Overview
This guide will help you set up the complete admin-faculty-student workflow for Prodigy Point.

## Database Setup

### Step 1: Apply RLS Migration

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the file `supabase/migrations/20251208_fix_rls_admin.sql`
5. Copy the entire content and paste it into the SQL Editor
6. Click **Run** (or press F5)
7. Verify that you see "Success. No rows returned"

This migration:
- Fixes RLS policies to allow admin user creation
- Creates the `admin_create_profile()` function with SECURITY DEFINER
- Adds policies for faculty and students table inserts

### Step 2: Create Initial Admin Account

You need to create your first admin account manually in Supabase:

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create New User**
3. Fill in:
   - Email: `admin@prodigypoint.com` (or your preferred email)
   - Password: Create a secure password
   - Auto Confirm User: ✓ (check this)
4. Click **Create User**
5. Copy the **User UID** from the newly created user

6. Go to **SQL Editor** and run:
```sql
-- Insert admin profile
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  'PASTE_YOUR_USER_UID_HERE',
  'admin@prodigypoint.com',
  'Admin User',
  'admin',
  NOW(),
  NOW()
);
```

Replace `PASTE_YOUR_USER_UID_HERE` with the actual UUID from step 5.

### Step 3: Verify Admin Setup

1. Log out of your app (if logged in)
2. Go to the login page
3. Sign in with your admin credentials
4. You should be redirected to `/admin/users` (User Management page)

## Adding Faculty and Students

### Adding Faculty Members

1. Log in as admin
2. Go to **User Management** page
3. Click **Add Faculty**
4. Fill in the form:
   - **Email**: faculty email (e.g., `faculty01@prodigypoint.com`)
   - **Password**: temporary password (faculty can change later)
   - **Full Name**: faculty member's name
   - **Faculty ID**: Must be in format `FAC###` (e.g., `FAC001`, `FAC002`, `FAC010`)
   - **Department**: Select from dropdown
   - **Specialization**: Optional field
5. Click **Create Faculty Account**

**Important**: Faculty ID must follow the pattern `FAC` followed by at least 3 digits.

### Adding Students

1. In the User Management page, click the **Students** tab
2. Click **Add Student**
3. Fill in the form:
   - **Email**: student email (e.g., `student01@prodigypoint.com`)
   - **Password**: temporary password (student can change later)
   - **Full Name**: student's name
   - **Student ID**: Must be in format `STU###` (e.g., `STU001`, `STU002`, `STU010`)
   - **Department**: Select from dropdown
   - **Semester**: Select from 1-8
4. Click **Create Student Account**

**Important**: Student ID must follow the pattern `STU` followed by at least 3 digits.

## User Flows

### Admin Flow
- **Login** → Redirected to User Management (`/admin/users`)
- Can view admin dashboard with statistics
- Can manage faculty and students (create/delete)
- Can view all faculty and students
- Can access settings

### Faculty Flow
- **Login** → Redirected to Faculty Dashboard (`/admin/dashboard`)
- Can view student overview with risk distribution
- Can update student performance data (coming soon)
- Can add notes for students (coming soon)
- Can access settings

### Student Flow
- **Login** → Redirected to Student Dashboard (`/dashboard`)
- Can view their own performance metrics (read-only)
- Can view recommendations
- Can view overall performance trends
- Can access settings

## Troubleshooting

### Issue: "new row violates row-level security policy"
**Solution**: Make sure you've applied the RLS migration from Step 1.

### Issue: Faculty/Student ID format error
**Solution**: 
- Faculty IDs must be `FAC###` (e.g., FAC001, FAC025, FAC100)
- Student IDs must be `STU###` (e.g., STU001, STU025, STU100)
- The UI will auto-uppercase your input

### Issue: Can't log in as admin
**Solution**: 
1. Verify the admin profile exists in the `profiles` table
2. Check that the `role` is set to `'admin'`
3. Clear browser cache and localStorage
4. Try logging in again

### Issue: Logout not working
**Solution**: This has been fixed. Make sure you're using the latest code.

## Next Steps

After setup is complete:

1. ✅ Admin can create faculty and students
2. ✅ Faculty can log in and see dashboard
3. ✅ Students can log in and see their data
4. 🔄 Implement faculty ability to update student performance
5. 🔄 Add faculty notes feature
6. 🔄 Enhance student dashboard with live data
7. 🔄 Add password reset functionality

## Security Notes

- Admin credentials should be kept secure
- Faculty and students should change their temporary passwords on first login
- All database operations are protected by RLS policies
- The `admin_create_profile()` function uses SECURITY DEFINER to bypass RLS only for trusted operations

## Support

For issues or questions, refer to the main README.md or contact the development team.
