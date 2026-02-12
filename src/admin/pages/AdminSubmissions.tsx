import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import type { AdminProfile, Assignment, Grade, Submission } from "../types";
import { useAuth } from "../../auth/AuthProvider";

export default function AdminSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentFilter, setStudentFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [problemFilter, setProblemFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [gradeId, setGradeId] = useState<string | null>(null);
  const [gradeLoading, setGradeLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [submissionsRes, profilesRes, assignmentsRes] = await Promise.all([
          supabase
            .from("submissions")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("profiles")
            .select("id, email, role, created_at")
            .order("created_at", { ascending: false }),
          supabase.from("assignments").select("*").order("created_at", {
            ascending: false,
          }),
        ]);

        if (!isMounted) return;

        if (submissionsRes.error) throw submissionsRes.error;
        if (profilesRes.error) throw profilesRes.error;
        if (assignmentsRes.error) throw assignmentsRes.error;

        setSubmissions((submissionsRes.data ?? []) as Submission[]);
        setProfiles((profilesRes.data ?? []) as AdminProfile[]);
        setAssignments((assignmentsRes.data ?? []) as Assignment[]);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load submissions.");
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const profileMap = useMemo(() => {
    return new Map(profiles.map((profile) => [profile.id, profile]));
  }, [profiles]);

  const assignmentMap = useMemo(() => {
    return new Map(assignments.map((assignment) => [assignment.id, assignment]));
  }, [assignments]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      if (studentFilter !== "all" && submission.user_id !== studentFilter) {
        return false;
      }
      if (
        assignmentFilter !== "all" &&
        submission.assignment_id !== assignmentFilter
      ) {
        return false;
      }
      if (problemFilter) {
        const problemId = Number(problemFilter);
        if (!Number.isFinite(problemId) || submission.problem_id !== problemId) {
          return false;
        }
      }
      if (dateFilter && submission.created_at) {
        const created = new Date(submission.created_at);
        const filterDate = new Date(`${dateFilter}T00:00:00`);
        if (created < filterDate) return false;
      }
      return true;
    });
  }, [assignmentFilter, dateFilter, problemFilter, studentFilter, submissions]);

  const selectedSubmission = submissions.find((item) => item.id === selectedId);

  useEffect(() => {
    let isMounted = true;

    const fetchGrade = async () => {
      if (!selectedSubmission) {
        setGradeId(null);
        setGradeScore("");
        setGradeFeedback("");
        return;
      }

      setGradeLoading(true);
      try {
        const { data, error: gradeError } = await supabase
          .from("grades")
          .select("id, score, feedback")
          .eq("submission_id", selectedSubmission.id)
          .maybeSingle();

        if (gradeError) throw gradeError;
        if (!isMounted) return;

        setGradeId(data?.id ?? null);
        setGradeScore(data?.score != null ? String(data.score) : "");
        setGradeFeedback(data?.feedback ?? "");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load grade.");
      } finally {
        if (!isMounted) return;
        setGradeLoading(false);
      }
    };

    fetchGrade();

    return () => {
      isMounted = false;
    };
  }, [selectedSubmission]);

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    setGradeLoading(true);

    try {
      const payload: Partial<Grade> & {
        submission_id: string;
        assignment_id: string | null;
        problem_id: number | null;
        user_id: string;
        graded_by: string | null;
      } = {
        submission_id: selectedSubmission.id,
        assignment_id: selectedSubmission.assignment_id,
        problem_id: selectedSubmission.problem_id,
        user_id: selectedSubmission.user_id,
        score: gradeScore ? Number(gradeScore) : null,
        feedback: gradeFeedback.trim() || null,
        graded_by: user?.id ?? null,
      };

      const { data, error: gradeError } = await supabase
        .from("grades")
        .upsert(payload, { onConflict: "submission_id" })
        .select("id")
        .single();

      if (gradeError) throw gradeError;
      setGradeId(data?.id ?? gradeId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save grade.");
    } finally {
      setGradeLoading(false);
    }
  };

  return (
    <AdminLayout
      title="Submissions"
      subtitle="Review student work and leave feedback."
    >
      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-field" style={{ minWidth: 180 }}>
            <label htmlFor="student-filter">Student</label>
            <select
              id="student-filter"
              className="admin-select"
              value={studentFilter}
              onChange={(event) => setStudentFilter(event.target.value)}
            >
              <option value="all">All students</option>
              {profiles
                .filter((profile) => profile.role === "student")
                .map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.email ?? "(no email)"}
                  </option>
                ))}
            </select>
          </div>
          <div className="admin-field" style={{ minWidth: 180 }}>
            <label htmlFor="assignment-filter">Assignment</label>
            <select
              id="assignment-filter"
              className="admin-select"
              value={assignmentFilter}
              onChange={(event) => setAssignmentFilter(event.target.value)}
            >
              <option value="all">All assignments</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ minWidth: 140 }}>
            <label htmlFor="problem-filter">Problem</label>
            <input
              id="problem-filter"
              className="admin-input"
              type="number"
              min="1"
              value={problemFilter}
              onChange={(event) => setProblemFilter(event.target.value)}
            />
          </div>
          <div className="admin-field" style={{ minWidth: 160 }}>
            <label htmlFor="date-filter">From date</label>
            <input
              id="date-filter"
              className="admin-input"
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            />
          </div>
        </div>

        <p className="admin-subtle">
          Filter by student or assignment, then open a submission to review the
          code and leave a grade.
        </p>

        {error ? <p className="admin-subtle">{error}</p> : null}

        {isLoading ? (
          <p className="admin-subtle">Loading submissions...</p>
        ) : filteredSubmissions.length === 0 ? (
          <div className="admin-empty">
            No submissions yet. Students submit from the lab problem page.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Problem</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => {
                  const student = profileMap.get(submission.user_id);
                  const assignment = submission.assignment_id
                    ? assignmentMap.get(submission.assignment_id)
                    : null;

                  return (
                    <tr key={submission.id}>
                      <td>{student?.email ?? "(no email)"}</td>
                      <td>{assignment?.title ?? "Lab"}</td>
                      <td>{submission.problem_id ?? "-"}</td>
                      <td>
                        {submission.created_at
                          ? new Date(submission.created_at).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="admin-button ghost"
                          type="button"
                          onClick={() => setSelectedId(submission.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedSubmission ? (
        <div className="admin-card" style={{ marginTop: 16 }}>
          <h3 className="admin-section-title">Submission detail</h3>
          <div className="admin-grid admin-grid-2">
            <div>
              <p className="admin-subtle">
                Student: {profileMap.get(selectedSubmission.user_id)?.email ?? "-"}
              </p>
              <p className="admin-subtle">
                Assignment: {selectedSubmission.assignment_id
                  ? assignmentMap.get(selectedSubmission.assignment_id)?.title ?? "Lab"
                  : "Lab"}
              </p>
              <p className="admin-subtle">
                Problem: {selectedSubmission.problem_id ?? "-"}
              </p>
            </div>
            <div>
              <p className="admin-subtle">
                Submitted: {selectedSubmission.created_at
                  ? new Date(selectedSubmission.created_at).toLocaleString()
                  : "-"}
              </p>
              {gradeId ? <span className="admin-pill">Graded</span> : null}
            </div>
          </div>

          <div className="admin-grid admin-grid-2" style={{ marginTop: 16 }}>
            <div>
              <h4 className="admin-section-title">Code</h4>
              <pre className="admin-code-block">
                {selectedSubmission.code || "No code submitted."}
              </pre>
            </div>
            <div>
              <h4 className="admin-section-title">Run output</h4>
              <pre className="admin-code-block">
                {selectedSubmission.output || "No output captured."}
              </pre>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h4 className="admin-section-title">Feedback & score</h4>
            <div className="admin-grid admin-grid-2">
              <div className="admin-field">
                <label htmlFor="grade-score">Score</label>
                <input
                  id="grade-score"
                  className="admin-input"
                  type="number"
                  min="0"
                  value={gradeScore}
                  onChange={(event) => setGradeScore(event.target.value)}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="grade-feedback">Feedback</label>
                <textarea
                  id="grade-feedback"
                  className="admin-textarea"
                  value={gradeFeedback}
                  onChange={(event) => setGradeFeedback(event.target.value)}
                />
              </div>
            </div>
            <button
              className="admin-button"
              type="button"
              onClick={handleSaveGrade}
              disabled={gradeLoading}
            >
              {gradeLoading ? "Saving..." : "Save grade"}
            </button>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
