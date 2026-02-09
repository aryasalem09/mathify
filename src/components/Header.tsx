import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

const defaultLogo = "/Images/mathlify_logo.png";
const termsLogo = "/Images/mathlify_logo_full_white.png";

export default function Header() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { session, user, role, isApproved, signOut } = useAuth();

    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    const logoSrc = pathname === "/terms" ? termsLogo : defaultLogo;

    const isAuthed = !!session;

    const ctaLabel = isAuthed
        ? isApproved
            ? "Go to Labs"
            : "Awaiting approval"
        : "Get a Free Trial Class!";
    const ctaPath = isAuthed ? (isApproved ? "/lab/dashboard" : "/pending") : "/signup";

    const closeMobileMenu = () => setMobileMenuOpen(false);

    // close menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await signOut();
        } finally {
            closeMobileMenu();
            navigate("/", { replace: true });
        }
    };

    return (
        <header className="site-header">
            <Link to="/" className="logo" aria-label="Mathlify home">
                <img src={logoSrc} alt="Mathlify Logo" />
            </Link>

            {/* Desktop nav */}
            <nav className="nav-desktop" aria-label="Primary">
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/courses">Courses</Link>
            </nav>

            {/* Desktop actions */}
            <div className="header-actions nav-desktop">
                {user?.email ? <span className="nav-user">{user.email}</span> : null}

                {isAuthed ? (
                    <>
                        {role === "admin" ? (
                            <Link to="/admin" className="nav-link-button">
                                Admin
                            </Link>
                        ) : null}
                        <button
                            className="nav-link-button"
                            type="button"
                            onClick={handleLogout}
                        >
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

            {/* Mobile hamburger */}
            <button
                type="button"
                className="nav-toggle hamburger"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
            >
                <span />
                <span />
                <span />
            </button>

            {/* Mobile menu */}
            <div
                className={`nav-mobile ${mobileMenuOpen ? "open" : ""}`}
                role="dialog"
                aria-label="Mobile menu"
            >
                <Link to="/" onClick={closeMobileMenu}>
                    Home
                </Link>
                <Link to="/about" onClick={closeMobileMenu}>
                    About
                </Link>
                <Link to="/courses" onClick={closeMobileMenu}>
                    Courses
                </Link>

                <div className="mobile-actions">
                    {user?.email ? <div className="nav-user">{user.email}</div> : null}

                    {isAuthed ? (
                        <>
                            {role === "admin" ? (
                                <Link
                                    to="/admin"
                                    className="nav-link-button"
                                    onClick={closeMobileMenu}
                                >
                                    Admin
                                </Link>
                            ) : null}
                            <button
                                className="nav-link-button"
                                type="button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>

                            <Link
                                to={ctaPath}
                                className="nav-button mobile-cta"
                                onClick={closeMobileMenu}
                            >
                                {ctaLabel}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to={ctaPath}
                                className="nav-button mobile-cta"
                                onClick={closeMobileMenu}
                            >
                                {ctaLabel}
                            </Link>

                            <Link
                                to="/login"
                                className="nav-link-button nav-auth-button"
                                onClick={closeMobileMenu}
                            >
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
