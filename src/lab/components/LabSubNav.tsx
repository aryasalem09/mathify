import { useEffect, useState, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, logout, me } from "../api";

type AuthState = "loading" | "authed" | "guest";

export default function LabSubNav() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let isMounted = true;
    me()
      .then(() => {
        if (!isMounted) return;
        setAuthState("authed");
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err instanceof ApiError && err.status === 401) {
          setAuthState("guest");
        } else {
          setAuthState("guest");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    try {
      await logout();
    } finally {
      navigate("/lab/login");
      setAuthState("guest");
    }
  };

  return (
    <nav className="lab-subnav">
      <Link to="/">Back to Mathify</Link>
      {authState === "authed" ? (
        <>
          <Link to="/lab/dashboard">Dashboard</Link>
          <Link to="/lab/problems">Problems</Link>
          <a href="/lab/login" onClick={handleLogout}>
            Logout
          </a>
        </>
      ) : null}
      {authState === "guest" ? <Link to="/lab/login">Login</Link> : null}
    </nav>
  );
}

