import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Signup from "./pages/Signup";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import LabLogin from "./lab/pages/LabLogin";
import LabDashboard from "./lab/pages/LabDashboard";
import LabProblemsList from "./lab/pages/LabProblemsList";
import LabProblem from "./lab/pages/LabProblem";
import LabGuard from "./lab/components/LabGuard";

const titles: Record<string, string> = {
  "/": "Math Math Simple - Mathlify",
  "/about": "Math Math Simple - Mathlify",
  "/courses": "Courses - Mathlify",
  "/faq": "Math Math Simple - Mathlify",
  "/contact": "Math Math Simple - Mathlify",
  "/signup": "Math Math Simple - Mathlify",
  "/terms": "Math Math Simple - Mathlify",
  "/refund": "Math Math Simple - Mathlify",
};

const labTitles: Record<string, string> = {
  "/lab": "Problems List",
  "/lab/login": "Codify Lab Platform",
  "/lab/dashboard": "Dashboard",
  "/lab/problems": "Problems List",
};

export default function App() {
  const { pathname } = useLocation();
  const showSiteChrome = !pathname.startsWith("/lab");

  useEffect(() => {
    if (pathname.startsWith("/lab/problem/")) {
      document.title = "Problem";
      return;
    }

    if (labTitles[pathname]) {
      document.title = labTitles[pathname];
      return;
    }

    document.title = titles[pathname] ?? titles["/"];
  }, [pathname]);

  return (
    <>
      {showSiteChrome ? <Header /> : null}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/lab" element={<Navigate to="/lab/login" replace />} />
        <Route path="/lab/login" element={<LabLogin />} />
        <Route
          path="/lab/dashboard"
          element={
            <LabGuard>
              <LabDashboard />
            </LabGuard>
          }
        />
        <Route
          path="/lab/problems"
          element={
            <LabGuard>
              <LabProblemsList />
            </LabGuard>
          }
        />
        <Route
          path="/lab/problem/:id"
          element={
            <LabGuard>
              <LabProblem />
            </LabGuard>
          }
        />
      </Routes>
      {showSiteChrome ? <Footer /> : null}
    </>
  );
}
