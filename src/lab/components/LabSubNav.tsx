import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import "../lab.css";

export default function LabSubNav() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const isAuthed = Boolean(user);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `lab-subnav-link${isActive ? " is-active" : ""}`;

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/login");
    }
  };

  return (
    <nav className="lab-subnav">
      <Link className="lab-subnav-link" to="/">
        Back to Mathify
      </Link>
      {isAuthed ? (
        <>
          <NavLink className={navClass} to="/lab/dashboard">
            Dashboard
          </NavLink>
          <NavLink className={navClass} to="/lab/problems">
            Problems
          </NavLink>
          <button className="lab-subnav-link" type="button" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : null}
      {!isAuthed && !loading ? (
        <NavLink className={navClass} to="/login">
          Login
        </NavLink>
      ) : null}
    </nav>
  );
}
