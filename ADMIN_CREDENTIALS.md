# 🔐 ADMIN CREDENTIALS

## Default Admin Account

**Created:** December 8, 2025  
**Platform:** Student Risk Prediction System

---

## Login Details

```
Email:    admin@prodigypoint.com
Password: Admin@123456
Role:     admin
```

---

## How to Create Admin Account

### Step 1: Create Auth User in Supabase Dashboard

1. Go to your Supabase project: https://fnvidqydptynsrheplml.supabase.co
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter:
   - **Email:** `admin@prodigypoint.com`
   - **Password:** `Admin@123456`
   - **Auto Confirm User:** ✅ Yes
5. Click **Create User**
6. **Copy the User ID** (UUID) from the created user

### Step 2: Insert Profile Record

Go to **SQL Editor** in Supabase and run:

```sql
-- Replace 'USER_ID_HERE' with the actual UUID from Step 1
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'USER_ID_HERE',  -- Paste the user ID you copied
  'admin@prodigypoint.com',
  'System Administrator',
  'admin'
);
```

### Step 3: Verify Admin Account

Run this query to verify:

```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
WHERE p.email = 'admin@prodigypoint.com';
```

You should see one row with role = 'admin'.

---

## Quick Create Script

If you want to do it all in one go, run this in SQL Editor:

```sql
-- Note: You need to create the auth user in Supabase Dashboard first
-- Then get the user_id and use it below

DO $$
DECLARE
  admin_user_id UUID := 'PASTE_USER_ID_HERE'; -- Replace with actual user ID
BEGIN
  -- Insert profile
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    admin_user_id,
    'admin@prodigypoint.com',
    'System Administrator',
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Admin account created successfully';
END $$;
```

---

## Testing the Admin Account

1. Go to the login page: `http://localhost:8080/`
2. Enter email: `admin@prodigypoint.com`
3. Enter password: `Admin@123456`
4. Click **Sign In**
5. You should be redirected to `/admin/dashboard`

---

## Admin Capabilities

Once logged in as admin, you can:

✅ **User Management** (`/admin/users`)
- Add faculty members (email, password, name, ID, department)
- Add students (email, password, name, ID, department, semester)
- Delete faculty and students
- View all users

✅ **Dashboard** (`/admin/dashboard`)
- View all students
- See risk distribution
- Monitor at-risk students

✅ **Student Details** (`/admin/student/:id`)
- View individual student performance
- See faculty notes

✅ **Settings** (`/admin/settings`)
- Account information
- System settings

---

## Security Notes

⚠️ **IMPORTANT:**
1. **Change the default password** after first login
2. Store admin credentials securely
3. Do not share admin credentials with faculty or students
4. Admin has full access to create/delete users
5. Only admins can create faculty accounts
6. Only admins can create student accounts (faculty can only update performance data)

---

## Additional Admin Users

To create more admin accounts:

1. Follow the same steps above
2. Change the email to a different address
3. Set role = 'admin' in the profiles table

---

## Troubleshooting

### "Email already registered"
- The email is already in use
- Use a different email address

### "Profile not found" after login
- Run Step 2 again to insert the profile
- Make sure the user_id matches the auth.users id

### Can't access admin pages
- Verify role is set to 'admin' in profiles table:
  ```sql
  SELECT role FROM profiles WHERE email = 'admin@prodigypoint.com';
  ```
- Should return 'admin', not 'student' or 'faculty'

### Password reset needed
- Go to login page
- Click "Forgot your password?"
- Enter admin email
- Check email for reset link

---

## Contact

For support or issues:
- Check Supabase logs: **Logs & Analytics** → **Auth Logs**
- Verify RLS policies are enabled
- Check database migrations are applied

---

**Created by:** GitHub Copilot  
**Date:** December 8, 2025  
**Status:** ✅ Ready to Use
