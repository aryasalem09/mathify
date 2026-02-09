import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

type RequireAuthProps = {
  children: ReactNode;
  allowPending?: boolean;
};

export default function RequireAuth({ children, allowPending }: RequireAuthProps) {
  const { session, loading, profile, profileLoading } = useAuth();
  const location = useLocation();
  const isApproved =
    profile?.role === "student" || profile?.role === "admin";

  if (loading || profileLoading) {
    return (
      <section className="section auth-section">
        <div className="auth-card">
          <h2>Loading</h2>
          <p>Please wait while we verify your session.</p>
        </div>
      </section>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowPending && !isApproved) {
    return <Navigate to="/pending" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
