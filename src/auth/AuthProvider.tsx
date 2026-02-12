import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type UserRole = "admin" | "student" | "pending" | "blocked" | string;

type Profile = {
    id: string;
    role: UserRole | null;
    email: string | null;
};

type AuthContextValue = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    profile: Profile | null;
    role: UserRole | null;
    isApproved: boolean;
    profileLoading: boolean;
    refreshProfile: () => Promise<Profile | null>;
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
    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        const timeoutId = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            setLoading(false);
        }, 6000);

        const settleLoading = () => {
            window.clearTimeout(timeoutId);
            if (!isMountedRef.current) return;
            setLoading(false);
        };

        // on refresh, supabase restores session async. we must wait for it.
        (async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (!isMountedRef.current) return;

                if (error) {
                    // keep it simple: still allow app to render, just treat as signed out
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setProfileLoading(false);
                    settleLoading();
                    return;
                }

                setSession(data.session ?? null);
                setUser(data.session?.user ?? null);
                setProfileLoading(Boolean(data.session?.user));
                settleLoading();
            } catch {
                if (!isMountedRef.current) return;
                setSession(null);
                setUser(null);
                setProfile(null);
                setProfileLoading(false);
                settleLoading();
            }
        })();

        // listeners
        const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
            if (!isMountedRef.current) return;
            setSession(newSession);
            setUser(newSession?.user ?? null);
            if (!newSession?.user) {
                setProfile(null);
                setProfileLoading(false);
            } else {
                setProfileLoading(true);
            }
            settleLoading();
        });

        return () => {
            isMountedRef.current = false;
            sub.subscription.unsubscribe();
            window.clearTimeout(timeoutId);
        };
    }, []);

    const refreshProfile = useCallback(async () => {
        let resolvedUser = user;
        if (!resolvedUser) {
            const { data } = await supabase.auth.getSession();
            resolvedUser = data.session?.user ?? null;
        }

        if (!resolvedUser) {
            setProfile(null);
            setProfileLoading(false);
            return null;
        }

        setProfileLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("id, role, email")
            .eq("id", resolvedUser.id)
            .maybeSingle();

        if (error) {
            setProfile(null);
            setProfileLoading(false);
            return null;
        }

        if (!data) {
            const fallbackProfile = {
                id: resolvedUser.id,
                role: "pending" as UserRole,
                email: resolvedUser.email ?? null,
            };
            setProfile(fallbackProfile);
            setProfileLoading(false);
            return fallbackProfile;
        }

        setProfile(data as Profile);
        setProfileLoading(false);
        return data as Profile;
    }, [user]);

    useEffect(() => {
        if (!user) {
            setProfile(null);
            setProfileLoading(false);
            return;
        }

        refreshProfile().catch(() => {
            // keep auth usable even if profile fetch fails
        });
    }, [refreshProfile, user]);

    const value = useMemo<AuthContextValue>(
        () => ({
            session,
            user,
            loading,
            profile,
            role: profile?.role ?? null,
            isApproved:
                profile?.role === "student" || profile?.role === "admin",
            profileLoading,
            refreshProfile,
            signUp: async (email: string, password: string) => {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                return { user: data.user ?? null, session: data.session ?? null };
            },
            signIn: async (email: string, password: string) => {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            },
            signOut: async () => {
                try {
                    const { error } = await supabase.auth.signOut({ scope: "local" });
                    if (error) throw error;
                } finally {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setProfileLoading(false);
                    setLoading(false);
                }
            },
        }),
        [session, user, loading, profile, profileLoading, refreshProfile]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}