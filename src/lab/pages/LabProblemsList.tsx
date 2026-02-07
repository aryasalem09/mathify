import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, getProblems } from "../api";
import type { Problem } from "../types";
import LabSubNav from "../components/LabSubNav";
import "../lab.css";

export default function LabProblemsList() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          navigate("/lab/login", { replace: true });
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

  return (
    <div className="lab-root">
      <header>
        <h1>Problems List</h1>
        <LabSubNav />
      </header>
      <main>
        <table id="problems-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="problems-list">
            {isLoading ? (
              <tr>
                <td colSpan={4}>Loading...</td>
              </tr>
            ) : null}
            {!isLoading && error ? (
              <tr>
                <td colSpan={4}>Failed to load problems. Please try again later.</td>
              </tr>
            ) : null}
            {!isLoading && !error
              ? problems.map((problem) => (
                  <tr key={problem.id}>
                    <td>{problem.id}</td>
                    <td>
                      {problem.title}{" "}
                      <span
                        id={`solved-${problem.id}`}
                        className="solved-indicator"
                        style={{ display: "none" }}
                      >
                        ✔ Solved
                      </span>
                    </td>
                    <td>
                      <span
                        className={`difficulty ${problem.difficulty.toLowerCase()}`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => navigate(`/lab/problem/${problem.id}`)}
                      >
                        Solve
                      </button>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </main>
    </div>
  );
}
