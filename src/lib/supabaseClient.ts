import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnvidqydptynsrheplml.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudmlkcXlkcHR5bnNyaGVwbG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDY0NzgsImV4cCI6MjA4MDc4MjQ3OH0.PyvWfa9lg615Y6X3tJ5iEPjM4kDNnM5kr1RiHtoWUEc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
