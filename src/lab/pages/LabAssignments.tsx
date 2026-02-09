import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LabLayout from "../components/LabLayout";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../auth/AuthProvider";
import "../lab.css";

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  type: string;
  problem_ids: number[];
  assigned_to: string;
  assigned_user_ids: string[] | null;
};

type SubmissionRow = {
  assignment_id: string | null;
};

type GradeRow = {
  assignment_id: string | null;
};

export default function LabAssignments() {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      if (!userId) {
        setAssignments([]);
        setSubmissions([]);
        setGrades([]);
        setIsLoading(false);
        return;
      }

      const assignmentFilter = `assigned_to.eq.all,and(assigned_to.eq.selected,assigned_user_ids.cs.{${userId}})`;
      try {
        const [assignmentsRes, submissionsRes, gradesRes] = await Promise.all([
          supabase
            .from("assignments")
            .select(
              "id, title, description, due_date, type, problem_ids, assigned_to, assigned_user_ids"
            )
            .or(assignmentFilter)
            .order("due_date", { ascending: true }),
          supabase
            .from("submissions")
            .select("assignment_id")
            .eq("user_id", userId),
          supabase
            .from("grades")
            .select("assignment_id")
            .eq("user_id", userId),
        ]);

        if (!isMounted) return;

        if (assignmentsRes.error) throw assignmentsRes.error;
        if (submissionsRes.error) throw submissionsRes.error;
        if (gradesRes.error) throw gradesRes.error;

        const rawAssignments = (assignmentsRes.data ?? []) as Assignment[];
        const visibleAssignments = rawAssignments.filter((assignment) => {
          if (assignment.assigned_to === "all") return true;
          if (assignment.assigned_to === "selected") {
            return assignment.assigned_user_ids?.includes(userId) ?? false;
          }
          return false;
        });

        setAssignments(visibleAssignments);
        setSubmissions((submissionsRes.data ?? []) as SubmissionRow[]);
        setGrades((gradesRes.data ?? []) as GradeRow[]);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load assignments.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const submissionAssignmentIds = useMemo(() => {
    return new Set(
      submissions
        .map((row) => row.assignment_id)
        .filter((value): value is string => Boolean(value))
    );
  }, [submissions]);

  const gradedAssignmentIds = useMemo(() => {
    return new Set(
      grades
        .map((row) => row.assignment_id)
        .filter((value): value is string => Boolean(value))
    );
  }, [grades]);

  const getStatus = (assignmentId: string) => {
    if (gradedAssignmentIds.has(assignmentId)) return "Graded";
    if (submissionAssignmentIds.has(assignmentId)) return "Submitted";
    return "Not started";
  };

  return (
    <LabLayout
      title="Assignments"
      subtitle="See what is due and submit your work in one place."
    >
      <div className="lab-card">
        <p className="lab-muted">
          Need help? Open a problem and use the "Submit to assignment" button.
        </p>
      </div>

      {error ? <div className="lab-card lab-error">{error}</div> : null}

      {isLoading ? (
        <div className="lab-card">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="lab-card lab-empty">No assignments yet.</div>
      ) : (
        <div className="lab-grid lab-grid-2">
          {assignments.map((assignment) => {
            const status = getStatus(assignment.id);
            const problemIds = Array.isArray(assignment.problem_ids)
              ? assignment.problem_ids
              : [];
            const statusClass =
              status === "Graded"
                ? "lab-status-pill is-completed"
                : status === "Not started"
                ? "lab-status-pill is-muted"
                : "lab-status-pill";

            return (
              <section key={assignment.id} className="lab-card">
                <div className="lab-card-header">
                  <div>
                    <h3>{assignment.title}</h3>
                    <p className="lab-muted">
                      {assignment.description || "No description provided."}
                    </p>
                  </div>
                  <div className="lab-problem-meta">
                    <span className={statusClass}>{status}</span>
                    <span className="lab-pill">
                      {assignment.type === "test" ? "Test" : "Homework"}
                    </span>
                  </div>
                </div>
                <div className="lab-meta">
                  <span>
                    Due: {assignment.due_date
                      ? new Date(assignment.due_date).toLocaleDateString()
                      : "No due date"}
                  </span>
                </div>
                {problemIds.length === 0 ? (
                  <p className="lab-empty">No problems assigned yet.</p>
                ) : (
                  <ul className="lab-list">
                    {problemIds.map((problemId) => (
                      <li key={`${assignment.id}-${problemId}`}>
                        <Link
                          className="lab-link"
                          to={`/lab/problem/${problemId}?assignment=${assignment.id}`}
                        >
                          Problem {problemId}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </LabLayout>
  );
}
