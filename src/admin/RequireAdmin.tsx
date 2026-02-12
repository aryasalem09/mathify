import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

type RequireAdminProps = {
  children: ReactNode;
};

type GuardState = "loading" | "allowed" | "denied" | "pending" | "error";

export default function RequireAdmin({ children }: RequireAdminProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, session, role, refreshProfile } = useAuth();
  const [state, setState] = useState<GuardState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!session) {
        navigate("/login", { replace: true, state: { from: location } });
        return;
      }

      try {
        const profile = await refreshProfile();
        if (!isMounted) return;

        const resolvedRole = profile?.role ?? role;
        if (resolvedRole === "admin") {
          setState("allowed");
          return;
        }

        if (resolvedRole === "student") {
          setState("denied");
          return;
        }

        setState("pending");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Unable to verify access.");
        setState("error");
      }
    };

    if (!loading) {
      run();
    }

    return () => {
      isMounted = false;
    };
  }, [loading, location, navigate, refreshProfile, role, session]);

  useEffect(() => {
    if (state !== "denied") return;
    const timeoutId = window.setTimeout(() => {
      navigate("/lab/dashboard", {
        replace: true,
        state: { notice: "Admin access required." },
      });
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [navigate, state]);

  useEffect(() => {
    if (state !== "pending") return;
    const timeoutId = window.setTimeout(() => {
      navigate("/pending", {
        replace: true,
        state: { notice: "Awaiting approval." },
      });
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [navigate, state]);

  if (loading || state === "loading") {
    return (
      <section className="section auth-section">
        <div className="auth-card">
          <h2>Loading</h2>
          <p>Please wait while we verify your admin access.</p>
        </div>
      </section>
    );
  }

  if (state === "denied") {
    return (
      <section className="section auth-section">
        <div className="auth-card">
          <h2>Admin access required</h2>
          <p>You don't have access to this area. Redirecting you to labs.</p>
          <button
            className="cta-button"
            type="button"
            onClick={() => navigate("/lab/dashboard", { replace: true })}
          >
            Back to labs
          </button>
        </div>
      </section>
    );
  }

  if (state === "pending") {
    return (
      <section className="section auth-section">
        <div className="auth-card">
          <h2>Awaiting approval</h2>
          <p>Your account still needs approval. Redirecting you now.</p>
          <button
            className="cta-button"
            type="button"
            onClick={() => navigate("/pending", { replace: true })}
          >
            Go to pending page
          </button>
        </div>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className="section auth-section">
        <div className="auth-card">
          <h2>Something went wrong</h2>
          <p>{error ?? "Unable to verify admin access."}</p>
          <button
            className="cta-button"
            type="button"
            onClick={() => navigate("/lab/dashboard", { replace: true })}
          >
            Back to labs
          </button>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}

