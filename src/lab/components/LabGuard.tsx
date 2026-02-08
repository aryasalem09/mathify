import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, me } from "../api";
import { useAuth } from "../../auth/AuthProvider";
import "../lab.css";

type LabGuardProps = {
  children: ReactNode;
};

type GuardState = "loading" | "authed" | "blocked" | "error";

export default function LabGuard({ children }: LabGuardProps) {
  const navigate = useNavigate();
  const { loading: authLoading, role, refreshProfile } = useAuth();
  const [state, setState] = useState<GuardState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        await me();
        await refreshProfile();

        if (!isMounted) return;

        // if role is still null/pending, block by default
        if (role !== "student" && role !== "admin") {
          setState("blocked");
          return;
        }

        setState("authed");
      } catch (err) {
        if (!isMounted) return;

        if (err instanceof ApiError && err.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(err instanceof Error ? err.message : "Failed to verify login.");
        setState("error");
      }
    };

    if (!authLoading) run();

    return () => {
      isMounted = false;
    };
  }, [authLoading, navigate, refreshProfile, role]);

  if (state === "loading") {
    return (
        <div className="lab-root">
          <main className="lab-container">
            <div className="lab-card">Loading lab session...</div>
          </main>
        </div>
    );
  }

  if (state === "blocked") {
    return (
        <div className="lab-root">
          <main className="lab-container">
            <div className="lab-card">
              <h3 style={{ marginTop: 0 }}>Awaiting approval</h3>
              <p style={{ marginBottom: 0 }}>
                Your account is created, but you don’t have lab access yet.
                Ask an admin to approve you.
              </p>
            </div>
          </main>
        </div>
    );
  }

  if (state === "error") {
    return (
        <div className="lab-root">
          <main className="lab-container">
            <div className="lab-card">{error}</div>
          </main>
        </div>
    );
  }

  return <>{children}</>;
}