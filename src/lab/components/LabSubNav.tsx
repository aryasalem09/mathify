import { NavLink, Link } from "react-router-dom";
import type { AuthState } from "../hooks/useLabSession";
import "../lab.css";

type LabSubNavProps = {
  authState: AuthState;
  onLogout: () => void;
};

export default function LabSubNav({ authState, onLogout }: LabSubNavProps) {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `lab-subnav-link${isActive ? " is-active" : ""}`;

  return (
    <nav className="lab-subnav">
      <Link className="lab-subnav-link" to="/">
        Back to Mathify
      </Link>
      {authState === "authed" ? (
        <>
          <NavLink className={navClass} to="/lab/dashboard">
            Dashboard
          </NavLink>
          <NavLink className={navClass} to="/lab/problems">
            Problems
          </NavLink>
          <button className="lab-subnav-link" type="button" onClick={onLogout}>
            Logout
          </button>
        </>
      ) : null}
      {authState === "guest" ? (
        <NavLink className={navClass} to="/lab/login">
          Login
        </NavLink>
      ) : null}
    </nav>
  );
}

