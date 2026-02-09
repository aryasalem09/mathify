import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

type LocationState = {
  from?: { pathname: string };
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as LocationState | null)?.from?.pathname ?? "";
  const safeFrom =
    from && from !== "/login" && from !== "/signup" && from !== "/pending"
      ? from
      : "";

  const resolveRedirect = (role: string | null) => {
    if (role === "admin") {
      return safeFrom.startsWith("/admin") ? safeFrom : "/admin";
    }
    if (role === "student") {
      return safeFrom.startsWith("/lab") ? safeFrom : "/lab/dashboard";
    }
    return "/pending";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await signIn(email, password);

      const profile = await refreshProfile();
      navigate(resolveRedirect(profile?.role ?? null), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <section className="section auth-section">
        <div className="auth-card">
          <header className="auth-header">
            <p className="auth-eyebrow">Mathify</p>
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Log in to access your dashboard and lab problems.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label" htmlFor="login-email">
              Email
            </label>
            <input
                id="login-email"
                className="auth-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
            />

            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <input
                id="login-password"
                className="auth-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />

            <button className="cta-button auth-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {error ? <p className="auth-error">{error}</p> : null}
          </form>

          <p className="auth-footer">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </section>
  );
}
