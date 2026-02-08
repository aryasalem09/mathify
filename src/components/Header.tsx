import { Link, useLocation } from "react-router-dom";

const defaultLogo = "/Images/mathlify_logo.png";
const termsLogo = "/Images/mathlify_logo_full_white.png";

export default function Header() {
  const { pathname } = useLocation();
  const logoSrc = pathname === "/terms" ? termsLogo : defaultLogo;

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
            <Link to="/lab/login" role="menuitem">
              Labs
            </Link>
          </div>
        </div>
      </nav>
      <Link to="/signup" className="nav-button">
        Get a Free Trial Class!
      </Link>
    </header>
  );
}
