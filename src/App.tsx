import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Enroll from "./pages/Enroll";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import LabDashboard from "./lab/pages/LabDashboard";
import LabProblemsList from "./lab/pages/LabProblemsList";
import LabProblem from "./lab/pages/LabProblem";
import ProtectedRoute from "./auth/ProtectedRoute";

const titles: Record<string, string> = {
  "/": "Math Math Simple - Mathlify",
  "/about": "Math Math Simple - Mathlify",
  "/courses": "Courses - Mathlify",
  "/faq": "Math Math Simple - Mathlify",
  "/contact": "Math Math Simple - Mathlify",
  "/login": "Login - Mathlify",
  "/signup": "Math Math Simple - Mathlify",
  "/enroll": "Math Math Simple - Mathlify",
  "/terms": "Math Math Simple - Mathlify",
  "/refund": "Math Math Simple - Mathlify",
};

const labTitles: Record<string, string> = {
  "/lab": "Problems List",
  "/lab/dashboard": "Dashboard",
  "/lab/problems": "Problems List",
};

function LabProblemAlias() {
  const { id } = useParams();
  return <Navigate to={id ? `/lab/problem/${id}` : "/lab/problems"} replace />;
}

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
    <div className={showSiteChrome ? "app" : undefined}>
      {showSiteChrome ? <Header /> : null}
      <main className={showSiteChrome ? "app-main" : undefined}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/enroll" element={<Enroll />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/lab" element={<Navigate to="/login" replace />} />
          <Route path="/lab/login" element={<Navigate to="/login" replace />} />
          <Route
            path="/lab/dashboard"
            element={
              <ProtectedRoute>
                <LabDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab/problems"
            element={
              <ProtectedRoute>
                <LabProblemsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab/problem/:id"
            element={
              <ProtectedRoute>
                <LabProblem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/lab/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems"
            element={
              <ProtectedRoute>
                <Navigate to="/lab/problems" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems/:id"
            element={
              <ProtectedRoute>
                <LabProblemAlias />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {showSiteChrome ? <Footer /> : null}
    </div>
  );
}
