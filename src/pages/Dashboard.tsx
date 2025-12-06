import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Login from "./Login"; // Make sure the path is correct!

function Dashboard() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Set session on auth state change
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );
    // Get session immediately on mount
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // If the user is NOT logged in, show the Login page instead
  if (!session) {
    return <Login />;
  }

  // If user is logged in, show the dashboard
  return <div>Welcome! (show dashboard data here)</div>;
}

export default Dashboard;
