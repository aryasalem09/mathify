import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const defaultLogo = "/Images/mathlify_logo.png";
const termsLogo = "/Images/mathlify_logo_full_white.png";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const logoSrc = pathname === "/terms" ? termsLogo : defaultLogo;
  const labsPath = user ? "/lab/dashboard" : "/login";
  const ctaLabel = user ? "Go to Labs" : "Get a Free Trial Class!";
  const ctaPath = user ? "/lab/dashboard" : "/signup";

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/");
    }
  };

  return (
    <header>
      <Link to="/" className="logo">
        <img src={logoSrc} alt="Mathlify Logo" />
      </Link>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contact">Contact</Link>
        <div className="nav-dropdown">
          <span className="nav-link" aria-haspopup="true">
            Students
          </span>
          <div className="nav-dropdown-menu" role="menu">
            <Link to={labsPath} role="menuitem">
              Labs
            </Link>
          </div>
        </div>
      </nav>
      <div className="header-actions">
        {user?.email ? <span className="nav-user">{user.email}</span> : null}
        {user ? (
          <>
            <button className="nav-link-button" type="button" onClick={handleLogout}>
              Logout
            </button>
            <Link to={ctaPath} className="nav-button">
              {ctaLabel}
            </Link>
          </>
        ) : (
          <>
            <Link to={ctaPath} className="nav-button">
              {ctaLabel}
            </Link>
            <Link to="/login" className="nav-link-button nav-auth-button">
              Login
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
