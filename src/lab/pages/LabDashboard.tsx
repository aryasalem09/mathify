import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, getProblems } from "../api";
import type { Problem } from "../types";
import LabLayout from "../components/LabLayout";
import { LAB_HOMEWORK_IDS, LAB_TESTS } from "../data";
import { getCompletedProblems, subscribeProgress } from "../progress";
import "../lab.css";

export default function LabDashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<number>>(
    new Set(getCompletedProblems())
  );

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
        setError(err instanceof Error ? err.message : "Failed to load dashboard.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = subscribeProgress(() => {
      setCompletedIds(new Set(getCompletedProblems()));
    });
    return unsubscribe;
  }, []);

  const homeworkProblems = useMemo(() => {
    const idSet = new Set(LAB_HOMEWORK_IDS);
    return problems.filter((problem) => idSet.has(problem.id));
  }, [problems]);

  const completedHomework = homeworkProblems.filter((problem) =>
    completedIds.has(problem.id)
  );
  const unstartedHomework = homeworkProblems.filter(
    (problem) => !completedIds.has(problem.id)
  );

  const meta = (
    <>
      <span className="lab-pill">Homework {LAB_HOMEWORK_IDS.length}</span>
      <span className="lab-pill">Problems {problems.length}</span>
    </>
  );

  return (
    <LabLayout
      title="Dashboard"
      subtitle="Your weekly homework and lab progress at a glance."
      meta={meta}
    >
      <div className="lab-grid lab-grid-2">
        <section className="lab-card">
          <div className="lab-card-header">
            <h3>Homework for the Week</h3>
            <p className="lab-muted">
              Focus on one problem at a time and track your progress here.
            </p>
          </div>
          {isLoading ? (
            <p className="lab-muted">Loading homework...</p>
          ) : error ? (
            <p className="lab-error">{error}</p>
          ) : (
            <div className="lab-split">
              <div>
                <h4>Completed</h4>
                {completedHomework.length === 0 ? (
                  <p className="lab-empty">No completed homework yet.</p>
                ) : (
                  <ul className="lab-list">
                    {completedHomework.map((problem) => (
                      <li key={problem.id}>
                        <Link to={`/lab/problem/${problem.id}`}>
                          {problem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4>Unstarted</h4>
                {unstartedHomework.length === 0 ? (
                  <p className="lab-empty">All homework is complete.</p>
                ) : (
                  <ul className="lab-list">
                    {unstartedHomework.map((problem) => (
                      <li key={problem.id}>
                        <Link to={`/lab/problem/${problem.id}`}>
                          {problem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="lab-card">
          <div className="lab-card-header">
            <h3>Tests & Quizzes</h3>
            <p className="lab-muted">
              Grades will appear here once assessments are posted.
            </p>
          </div>
          {LAB_TESTS.length === 0 ? (
            <p className="lab-empty">No tests or quizzes yet.</p>
          ) : (
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Date</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {LAB_TESTS.map((test) => (
                  <tr key={test.id}>
                    <td>{test.title}</td>
                    <td>{test.date}</td>
                    <td>{test.score ?? "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </LabLayout>
  );
}
