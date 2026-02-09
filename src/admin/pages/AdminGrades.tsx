import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import type { AdminProfile, Assignment, Grade } from "../types";

export default function AdminGrades() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentFilter, setStudentFilter] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [gradesRes, profilesRes, assignmentsRes] = await Promise.all([
          supabase
            .from("grades")
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

        if (gradesRes.error) throw gradesRes.error;
        if (profilesRes.error) throw profilesRes.error;
        if (assignmentsRes.error) throw assignmentsRes.error;

        setGrades((gradesRes.data ?? []) as Grade[]);
        setProfiles((profilesRes.data ?? []) as AdminProfile[]);
        setAssignments((assignmentsRes.data ?? []) as Assignment[]);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load grades.");
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

  const filteredGrades = useMemo(() => {
    return grades.filter((grade) => {
      if (studentFilter !== "all" && grade.user_id !== studentFilter) return false;
      if (
        assignmentFilter !== "all" &&
        grade.assignment_id !== assignmentFilter
      ) {
        return false;
      }
      return true;
    });
  }, [assignmentFilter, grades, studentFilter]);

  return (
    <AdminLayout
      title="Grades"
      subtitle="Track feedback and scores shared with students."
    >
      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-field" style={{ minWidth: 180 }}>
            <label htmlFor="grades-student">Student</label>
            <select
              id="grades-student"
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
            <label htmlFor="grades-assignment">Assignment</label>
            <select
              id="grades-assignment"
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
        </div>

        <p className="admin-subtle">
          Grades are created when you save feedback in Submissions.
        </p>

        {error ? <p className="admin-subtle">{error}</p> : null}

        {isLoading ? (
          <p className="admin-subtle">Loading grades...</p>
        ) : filteredGrades.length === 0 ? (
          <div className="admin-empty">
            No grades yet. Save a score in Submissions to create one.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assignment</th>
                  <th>Problem</th>
                  <th>Score</th>
                  <th>Feedback</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((grade) => {
                  const student = profileMap.get(grade.user_id);
                  const assignment = grade.assignment_id
                    ? assignmentMap.get(grade.assignment_id)
                    : null;

                  return (
                    <tr key={grade.id}>
                      <td>{student?.email ?? "(no email)"}</td>
                      <td>{assignment?.title ?? "Lab"}</td>
                      <td>{grade.problem_id ?? "-"}</td>
                      <td>{grade.score ?? "-"}</td>
                      <td>{grade.feedback ?? "-"}</td>
                      <td>
                        {grade.created_at
                          ? new Date(grade.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
