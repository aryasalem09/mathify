import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import type { AdminProfile, Assignment, Grade, Submission } from "../types";

type ProgressRow = {
  problem_id: string;
  status: string;
  score: number | null;
  updated_at: string | null;
};

export default function AdminStudentDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStudent = async () => {
      if (!id) return;
      try {
        const [profileRes, progressRes, submissionsRes, gradesRes, assignmentsRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("id, email, role, created_at")
              .eq("id", id)
              .single(),
            supabase
              .from("user_lab_progress")
              .select("problem_id, status, score, updated_at")
              .eq("user_id", id)
              .eq("lab_id", "mathify-labs"),
            supabase
              .from("submissions")
              .select("*")
              .eq("user_id", id)
              .order("created_at", { ascending: false }),
            supabase
              .from("grades")
              .select("*")
              .eq("user_id", id)
              .order("created_at", { ascending: false }),
            supabase.from("assignments").select("*").order("created_at", {
              ascending: false,
            }),
          ]);

        if (!isMounted) return;

        if (profileRes.error) throw profileRes.error;
        if (progressRes.error) throw progressRes.error;
        if (submissionsRes.error) throw submissionsRes.error;
        if (gradesRes.error) throw gradesRes.error;
        if (assignmentsRes.error) throw assignmentsRes.error;

        setProfile(profileRes.data as AdminProfile);
        setProgress((progressRes.data ?? []) as ProgressRow[]);
        setSubmissions((submissionsRes.data ?? []) as Submission[]);
        setGrades((gradesRes.data ?? []) as Grade[]);
        setAssignments((assignmentsRes.data ?? []) as Assignment[]);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load student.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    loadStudent();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const completedProblems = progress.filter(
    (row) => row.status === "completed"
  );
  const completionCount = completedProblems.length;
  const lastUpdated = useMemo(() => {
    if (progress.length === 0) return null;
    const dates = progress
      .map((row) => (row.updated_at ? new Date(row.updated_at) : null))
      .filter((value): value is Date => value !== null);
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }, [progress]);

  const assignedAssignments = useMemo(() => {
    if (!id) return [];
    return assignments.filter((assignment) => {
      if (assignment.assigned_to === "all") return true;
      if (assignment.assigned_to === "selected") {
        return assignment.assigned_user_ids?.includes(id) ?? false;
      }
      return false;
    });
  }, [assignments, id]);

  const submissionAssignmentIds = new Set(
    submissions
      .map((submission) => submission.assignment_id)
      .filter((value): value is string => Boolean(value))
  );

  return (
    <AdminLayout
      title="Student detail"
      subtitle="Progress, submissions, and grades in one view."
    >
      {error ? <div className="admin-card">{error}</div> : null}

      {isLoading ? (
        <div className="admin-card">Loading student...</div>
      ) : !profile ? (
        <div className="admin-card">Student not found.</div>
      ) : (
        <>
          <div className="admin-card">
            <h3 className="admin-section-title">Profile</h3>
            <p className="admin-subtle">Use this view to understand a student's progress before you meet with them.</p>
            <p className="admin-subtle">Email: {profile.email ?? "-"}</p>
            <p className="admin-subtle">Role: {profile.role ?? "-"}</p>
            <p className="admin-subtle">
              Joined: {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "-"}
            </p>
            <Link className="admin-button ghost" to="/admin/students">
              Back to students
            </Link>
          </div>

          <div className="admin-grid admin-grid-2" style={{ marginTop: 16 }}>
            <div className="admin-card">
              <h3 className="admin-section-title">Lab progress</h3>
              <p className="admin-subtle">
                Completed problems: {completionCount}
              </p>
              <p className="admin-subtle">
                Last update: {lastUpdated ? lastUpdated.toLocaleString() : "-"}
              </p>
              {completedProblems.length === 0 ? (
                <div className="admin-empty">No completions yet.</div>
              ) : (
                <ul className="admin-subtle" style={{ margin: 0, paddingLeft: 16 }}>
                  {completedProblems.map((row) => (
                    <li key={row.problem_id}>Problem {row.problem_id}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="admin-card">
              <h3 className="admin-section-title">Assignments</h3>
              {assignedAssignments.length === 0 ? (
                <div className="admin-empty">No assignments yet.</div>
              ) : (
                <ul className="admin-subtle" style={{ margin: 0, paddingLeft: 16 }}>
                  {assignedAssignments.map((assignment) => (
                    <li key={assignment.id}>
                      {assignment.title} —{" "}
                      {submissionAssignmentIds.has(assignment.id)
                        ? "Submitted"
                        : "Not started"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="admin-grid admin-grid-2" style={{ marginTop: 16 }}>
            <div className="admin-card">
              <h3 className="admin-section-title">Submissions</h3>
              {submissions.length === 0 ? (
                <div className="admin-empty">No submissions yet.</div>
              ) : (
                <ul className="admin-subtle" style={{ margin: 0, paddingLeft: 16 }}>
                  {submissions.map((submission) => (
                    <li key={submission.id}>
                      {submission.assignment_id ? "Assignment" : "Lab"} — Problem{" "}
                      {submission.problem_id ?? "-"} on{" "}
                      {submission.created_at
                        ? new Date(submission.created_at).toLocaleDateString()
                        : "-"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="admin-card">
              <h3 className="admin-section-title">Grades</h3>
              {grades.length === 0 ? (
                <div className="admin-empty">No grades yet.</div>
              ) : (
                <ul className="admin-subtle" style={{ margin: 0, paddingLeft: 16 }}>
                  {grades.map((grade) => (
                    <li key={grade.id}>
                      {grade.assignment_id ? "Assignment" : "Lab"} — Score{" "}
                      {grade.score ?? "-"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

