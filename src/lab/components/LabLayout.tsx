import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api";
import LabSubNav from "./LabSubNav";
import { useLabSession } from "../hooks/useLabSession";
import "../lab.css";

type LabLayoutProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  children: ReactNode;
};

export default function LabLayout({
  title,
  subtitle,
  meta,
  children,
}: LabLayoutProps) {
  const navigate = useNavigate();
  const { authState, user, error, setGuest } = useLabSession();
  const navState = authState === "error" ? "guest" : authState;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setGuest();
      navigate("/lab/login");
    }
  };

  const statusLabel =
    authState === "loading"
      ? "Checking session..."
      : authState === "authed" && user
      ? `Signed in as ${user.username}`
      : authState === "error"
      ? error ?? "Session unavailable"
      : "Not signed in";

  return (
    <div className="lab-root">
      <header className="lab-header">
        <div className="lab-header-inner">
          <div className="lab-title-block">
            <p className="lab-eyebrow">Mathify Labs</p>
            <h1>{title}</h1>
            {subtitle ? <p className="lab-subtitle">{subtitle}</p> : null}
            {meta ? <div className="lab-meta">{meta}</div> : null}
          </div>
          <div className="lab-header-actions">
            <LabSubNav authState={navState} onLogout={handleLogout} />
            <div className="lab-status">{statusLabel}</div>
          </div>
        </div>
      </header>
      <main className="lab-container">{children}</main>
    </div>
  );
}
