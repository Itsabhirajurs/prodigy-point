# Authentication & User Management Guide

## Overview

Your application now has a complete authentication system using Supabase with signup and login pages.

## Features Implemented

### 1. **Signup Page** (`src/pages/Signup.tsx`)
- Email and password registration
- User profile creation with:
  - Full name
  - Student ID
  - Department selection
  - Semester selection
- Form validation
- Error handling
- Success feedback
- Automatic redirect to login after signup

### 2. **Login Page** (`src/pages/Login.tsx`)
- Email/password authentication
- Form validation
- Error handling
- Role-based navigation (Student → Dashboard, Faculty/Admin → Admin Dashboard)
- Link to signup for new users

### 3. **Authentication Hook** (`src/hooks/useAuth.ts`)
- `useAuth()` hook for managing authentication state
- Sign up, sign in, and sign out functions
- User profile fetching
- Role checking (student, faculty, admin)
- Loading and error states

### 4. **Database Integration**
All authentication data is stored in your Supabase database with proper security:
- `profiles` table - User information
- `user_roles` table - Role assignments
- Row-level security policies

---

## How It Works

### Signup Flow

```
User fills signup form
    ↓
Validate form data
    ↓
Create Supabase Auth user
    ↓
Create user profile in DB
    ↓
Assign 'student' role
    ↓
Redirect to login
```

### Login Flow

```
User enters email/password
    ↓
Authenticate with Supabase Auth
    ↓
Fetch user profile from DB
    ↓
Check user role
    ↓
Navigate to appropriate dashboard
```

---

## Usage Examples

### Using the useAuth Hook

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, profile, isAuthenticated, isFaculty, signOut } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
      <p>Role: {profile?.role}</p>
      {isFaculty && <AdminPanel />}
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Creating a Protected Route

```tsx
function ProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, profile } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
```

---

## Signup Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Name | Text | Yes | User's full name |
| Email | Email | Yes | Unique identifier for login |
| Student ID | Text | Yes | Unique student identifier |
| Department | Select | Yes | Academic department |
| Semester | Select | Yes | Current semester (1-8) |
| Password | Password | Yes | Min 6 characters |
| Confirm Password | Password | Yes | Must match password |

---

## Error Handling

The signup and login pages handle the following errors:

1. **Validation Errors**
   - Missing required fields
   - Invalid email format
   - Password too short
   - Passwords don't match

2. **Database Errors**
   - Email already registered
   - Student ID already exists
   - Database connection issues

3. **Authentication Errors**
   - Invalid credentials
   - User not found
   - Account creation failed

---

## Security Features

### 1. **Row Level Security (RLS)**
All user data is protected:
- Students can only see their own profile and data
- Faculty/Admins have elevated access
- Unauthorized access is blocked at database level

### 2. **Password Management**
- Passwords hashed by Supabase Auth
- Never transmitted in plain text
- Minimum 6 characters required
- Confirmation required on signup

### 3. **Session Management**
- Automatic token refresh
- Secure session storage
- Auto-logout on session expiration
- CSRF protection

### 4. **Input Validation**
- All inputs validated on client-side first
- Server-side validation in database
- SQL injection prevention via Supabase
- XSS protection

---

## User Roles

The system supports three roles:

### 1. **Student** (Default)
- Can view own performance data
- Can see recommendations
- Can update own profile settings
- Cannot access other student data

### 2. **Faculty**
- Can view all student performance data
- Can add notes to students
- Can mark attendance
- Can grade assignments
- Access to faculty dashboard

### 3. **Admin**
- Full system access
- Can manage users and roles
- Can view all data
- Can modify system settings
- Access to admin dashboard

---

## Testing the Authentication

### Test Signup
1. Navigate to `/signup`
2. Fill in all required fields:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Student ID: "STU999"
   - Department: "Computer Science"
   - Semester: "4th Semester"
   - Password: "password123"
3. Click "Create Account"
4. Should see success message
5. Redirect to login page

### Test Login
1. Navigate to `/` (login page)
2. Enter email: "test@example.com"
3. Enter password: "password123"
4. Click "Sign In"
5. Should navigate to `/dashboard`

### Test Role-Based Access
1. Create student account → see student dashboard
2. Create admin account (manually in Supabase) → see admin dashboard
3. Try accessing `/admin/dashboard` as student → redirect to student dashboard

---

## File Structure

```
src/
├── pages/
│   ├── Login.tsx          # Login page
│   ├── Signup.tsx         # Signup page
│   └── Dashboard.tsx      # Protected route
├── hooks/
│   ├── useAuth.ts         # Authentication hook
│   └── use-mobile.tsx     # Other hooks
├── context/
│   └── StudentContext.tsx # Student data context
├── lib/
│   └── supabaseClient.ts  # Supabase config
└── integrations/
    └── supabase/
        ├── client.ts      # Supabase client
        └── types.ts       # Type definitions
```

---

## Troubleshooting

### Issue: "Email already registered"
**Solution:** Use a different email address or reset password via forgot password flow

### Issue: Can't see profile after signup
**Solution:** Check that profile was created in Supabase `profiles` table

### Issue: Login redirect not working
**Solution:** Ensure user role is set in `profiles.role` column

### Issue: Getting CORS errors
**Solution:** 
1. Check Supabase project URL matches `VITE_SUPABASE_URL`
2. Ensure redirect URLs are configured in Supabase Auth settings

---

## Next Steps

1. **Add Forgot Password**
   ```tsx
   const resetPassword = async (email: string) => {
     await supabase.auth.resetPasswordForEmail(email);
   };
   ```

2. **Add Email Verification**
   ```tsx
   // Check in Supabase Auth settings
   // Enable email confirmation
   ```

3. **Add OAuth (Google, GitHub)**
   ```tsx
   await supabase.auth.signInWithOAuth({
     provider: 'google',
   });
   ```

4. **Add Multi-Factor Authentication (MFA)**
   ```tsx
   // Available in Supabase pro plan
   ```

---

## API Reference

### useAuth Hook

```typescript
const {
  user,                    // Current auth user
  profile,                 // User profile from DB
  loading,                 // Is loading
  error,                   // Error state
  signUp,                  // Sign up function
  signIn,                  // Sign in function
  signOut,                 // Sign out function
  isAuthenticated,         // Is user logged in
  isFaculty,              // Is faculty or admin
  isAdmin                 // Is admin
} = useAuth();
```

### Sign Up Function

```typescript
await signUp(
  email: string,
  password: string,
  {
    full_name: string,
    student_id: string,
    department: string,
    semester: number
  }
);
```

### Sign In Function

```typescript
await signIn(
  email: string,
  password: string
);
```

---

## Best Practices

1. **Always check authentication before rendering protected content**
2. **Use try-catch blocks for auth operations**
3. **Show loading states during auth operations**
4. **Don't store sensitive data in localStorage manually**
5. **Validate input on both client and server**
6. **Use environment variables for Supabase keys**
7. **Log out users on token expiration**
8. **Refresh user data after profile updates**

---

## Support

For issues with authentication:
- Check Supabase logs in project dashboard
- Review console for error messages
- Verify environment variables are set
- Check database policies for RLS issues
