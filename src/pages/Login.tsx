import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  return (
    <div style={{ maxWidth: 400, margin: "auto", marginTop: "10vh" }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google', 'github']} // Remove or add providers as you want
      />
    </div>
  );
}
