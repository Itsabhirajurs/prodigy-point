import { supabase } from '@/lib/supabaseClient';

/**
 * Sign out the current user
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: {
  full_name?: string;
  department?: string;
  semester?: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
}

/**
 * Change user password
 */
export async function changePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error };
  }
}

/**
 * Request password reset email
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error };
  }
}

/**
 * Verify user email
 */
export async function resendVerificationEmail(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { success: false, error };
  }
}

/**
 * Get user role
 */
export async function getUserRole() {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.role || 'student';
  } catch (error) {
    console.error('Get role error:', error);
    return 'student';
  }
}

/**
 * Check if user is faculty or admin
 */
export async function isFacultyOrAdmin() {
  const role = await getUserRole();
  return role === 'faculty' || role === 'admin';
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const role = await getUserRole();
  return role === 'admin';
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: 'google' | 'github') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('OAuth error:', error);
    return { success: false, error };
  }
}

/**
 * Check if email exists
 */
export async function checkEmailExists(email: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Check email error:', error);
    return false;
  }
}

/**
 * Check if student ID exists
 */
export async function checkStudentIdExists(studentId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Check student ID error:', error);
    return false;
  }
}
