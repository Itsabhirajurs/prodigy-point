# 🚀 Quick Start Guide - Authentication

## What You Get

✅ **Complete Authentication System** with Signup & Login  
✅ **Supabase Integration** for secure data storage  
✅ **Role-Based Access Control** (Student, Faculty, Admin)  
✅ **Responsive Design** (Mobile, Tablet, Desktop)  
✅ **Form Validation** and Error Handling  
✅ **Session Management** with Auto-Refresh  

---

## 5-Minute Setup

### Step 1: Verify Environment Variables
Check your `.env.local` file has:
```env
VITE_SUPABASE_URL=https://uldxnytimirwehoyngwj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Create Test Account
1. Open `http://localhost:5173/signup`
2. Fill the form:
   - Name: "Test Student"
   - Email: "test@example.com"
   - Student ID: "STU001"
   - Department: "Computer Science"
   - Semester: "4"
   - Password: "Test@123456"
3. Click "Create Account"

### Step 4: Login
1. You'll be redirected to login
2. Or go to `http://localhost:5173/`
3. Enter your email and password
4. Click "Sign In"
5. See the dashboard!

---

## File Locations

```
Login & Signup:
  src/pages/Login.tsx
  src/pages/Signup.tsx

Hooks & Utils:
  src/hooks/useAuth.ts
  src/lib/authUtils.ts

Configuration:
  src/lib/supabaseClient.ts
  AUTHENTICATION_GUIDE.md

Routes:
  src/App.tsx (search for "Signup import")
```

---

## Key URLs

| Page | URL | Who Can Access |
|------|-----|---|
| Login | `/` | Everyone |
| Signup | `/signup` | Everyone |
| Dashboard | `/dashboard` | Logged-in students |
| Admin | `/admin/dashboard` | Faculty/Admin |

---

## Using in Your Code

### Check if User is Logged In
```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, profile } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <div>Welcome {profile?.full_name}!</div>;
}
```

### Logout
```tsx
import { signOutUser } from '@/lib/authUtils';

function LogoutButton() {
  const handleLogout = async () => {
    await signOutUser();
    navigate('/');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Check User Role
```tsx
const { isFaculty, isAdmin } = useAuth();

if (isFaculty) {
  // Show faculty features
}

if (isAdmin) {
  // Show admin features
}
```

---

## Common Tasks

### Add Logout Button to Navigation
```tsx
import { signOutUser } from '@/lib/authUtils';
import { useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOutUser();
    navigate('/');
  };

  return (
    <button onClick={handleLogout} className="...">
      Logout
    </button>
  );
}
```

### Update User Profile
```tsx
import { updateUserProfile } from '@/lib/authUtils';

async function updateName(newName: string) {
  try {
    const updated = await updateUserProfile({ 
      full_name: newName 
    });
    console.log('Updated:', updated);
  } catch (error) {
    console.error('Failed to update:', error);
  }
}
```

### Check Email Availability (Before Signup)
```tsx
import { checkEmailExists } from '@/lib/authUtils';

async function validateEmail(email: string) {
  const exists = await checkEmailExists(email);
  if (exists) {
    setError('Email already registered');
  }
}
```

---

## Testing Scenarios

### Test 1: Basic Signup
```
✓ Go to /signup
✓ Fill form with valid data
✓ See success message
✓ Get redirected to login
```

### Test 2: Basic Login
```
✓ Go to /
✓ Enter email and password
✓ Click "Sign In"
✓ See dashboard page
```

### Test 3: Error Handling
```
✓ Try login with wrong password → Error message
✓ Try signup with existing email → Error message
✓ Try submit with empty fields → Error message
✓ Try short password → Error message
```

### Test 4: Session Persistence
```
✓ Login to account
✓ Refresh page (F5)
✓ Still logged in ✓
✓ Close browser
✓ Reopen → Still logged in ✓
```

### Test 5: Role-Based Navigation
```
✓ Login as student → /dashboard
✓ Logout
✓ Login as admin (manually set in DB) → /admin/dashboard
```

---

## Database Verification

### Check Profiles Table
Go to Supabase Dashboard → Tables → profiles

You should see your signup data:
- `id` (UUID from auth.users)
- `full_name` (what you entered)
- `email` (what you entered)
- `student_id` (what you entered)
- `department` (what you selected)
- `semester` (what you selected)
- `role` ('student' by default)

### Check user_roles Table
Should have entries mapping user_id to 'student' role.

---

## Troubleshooting

### "Email already registered"
- Use a different email
- Or check Supabase auth users in Authentication → Users

### Can't see profile after signup
- Check `profiles` table in Supabase
- Verify user ID matches auth.users

### Login page doesn't redirect
- Check user role in `profiles` table
- Verify role is 'student', 'faculty', or 'admin'

### Session not persisting
- Check browser localStorage enabled
- Check browser privacy/incognito mode off

### Form validation errors
- Check all required fields filled
- Email must have @ symbol
- Password must be 6+ characters

---

## Security Notes

🔒 **Never:**
- Store passwords in localStorage
- Log sensitive data to console
- Commit .env files with secrets
- Share API keys publicly

✅ **Always:**
- Use HTTPS in production
- Validate on both client and server
- Check user permissions in backend
- Use environment variables

---

## Next Steps

1. **Test the authentication** - Create account, login, logout
2. **Add logout button** - To navbar/header
3. **Customize theme** - Update colors in component CSS
4. **Connect student data** - Load student performance after login
5. **Add more fields** - Department, semester, etc.

---

## Documentation

For more details, see:
- `AUTHENTICATION_GUIDE.md` - Detailed guide
- `AUTHENTICATION_SETUP.md` - Full setup steps
- `AUTHENTICATION_UI_GUIDE.md` - Visual design guide
- `AUTHENTICATION_IMPLEMENTATION.md` - Implementation details

---

## Need Help?

### Check the Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### Check Supabase
1. Go to Supabase Dashboard
2. Check Authentication → Users
3. Check Tables → profiles for user data
4. Check Logs for any database errors

### Common Error Messages
- "Email already registered" → Use different email
- "Invalid credentials" → Wrong email/password
- "Cannot find module" → Run `npm install`
- "CORS error" → Check Supabase redirect URLs

---

## Quick Reference

```tsx
// Import auth hook
import { useAuth } from '@/hooks/useAuth';

// Use in component
const { 
  isAuthenticated,    // boolean
  profile,            // UserProfile object
  isFaculty,         // boolean
  isAdmin,           // boolean
  signIn,            // async function
  signOut,           // async function
} = useAuth();

// Check auth in protected routes
if (!isAuthenticated) return <Navigate to="/" />;

// Check role
if (profile?.role === 'student') { /* ... */ }
if (isFaculty) { /* ... */ }
if (isAdmin) { /* ... */ }
```

---

## Version Info

- React: 18.3.1
- Supabase: 2.86.2
- TypeScript: Latest
- Tailwind: Latest
- shadcn/ui: Latest

---

**Status:** ✅ Ready to Use  
**Last Updated:** December 8, 2025  
**Questions?** Check AUTHENTICATION_GUIDE.md

🎉 You're all set! Start testing now!
