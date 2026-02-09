import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../../lib/supabase";

type OverviewStats = {
  students: number;
  pending: number;
  assignments: number;
  submissions: number;
  grades: number;
};

const emptyStats: OverviewStats = {
  students: 0,
  pending: 0,
  assignments: 0,
  submissions: 0,
  grades: 0,
};

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats>(emptyStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const [studentsRes, pendingRes, assignmentsRes, submissionsRes, gradesRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .eq("role", "student"),
            supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .eq("role", "pending"),
            supabase
              .from("assignments")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("submissions")
              .select("id", { count: "exact", head: true }),
            supabase.from("grades").select("id", { count: "exact", head: true }),
          ]);

        if (!isMounted) return;

        if (
          studentsRes.error ||
          pendingRes.error ||
          assignmentsRes.error ||
          submissionsRes.error ||
          gradesRes.error
        ) {
          throw (
            studentsRes.error ||
            pendingRes.error ||
            assignmentsRes.error ||
            submissionsRes.error ||
            gradesRes.error
          );
        }

        setStats({
          students: studentsRes.count ?? 0,
          pending: pendingRes.count ?? 0,
          assignments: assignmentsRes.count ?? 0,
          submissions: submissionsRes.count ?? 0,
          grades: gradesRes.count ?? 0,
        });
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load overview.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AdminLayout
      title="Overview"
      subtitle="Quick glance at your students and class activity."
    >
      {error ? (
        <div className="admin-card">
          <p className="admin-subtle">{error}</p>
        </div>
      ) : null}

      <div className="admin-card">
        <h3 className="admin-section-title">Welcome</h3>
        <p className="admin-subtle">
          Use this dashboard to approve students, create assignments, review
          submissions, and leave grades.
        </p>
      </div>

      <div className="admin-grid admin-grid-3">
        <div className="admin-card">
          <h3 className="admin-section-title">Students</h3>
          <p className="admin-subtle">
            {isLoading ? "Loading..." : `${stats.students} active`}
          </p>
          <Link className="admin-button" to="/admin/students">
            Manage students
          </Link>
        </div>
        <div className="admin-card">
          <h3 className="admin-section-title">Pending approvals</h3>
          <p className="admin-subtle">
            {isLoading ? "Loading..." : `${stats.pending} awaiting review`}
          </p>
          <Link className="admin-button" to="/admin/students">
            Review now
          </Link>
        </div>
        <div className="admin-card">
          <h3 className="admin-section-title">Assignments</h3>
          <p className="admin-subtle">
            {isLoading ? "Loading..." : `${stats.assignments} total`}
          </p>
          <Link className="admin-button" to="/admin/assignments">
            Create assignment
          </Link>
        </div>
      </div>

      <div className="admin-grid admin-grid-2" style={{ marginTop: 16 }}>
        <div className="admin-card">
          <h3 className="admin-section-title">Submissions</h3>
          <p className="admin-subtle">
            {isLoading ? "Loading..." : `${stats.submissions} submitted`}
          </p>
          <Link className="admin-button ghost" to="/admin/submissions">
            View submissions
          </Link>
        </div>
        <div className="admin-card">
          <h3 className="admin-section-title">Grades</h3>
          <p className="admin-subtle">
            {isLoading ? "Loading..." : `${stats.grades} graded items`}
          </p>
          <Link className="admin-button ghost" to="/admin/grades">
            Review grades
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
