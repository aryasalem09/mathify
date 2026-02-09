import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, getProblems } from "../api";
import type { Problem } from "../types";
import LabLayout from "../components/LabLayout";
import DifficultyBadge from "../components/DifficultyBadge";
import { useLabProgress } from "../hooks/useLabProgress";
import { useAuth } from "../../auth/AuthProvider";
import "../lab.css";

const difficultyOptions = ["all", "Easy", "Medium", "Hard"] as const;

type DifficultyFilter = (typeof difficultyOptions)[number];

export default function LabProblemsList() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const { user } = useAuth();
  const {
    completedIds,
    isLoading: isProgressLoading,
    error: progressError,
  } = useLabProgress(user?.id ?? null);

  useEffect(() => {
    let isMounted = true;
    getProblems()
      .then((data) => {
        if (!isMounted) return;
        setProblems(data);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        if (err instanceof ApiError && err.status === 403) {
          navigate("/pending", { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load problems.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const filteredProblems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return problems
      .filter((problem) =>
        difficulty === "all" ? true : problem.difficulty === difficulty
      )
      .filter((problem) => {
        if (!normalizedQuery) return true;
        return (
          problem.title.toLowerCase().includes(normalizedQuery) ||
          problem.summary.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => a.id - b.id);
  }, [difficulty, problems, query]);

  return (
    <LabLayout
      title="Problems"
      subtitle="Browse the full set of Mathify Labs and track your progress."
    >
      <div className="lab-toolbar">
        <div className="lab-toolbar-group">
          <label className="lab-field">
            <span>Search</span>
            <input
              className="lab-input"
              type="text"
              placeholder="Search by title or summary"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="lab-field">
            <span>Difficulty</span>
            <select
              className="lab-select"
              value={difficulty}
              onChange={(event) =>
                setDifficulty(event.target.value as DifficultyFilter)
              }
            >
              {difficultyOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All" : option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="lab-toolbar-meta">
          {isLoading || isProgressLoading
            ? "Loading..."
            : `${filteredProblems.length} results`}
        </div>
      </div>

      {isLoading || isProgressLoading ? (
        <div className="lab-card">Loading problems...</div>
      ) : error || progressError ? (
        <div className="lab-card lab-error">
          {error ?? progressError ?? "Failed to load progress."}
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="lab-card lab-empty">No problems match those filters.</div>
      ) : (
        <div className="lab-problem-grid">
          {filteredProblems.map((problem) => {
            const isCompleted =
              !isProgressLoading && completedIds.has(problem.id);

            return (
              <article
                key={problem.id}
                className={`lab-card lab-problem-card${
                  isCompleted ? " is-completed" : ""
                }`}
              >
                <div className="lab-problem-card-header">
                  <div>
                    <h3>{problem.title}</h3>
                    <p className="lab-problem-summary">{problem.summary}</p>
                  </div>
                  <div className="lab-problem-meta">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    <span
                      className={`lab-status-pill${
                        isCompleted ? " is-completed" : " is-muted"
                      }`}
                    >
                      {isCompleted ? "Completed" : "Not started"}
                    </span>
                  </div>
                </div>
                {problem.tags.length > 0 ? (
                  <div className="lab-tag-row">
                    {problem.tags.map((tag) => (
                      <span key={tag} className="lab-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="lab-problem-footer">
                  <span className="lab-muted">Problem {problem.id}</span>
                  <button
                    className="lab-button"
                    type="button"
                    onClick={() => navigate(`/lab/problem/${problem.id}`)}
                  >
                    Solve
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </LabLayout>
  );
}
