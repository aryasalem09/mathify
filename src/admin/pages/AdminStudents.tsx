import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { supabase } from "../../lib/supabase";
import type { AdminProfile, ProfileRole } from "../types";

const roleOptions: Array<{ value: string; label: string }> = [
  { value: "all", label: "All roles" },
  { value: "pending", label: "Pending" },
  { value: "student", label: "Student" },
  { value: "admin", label: "Admin" },
  { value: "blocked", label: "Blocked" },
];

export default function AdminStudents() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setProfiles((data ?? []) as AdminProfile[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load students.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleRoleUpdate = async (
    profileId: string,
    nextRole: ProfileRole,
    label: string
  ) => {
    if (!window.confirm(`${label} this student?`)) return;
    setBusyId(profileId);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: nextRole })
        .eq("id", profileId);

      if (updateError) throw updateError;
      setProfiles((current) =>
        current.map((profile) =>
          profile.id === profileId ? { ...profile, role: nextRole } : profile
        )
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role.");
    } finally {
      setBusyId(null);
    }
  };

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesRole =
        roleFilter === "all" ? true : profile.role === roleFilter;
      const matchesQuery = query
        ? `${profile.email ?? ""}`.toLowerCase().includes(query)
        : true;
      return matchesRole && matchesQuery;
    });
  }, [profiles, roleFilter, search]);

  return (
    <AdminLayout
      title="Students"
      subtitle="Approve, promote, or review your student roster."
    >
      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-field" style={{ minWidth: 200 }}>
            <label htmlFor="student-search">Search</label>
            <input
              id="student-search"
              className="admin-input"
              type="search"
              placeholder="Search by email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="admin-field" style={{ minWidth: 160 }}>
            <label htmlFor="role-filter">Role</label>
            <select
              id="role-filter"
              className="admin-select"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="admin-subtle">
          Approve new students, promote trusted helpers, or block access when
          needed.
        </p>

        {error ? <p className="admin-subtle">{error}</p> : null}

        {isLoading ? (
          <p className="admin-subtle">Loading students...</p>
        ) : filteredProfiles.length === 0 ? (
          <div className="admin-empty">No students match those filters yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((profile) => {
                  const isBusy = busyId === profile.id;
                  const isPending = profile.role === "pending";
                  const isStudent = profile.role === "student";
                  const isAdmin = profile.role === "admin";

                  return (
                    <tr key={profile.id}>
                      <td>
                        <div>{profile.email ?? "(no email)"}</div>
                        <Link
                          className="admin-subtle"
                          to={`/admin/student/${profile.id}`}
                        >
                          View detail
                        </Link>
                      </td>
                      <td>
                        <span className="admin-pill">{profile.role ?? "-"}</span>
                      </td>
                      <td>
                        {profile.created_at
                          ? new Date(profile.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <div className="admin-split">
                          {isPending ? (
                            <button
                              className="admin-button"
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleRoleUpdate(profile.id, "student", "Approve")
                              }
                            >
                              Approve
                            </button>
                          ) : null}
                          {isStudent ? (
                            <button
                              className="admin-button ghost"
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleRoleUpdate(profile.id, "admin", "Promote")
                              }
                            >
                              Promote
                            </button>
                          ) : null}
                          {!isAdmin ? (
                            <button
                              className="admin-button danger"
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleRoleUpdate(profile.id, "blocked", "Block")
                              }
                            >
                              Block
                            </button>
                          ) : (
                            <span className="admin-subtle">Admin</span>
                          )}
                        </div>
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
