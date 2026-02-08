import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const { pathname } = useLocation();
  const isTerms = pathname === "/terms";
  const isRefund = pathname === "/refund";

  return (
    <footer className="footer">
      <p className="footer-copy">© 2026 Mathlify. All Rights Reserved.</p>

      <p className="footer-links">
        {!isTerms && <Link to="/terms">Terms of Service</Link>}
        {!isRefund && <Link to="/refund">Refund Policy</Link>}
        <span>Contact Us:</span>
        <a href="mailto:mathlifytutoring@gmail.com">mathlifytutoring@gmail.com</a>
      </p>
    </footer>
  );
}
