import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

type LocationState = {
  from?: { pathname: string };
};

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from =
    (location.state as LocationState | null)?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const { session, user } = await signUp(email, password);
      if (session) {
        navigate(from, { replace: true });
        return;
      }
      if (user) {
        setSuccessMessage("Account created. Please log in.");
        return;
      }
      setError("Sign up failed. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="section auth-section">
        <div className="auth-card">
          <header className="auth-header">
            <p className="auth-eyebrow">Mathify</p>
            <h2>Create your account</h2>
            <p className="auth-subtitle">
              Sign up with email and password to unlock the lab dashboard.
            </p>
          </header>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label" htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label className="auth-label" htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              className="auth-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="cta-button auth-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
            {error ? <p className="auth-error">{error}</p> : null}
          </form>
          {successMessage ? (
            <p className="auth-footer">
              {successMessage} <Link to="/login">Log in</Link>
            </p>
          ) : (
            <p className="auth-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
