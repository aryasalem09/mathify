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

export type UserRole = "pending" | "student" | "admin";

type AuthContextValue = {
    session: Session | null;
    user: User | null;
    role: UserRole | null;
    loading: boolean;
    signUp: (
        email: string,
        password: string
    ) => Promise<{ user: User | null; session: Session | null }>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    const loadRole = async (u: User | null) => {
        if (!u) {
            setRole(null);
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", u.id)
            .single();

        if (error) {
            // if we can't read the role for some reason, default to pending (safest)
            console.warn("failed to load role:", error.message);
            setRole("pending");
            return;
        }

        const r = (data?.role as UserRole | undefined) ?? "pending";
        setRole(r);
    };

    useEffect(() => {
        let isMounted = true;

        supabase.auth
            .getSession()
            .then(async ({ data }) => {
                if (!isMounted) return;
                const s = data.session ?? null;
                const u = s?.user ?? null;
                setSession(s);
                setUser(u);
                await loadRole(u);
                setLoading(false);
            })
            .catch(() => {
                if (!isMounted) return;
                setSession(null);
                setUser(null);
                setRole(null);
                setLoading(false);
            });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, nextSession) => {
                const s = nextSession ?? null;
                const u = nextSession?.user ?? null;
                setSession(s);
                setUser(u);
                await loadRole(u);
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
            role,
            loading,
            refreshProfile: async () => {
                await loadRole(user);
            },
            signUp: async (email, password) => {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;

                const u = data.user ?? null;
                const s = data.session ?? null;

                // best-effort upsert (trigger should create the profile)
                if (u) {
                    const { error: profileError } = await supabase
                        .from("profiles")
                        .upsert({ id: u.id, email: u.email ?? email }, { onConflict: "id" });

                    if (profileError) {
                        console.warn("profile upsert failed (ignored):", profileError.message);
                    }

                    await loadRole(u);
                }

                return { user: u, session: s };
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
        [loading, role, session, user]
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