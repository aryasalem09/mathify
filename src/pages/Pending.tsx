import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Pending() {
  const navigate = useNavigate();
  const {
    session,
    user,
    loading,
    profileLoading,
    isApproved,
    role,
    signOut,
  } = useAuth();

  if (loading || profileLoading) {
    return (
      <section className="section auth-section">
        <div className="auth-card">
          <h2>Loading</h2>
          <p>Please wait while we verify your account.</p>
        </div>
      </section>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (isApproved) {
    return <Navigate to={role === "admin" ? "/admin" : "/lab/dashboard"} replace />;
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <section className="section auth-section">
      <div className="auth-card">
        <header className="auth-header">
          <p className="auth-eyebrow">Mathify</p>
          <h2>Awaiting approval</h2>
          <p className="auth-subtitle">
            Your account is created, but an admin still needs to approve lab access.
          </p>
        </header>
        <p className="auth-subtitle">
          Signed in as {user?.email ?? "your account"}.
        </p>
        <button className="cta-button auth-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </section>
  );
}
