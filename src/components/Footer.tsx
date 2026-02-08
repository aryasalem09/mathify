import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const { pathname } = useLocation();
  const isTerms = pathname === "/terms";
  const isRefund = pathname === "/refund";

  let links = (
    <>
      {" "}| <Link to="/terms">Terms of Service</Link> |{" "}
      <Link to="/refund">Refund Policy</Link>
    </>
  );

  if (isTerms) {
    links = (
      <>
        {" "}| <Link to="/refund">Refund Policy</Link>
      </>
    );
  }

  if (isRefund) {
    links = (
      <>
        {" "}| <Link to="/terms">Terms of Service</Link>
      </>
    );
  }

  return (
    <footer className="footer">
      <p>&copy; 2025 Mathlify. All Rights Reserved.{links}</p>
    </footer>
  );
}
