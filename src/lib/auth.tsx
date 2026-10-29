import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

type Profile = {
  username: string | null;
  phone: string | null;
  status_message: string;
  availability: "Free" | "Busy" | "Away" | "Offline";
} | null;
type AuthCtx = {
  session: Session | null;
  profile: Profile;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const userId = session?.user.id;

  async function refreshProfile() {
    if (!userId) return;

    const { data } = await supabase
      .from("profiles")
      .select("username, phone, status_message, availability")
      .eq("id", userId)
      .maybeSingle();

    setProfile(data);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setLoading(true);
    refreshProfile().finally(() => setLoading(false));
  }, [userId]);

  return (
    <Ctx.Provider value={{ session, profile, loading, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
