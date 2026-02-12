import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import "../admin.css";

type AdminLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const navItems = [
  { label: "Overview", to: "/admin" },
  { label: "Students", to: "/admin/students" },
  { label: "Assignments", to: "/admin/assignments" },
  { label: "Submissions", to: "/admin/submissions" },
  { label: "Grades", to: "/admin/grades" },
  { label: "Settings", to: "/admin/settings" },
];

export default function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-brand">Mathify Admin</div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? " is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <div className="admin-topbar-actions">
            <Link className="admin-button ghost" to="/lab/dashboard">
              Back to labs
            </Link>
            {user?.email ? <span className="admin-email">{user.email}</span> : null}
            <button className="admin-button secondary" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
