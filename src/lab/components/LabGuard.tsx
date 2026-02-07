import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, me } from "../api";
import "../lab.css";

type LabGuardProps = {
  children: ReactNode;
};

type GuardState = "loading" | "authed" | "error";

export default function LabGuard({ children }: LabGuardProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<GuardState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    me()
      .then(() => {
        if (!isMounted) return;
        setState("authed");
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate("/lab/login", { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to verify login.");
        setState("error");
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (state === "loading") {
    return (
      <div className="lab-root">
        <main>Loading...</main>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="lab-root">
        <main>{error}</main>
      </div>
    );
  }

  return <>{children}</>;
}

