import type { ReactNode } from "react";
import LabSubNav from "./LabSubNav";
import { useAuth } from "../../auth/AuthProvider";
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
  const { user, loading } = useAuth();

  const statusLabel = loading
    ? "Checking session..."
    : user?.email
    ? `Signed in as ${user.email}`
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
            <LabSubNav />
            <div className="lab-status">{statusLabel}</div>
          </div>
        </div>
      </header>
      <main className="lab-container">{children}</main>
    </div>
  );
}
