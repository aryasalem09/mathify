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
import Pending from "./pages/Pending";
import LabDashboard from "./lab/pages/LabDashboard";
import LabProblemsList from "./lab/pages/LabProblemsList";
import LabProblem from "./lab/pages/LabProblem";
import LabAssignments from "./lab/pages/LabAssignments";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./admin/RequireAdmin";
import AdminOverview from "./admin/pages/AdminOverview";
import AdminStudents from "./admin/pages/AdminStudents";
import AdminAssignments from "./admin/pages/AdminAssignments";
import AdminSubmissions from "./admin/pages/AdminSubmissions";
import AdminGrades from "./admin/pages/AdminGrades";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminStudentDetail from "./admin/pages/AdminStudentDetail";

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
  "/pending": "Awaiting Approval - Mathlify",
};

const labTitles: Record<string, string> = {
  "/lab": "Problems List",
  "/lab/dashboard": "Dashboard",
  "/lab/problems": "Problems List",
  "/lab/assignments": "Assignments",
};

function LabProblemAlias() {
  const { id } = useParams();
  return <Navigate to={id ? `/lab/problem/${id}` : "/lab/problems"} replace />;
}

export default function App() {
  const { pathname } = useLocation();
  const showSiteChrome =
    !pathname.startsWith("/lab") && !pathname.startsWith("/admin");

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
          <Route
            path="/pending"
            element={
              <RequireAuth allowPending>
                <Pending />
              </RequireAuth>
            }
          />
          <Route
            path="/lab"
            element={
              <RequireAuth>
                <Navigate to="/lab/dashboard" replace />
              </RequireAuth>
            }
          />
          <Route path="/lab/login" element={<Navigate to="/login" replace />} />
          <Route
            path="/lab/dashboard"
            element={
              <RequireAuth>
                <LabDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/lab/problems"
            element={
              <RequireAuth>
                <LabProblemsList />
              </RequireAuth>
            }
          />
          <Route
            path="/lab/assignments"
            element={
              <RequireAuth>
                <LabAssignments />
              </RequireAuth>
            }
          />
          <Route
            path="/lab/problem/:id"
            element={
              <RequireAuth>
                <LabProblem />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Navigate to="/lab/dashboard" replace />
              </RequireAuth>
            }
          />
          <Route
            path="/problems"
            element={
              <RequireAuth>
                <Navigate to="/lab/problems" replace />
              </RequireAuth>
            }
          />
          <Route
            path="/problems/:id"
            element={
              <RequireAuth>
                <LabProblemAlias />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminOverview />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/students"
            element={
              <RequireAdmin>
                <AdminStudents />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <RequireAdmin>
                <AdminAssignments />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <RequireAdmin>
                <AdminSubmissions />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/grades"
            element={
              <RequireAdmin>
                <AdminGrades />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RequireAdmin>
                <AdminSettings />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/student/:id"
            element={
              <RequireAdmin>
                <AdminStudentDetail />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
      {showSiteChrome ? <Footer /> : null}
    </div>
  );
}
