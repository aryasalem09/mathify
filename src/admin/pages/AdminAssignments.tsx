import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import { getProblems } from "../../lab/api";
import type { Problem } from "../../lab/types";
import type { AdminProfile, Assignment } from "../types";
import { useAuth } from "../../auth/AuthProvider";

const emptyAssignment = {
  title: "",
  description: "",
  dueDate: "",
  type: "homework",
  problemIds: [] as number[],
  assignedTo: "all",
  assignedUserIds: [] as string[],
};

export default function AdminAssignments() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [students, setStudents] = useState<AdminProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [form, setForm] = useState(emptyAssignment);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [problemsData, studentsRes, assignmentsRes] = await Promise.all([
          getProblems(),
          supabase
            .from("profiles")
            .select("id, email, role, created_at")
            .eq("role", "student")
            .order("created_at", { ascending: false }),
          supabase.from("assignments").select("*").order("created_at", {
            ascending: false,
          }),
        ]);

        if (!isMounted) return;

        if (studentsRes.error) throw studentsRes.error;
        if (assignmentsRes.error) throw assignmentsRes.error;

        setProblems(problemsData ?? []);
        setStudents((studentsRes.data ?? []) as AdminProfile[]);
        setAssignments((assignmentsRes.data ?? []) as Assignment[]);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load data.");
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

  const handleCheckboxToggle = (id: number) => {
    setForm((current) => {
      const exists = current.problemIds.includes(id);
      return {
        ...current,
        problemIds: exists
          ? current.problemIds.filter((value) => value !== id)
          : [...current.problemIds, id],
      };
    });
  };

  const handleStudentToggle = (id: string) => {
    setForm((current) => {
      const exists = current.assignedUserIds.includes(id);
      return {
        ...current,
        assignedUserIds: exists
          ? current.assignedUserIds.filter((value) => value !== id)
          : [...current.assignedUserIds, id],
      };
    });
  };

  const handleCopyLink = async (problemId: number, assignmentId: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${baseUrl}/lab/problem/${problemId}?assignment=${assignmentId}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopyMessage("Link copied.");
    } catch {
      window.prompt("Copy this link:", link);
      setCopyMessage("Link ready to copy.");
    } finally {
      window.setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        due_date: form.dueDate || null,
        type: form.type,
        problem_ids: form.problemIds,
        assigned_to: form.assignedTo,
        assigned_user_ids:
          form.assignedTo === "selected" ? form.assignedUserIds : null,
        created_by: user?.id ?? null,
      };

      const { data, error: insertError } = await supabase
        .from("assignments")
        .insert(payload)
        .select("*")
        .single();

      if (insertError) throw insertError;

      setAssignments((current) =>
        data ? [data as Assignment, ...current] : current
      );
      setForm(emptyAssignment);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusCounts = useMemo(() => {
    const today = new Date();
    let dueSoon = 0;
    let pastDue = 0;

    assignments.forEach((assignment) => {
      if (!assignment.due_date) return;
      const dueDate = new Date(`${assignment.due_date}T00:00:00`);
      const diffMs = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays < 0) pastDue += 1;
      if (diffDays >= 0 && diffDays <= 7) dueSoon += 1;
    });

    return { total: assignments.length, dueSoon, pastDue };
  }, [assignments]);

  return (
    <AdminLayout
      title="Assignments"
      subtitle="Create homework and tests, then track how students respond."
    >
      <div className="admin-grid admin-grid-2">
        <div className="admin-card">
          <h3 className="admin-section-title">Create assignment</h3>
          <p className="admin-subtle">
            Pick problems, set a due date, and decide who should see it.
          </p>
          {error ? <p className="admin-subtle">{error}</p> : null}
          <form onSubmit={handleSubmit} className="admin-grid" style={{ gap: 12 }}>
            <div className="admin-field">
              <label htmlFor="assignment-title">Title</label>
              <input
                id="assignment-title"
                className="admin-input"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Weekly homework"
                required
              />
            </div>
            <div className="admin-field">
              <label htmlFor="assignment-description">Description</label>
              <textarea
                id="assignment-description"
                className="admin-textarea"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Short note for students"
              />
            </div>
            <div className="admin-grid admin-grid-2">
              <div className="admin-field">
                <label htmlFor="assignment-date">Due date</label>
                <input
                  id="assignment-date"
                  className="admin-input"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="admin-field">
                <label htmlFor="assignment-type">Type</label>
                <select
                  id="assignment-type"
                  className="admin-select"
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                >
                  <option value="homework">Homework</option>
                  <option value="test">Test</option>
                </select>
              </div>
            </div>
            <div className="admin-field">
              <label>Problem set</label>
              <div className="admin-checklist">
                {problems.map((problem) => (
                  <label key={problem.id}>
                    <input
                      type="checkbox"
                      checked={form.problemIds.includes(problem.id)}
                      onChange={() => handleCheckboxToggle(problem.id)}
                    />
                    <span style={{ marginLeft: 8 }}>
                      {problem.id}. {problem.title}
                    </span>
                  </label>
                ))}
                {problems.length === 0 ? (
                  <span className="admin-subtle">No problems loaded yet.</span>
                ) : null}
              </div>
            </div>
            <div className="admin-field">
              <label>Assign to</label>
              <div className="admin-split">
                <label>
                  <input
                    type="radio"
                    name="assignedTo"
                    value="all"
                    checked={form.assignedTo === "all"}
                    onChange={() =>
                      setForm((current) => ({ ...current, assignedTo: "all" }))
                    }
                  />{" "}
                  All students
                </label>
                <label>
                  <input
                    type="radio"
                    name="assignedTo"
                    value="selected"
                    checked={form.assignedTo === "selected"}
                    onChange={() =>
                      setForm((current) => ({
                        ...current,
                        assignedTo: "selected",
                      }))
                    }
                  />{" "}
                  Selected students
                </label>
              </div>
            </div>
            {form.assignedTo === "selected" ? (
              <div className="admin-field">
                <label>Choose students</label>
                <div className="admin-checklist">
                  {students.map((student) => (
                    <label key={student.id}>
                      <input
                        type="checkbox"
                        checked={form.assignedUserIds.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                      />
                      <span style={{ marginLeft: 8 }}>
                        {student.email ?? "(no email)"}
                      </span>
                    </label>
                  ))}
                  {students.length === 0 ? (
                    <span className="admin-subtle">No students available.</span>
                  ) : null}
                </div>
              </div>
            ) : null}
            <button className="admin-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create assignment"}
            </button>
          </form>
        </div>

        <div className="admin-card">
          <h3 className="admin-section-title">Assignment status</h3>
          <p className="admin-subtle">
            {isLoading ? "Loading assignments..." : `${statusCounts.total} total`}
          </p>
          <div className="admin-split">
            <span className="admin-pill">Due soon: {statusCounts.dueSoon}</span>
            <span className="admin-pill">Past due: {statusCounts.pastDue}</span>
          </div>
          {copyMessage ? <p className="admin-subtle">{copyMessage}</p> : null}
          <div style={{ marginTop: 16 }}>
            {assignments.length === 0 ? (
              <div className="admin-empty">No assignments yet.</div>
            ) : (
              <div className="admin-grid" style={{ gap: 12 }}>
                {assignments.map((assignment) => (
                  <div key={assignment.id}>
                    <strong>{assignment.title}</strong>
                    <p className="admin-subtle" style={{ marginTop: 4 }}>
                      Share direct links with students.
                    </p>
                    <div className="admin-checklist">
                      {assignment.problem_ids.length === 0 ? (
                        <span className="admin-subtle">
                          No problems linked to this assignment.
                        </span>
                      ) : (
                        assignment.problem_ids.map((problemId) => (
                          <div
                            key={`${assignment.id}-${problemId}`}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 12,
                              alignItems: "center",
                            }}
                          >
                            <span>Problem {problemId}</span>
                            <button
                              className="admin-button ghost"
                              type="button"
                              onClick={() =>
                                handleCopyLink(problemId, assignment.id)
                              }
                            >
                              Copy link
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
