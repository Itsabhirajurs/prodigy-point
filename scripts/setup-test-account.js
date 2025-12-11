#!/usr/bin/env node

/**
 * Test Account Setup Script
 * Creates a test student account in Supabase
 * 
 * Usage: node scripts/setup-test-account.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lgklsnigfpatcatwgnum.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxna2xzbmlnZnBhdGNhdHdnbnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDIyMDEwOTksImV4cCI6MTczNzc2OTA5OX0.8uHjFRKPVKWMH1PV46yfMglqpGGPvjDaZT6rPKDjHDY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST_ACCOUNTS = [
  {
    email: 'student@example.com',
    password: 'Test@123456',
    full_name: 'Test Student',
    role: 'student',
    department: 'CSE',
    student_id: 'STU001',
  },
  {
    email: 'faculty@example.com',
    password: 'Test@123456',
    full_name: 'Test Faculty',
    role: 'faculty',
    department: 'CSE',
  },
  {
    email: 'admin@example.com',
    password: 'Test@123456',
    full_name: 'Test Admin',
    role: 'admin',
    department: 'CSE',
  },
];

async function setupAccounts() {
  console.log('🚀 Starting test account setup...\n');

  for (const account of TEST_ACCOUNTS) {
    try {
      console.log(`📝 Creating account for ${account.email}...`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            full_name: account.full_name,
            role: account.role,
            department: account.department,
          },
        },
      });

      if (authError) {
        console.error(`   ❌ Auth error: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        console.error('   ❌ No user returned from sign up');
        continue;
      }

      console.log(`   ✅ Auth user created: ${authData.user.id}`);

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: account.email,
          full_name: account.full_name,
          role: account.role,
          department: account.department,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error(`   ❌ Profile error: ${profileError.message}`);
        continue;
      }

      console.log(`   ✅ Profile created`);

      // If student, create student record
      if (account.role === 'student') {
        const { error: studentError } = await supabase
          .from('students')
          .upsert({
            id: authData.user.id,
            student_id: account.student_id,
            name: account.full_name,
            email: account.email,
            department: account.department,
            semester: '3',
            attendance: 75,
            avg_assignment: 80,
            avg_quiz: 78,
            stress_index: 45,
            social_media_hours: 2.5,
            travel_time: 30,
            class_interaction: 70,
            updated_at: new Date().toISOString(),
          });

        if (studentError) {
          console.error(`   ❌ Student record error: ${studentError.message}`);
          continue;
        }

        console.log(`   ✅ Student record created`);
      }

      console.log(
        `\n✅ Account ready!\n   Email: ${account.email}\n   Password: ${account.password}\n   Role: ${account.role}\n`
      );
    } catch (error) {
      console.error(`❌ Unexpected error for ${account.email}:`, error);
    }
  }

  console.log('🎉 Setup complete!\n');
  console.log('Test accounts created:');
  TEST_ACCOUNTS.forEach(acc => {
    console.log(`  - ${acc.email} (${acc.role})`);
  });
}

setupAccounts().catch(console.error);
