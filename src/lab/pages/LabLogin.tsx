import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import "../lab.css";

export default function LabLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate("/lab/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lab-root">
      <main className="lab-container">
        <div className="lab-auth-card">
          <div className="lab-auth-header">
            <p className="lab-eyebrow">Mathify Labs</p>
            <h1>Welcome back</h1>
            <p className="lab-auth-subtitle">
              Log in to access practice problems and weekly homework.
            </p>
          </div>
          <form action="/api/lab/login" method="POST" onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              required
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button className="lab-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
            {error ? <p className="lab-error" role="alert">{error}</p> : null}
          </form>
        </div>
      </main>
    </div>
  );
}

