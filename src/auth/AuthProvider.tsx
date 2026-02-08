import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; session: Session | null }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      signUp: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
              {
                id: data.user.id,
                email: data.user.email ?? email,
                role: "student",
              },
              { onConflict: "id", ignoreDuplicates: true }
            );

          if (profileError) {
            throw new Error(
              "Account created, but profile setup failed. Please log in and try again."
            );
          }
        }

        return { user: data.user ?? null, session: data.session ?? null };
      },
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [loading, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
