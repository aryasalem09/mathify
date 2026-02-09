import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ApiError, getProblem, run } from "../api";
import type { Problem, StatementBlock } from "../types";
import LabLayout from "../components/LabLayout";
import DifficultyBadge from "../components/DifficultyBadge";
import AceJavaEditor from "../components/AceJavaEditor";
import CodeBlock from "../components/CodeBlock";
import { markProblemCompleted } from "../progress";
import { useLabProgress } from "../hooks/useLabProgress";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import "../lab.css";

type AssignmentInfo = {
  id: string;
  title: string;
  due_date: string | null;
  type: string;
  assigned_to: string;
  assigned_user_ids: string[] | null;
};

function renderInline(text: string) {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  return text.split(pattern).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${part}-${index}`} className="lab-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function renderStatement(block: StatementBlock, index: number) {
  if (block.type === "paragraph") {
    return (
      <p key={`paragraph-${index}`} className="lab-paragraph">
        {renderInline(block.text)}
      </p>
    );
  }
  if (block.type === "list") {
    return (
      <ul key={`list-${index}`} className="lab-list">
        {block.items.map((item, itemIndex) => (
          <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }
  return (
    <pre key={`code-${index}`} className="lab-pre">
      {block.text}
    </pre>
  );
}

function formatExampleValue(value: string) {
  return value.length === 0 ? "None" : value;
}

export default function LabProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const problemId = useMemo(() => Number(id), [id]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [compilationTime, setCompilationTime] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isHintsOpen, setIsHintsOpen] = useState(false);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [assignmentInfo, setAssignmentInfo] = useState<AssignmentInfo | null>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const { user } = useAuth();
  const {
    completedIds,
    isLoading: isProgressLoading,
    refresh: refreshProgress,
  } = useLabProgress(user?.id ?? null);
  const assignmentId = searchParams.get("assignment");

  useEffect(() => {
    if (!id || Number.isNaN(problemId)) {
      setError("Invalid problem ID.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setProblem(null);
    setCode("");
    setOutput("");
    setCompilationTime("");
    setHintsUsed(0);
    setIsHintsOpen(false);
    setSolutionVisible(false);

    getProblem(problemId)
      .then((data) => {
        if (!isMounted) return;
        setProblem(data);
        setCode(data.starterCode);
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
        setError(err instanceof Error ? err.message : "Error loading problem.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate, problemId]);

  useEffect(() => {
    let isMounted = true;

    const loadAssignment = async () => {
      if (!assignmentId || !user) {
        setAssignmentInfo(null);
        setAssignmentError(null);
        setAssignmentMessage(null);
        setAssignmentLoading(false);
        return;
      }

      setAssignmentLoading(true);
      setAssignmentError(null);
      setAssignmentMessage(null);

      const { data, error: assignmentFetchError } = await supabase
        .from("assignments")
        .select("id, title, due_date, type, assigned_to, assigned_user_ids")
        .eq("id", assignmentId)
        .maybeSingle();

      if (!isMounted) return;

      if (assignmentFetchError) {
        setAssignmentInfo(null);
        setAssignmentLoading(false);
        setAssignmentError("Unable to load assignment details.");
        return;
      }

      if (!data) {
        setAssignmentInfo(null);
        setAssignmentLoading(false);
        setAssignmentError("Assignment not found or not available.");
        return;
      }

      const assignedUserIds = Array.isArray(data.assigned_user_ids)
        ? data.assigned_user_ids
        : [];
      const isAssigned =
        data.assigned_to === "all" ||
        (data.assigned_to === "selected" && assignedUserIds.includes(user.id));

      if (!isAssigned) {
        setAssignmentInfo(null);
        setAssignmentLoading(false);
        setAssignmentError("You are not assigned to this assignment.");
        return;
      }

      setAssignmentInfo(data as AssignmentInfo);
      setAssignmentLoading(false);
    };

    loadAssignment();

    return () => {
      isMounted = false;
    };
  }, [assignmentId, user]);

  const handleHintToggle = () => {
    if (!problem) return;
    if (!isHintsOpen) {
      if (hintsUsed < problem.hints.length) {
        setHintsUsed(hintsUsed + 1);
      }
      setIsHintsOpen(true);
      return;
    }
    setIsHintsOpen(false);
  };

  const handleNextHint = () => {
    if (!problem) return;
    if (hintsUsed < problem.hints.length) {
      setHintsUsed(hintsUsed + 1);
    }
    setIsHintsOpen(true);
  };

  const handleSolutionClick = () => {
    setSolutionVisible(true);
  };

  const handleRunClick = async () => {
    if (!problem) return;

    setIsRunning(true);
    setOutput("Running code...");
    setCompilationTime("Compiling...");
    const startTime = Date.now();

    try {
      const result = await run(code, problem.id);
      const endTime = Date.now();
      const seconds = ((endTime - startTime) / 1000).toFixed(2);
      setCompilationTime(`Compilation Time: ${seconds}s`);
      setOutput(result.output ?? "");

      const didPass = result.passed ?? result.output.includes("All test cases");
      if (didPass && user) {
        try {
          await markProblemCompleted({
            userId: user.id,
            problemId: problem.id,
            score: typeof problem.points === "number" ? problem.points : null,
          });
          await refreshProgress();
        } catch (progressError) {
          const message =
            progressError instanceof Error
              ? progressError.message
              : "Failed to save progress.";
          setOutput(`${result.output ?? ""}\n\nProgress save failed: ${message}`);
        }
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      if (err instanceof ApiError && err.status === 403) {
        navigate("/pending", { replace: true });
        return;
      }
      const message = err instanceof Error ? err.message : "Error running code.";
      setOutput(`Error running code: ${message}`);
      setCompilationTime("");
    } finally {
      setIsRunning(false);
    }
  };

  const handleAssignmentSubmit = async () => {
    if (!assignmentId) return;
    if (!user || !problem) return;

    if (!assignmentInfo) {
      setAssignmentError("Assignment not found or not available.");
      return;
    }

    setIsSubmittingAssignment(true);
    setAssignmentError(null);
    setAssignmentMessage(null);

    try {
      const { error: submitError } = await supabase.from("submissions").insert({
        user_id: user.id,
        assignment_id: assignmentId,
        problem_id: problem.id,
        code,
        output: output || null,
      });

      if (submitError) throw submitError;
      setAssignmentMessage("Submitted. Return to assignments to see status.");
    } catch (err) {
      setAssignmentError(
        err instanceof Error ? err.message : "Failed to submit assignment."
      );
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  const totalHints = problem?.hints.length ?? 0;
  const revealedHints = problem?.hints.slice(0, hintsUsed) ?? [];
  const hasHints = totalHints > 0;
  const canRevealSolution = !hasHints || hintsUsed >= totalHints;
  const isCompleted =
    problem && !isProgressLoading ? completedIds.has(problem.id) : false;

  const meta = problem ? (
    <>
      <DifficultyBadge difficulty={problem.difficulty} />
      {typeof problem.points === "number" ? (
        <span className="lab-pill">{problem.points} pts</span>
      ) : null}
      {isCompleted ? <span className="lab-pill">Completed</span> : null}
    </>
  ) : null;

  if (isLoading) {
    return (
      <LabLayout title="Loading" subtitle="Fetching problem details...">
        <div className="lab-card">Loading problem...</div>
      </LabLayout>
    );
  }

  if (error || !problem) {
    return (
      <LabLayout title="Problem" subtitle="We hit a snag.">
        <div className="lab-card lab-error">{error ?? "Problem not found."}</div>
      </LabLayout>
    );
  }

  return (
    <LabLayout title={problem.title} subtitle={problem.summary} meta={meta}>
      <div className="lab-problem-layout">
        <section className="lab-card">
          <div className="lab-card-header">
            <h2>Problem Statement</h2>
            <Link className="lab-link" to="/lab/problems">
              Back to Problems
            </Link>
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
          {problem.statement.map((block, index) => renderStatement(block, index))}
        </section>

        <div className="lab-problem-columns">
          <div className="lab-problem-left">
            <section className="lab-card">
              <h2>Editor</h2>
              <div className="lab-editor-wrapper">
                <AceJavaEditor value={code} onChange={setCode} />
              </div>
              <div className="lab-editor-actions">
                <button className="lab-button" type="button" onClick={handleRunClick}>
                  {isRunning ? "Running..." : "Run Code"}
                </button>
                <span className="lab-muted">{compilationTime}</span>
              </div>
            </section>

            <section className="lab-card">
              <h2>Output Console</h2>
              <div className="lab-console">
                <pre className="lab-console-pre">
                  {output || "Run your code to see output here."}
                </pre>
              </div>
            </section>

            {assignmentId ? (
              <section className="lab-card">
                <div className="lab-card-header">
                  <h2>Assignment submission</h2>
                  {assignmentInfo ? (
                    <span className="lab-muted">{assignmentInfo.title}</span>
                  ) : null}
                </div>
                {assignmentInfo ? (
                  <p className="lab-muted">
                    {assignmentInfo.type === "test" ? "Test" : "Homework"}
                    {assignmentInfo.due_date
                      ? ` - Due ${new Date(
                          assignmentInfo.due_date
                        ).toLocaleDateString()}`
                      : ""}
                  </p>
                ) : assignmentLoading ? (
                  <p className="lab-muted">Loading assignment details...</p>
                ) : null}
                {assignmentError ? (
                  <p className="lab-error">{assignmentError}</p>
                ) : null}
                {assignmentMessage ? (
                  <p className="lab-muted">{assignmentMessage}</p>
                ) : null}
                <button
                  className="lab-button"
                  type="button"
                  onClick={handleAssignmentSubmit}
                  disabled={!assignmentInfo || isSubmittingAssignment}
                >
                  {isSubmittingAssignment ? "Submitting..." : "Submit to assignment"}
                </button>
              </section>
            ) : null}

            <section className="lab-card">
              <div className="lab-card-header">
                <h2>Solution</h2>
                <span className="lab-muted">
                  {canRevealSolution
                    ? "Click to reveal the reference solution."
                    : "Reveal all hints to unlock."}
                </span>
              </div>
              {solutionVisible ? (
                <CodeBlock code={problem.solution} label="Reference Solution" />
              ) : (
                <button
                  className="lab-button lab-button--ghost"
                  type="button"
                  onClick={handleSolutionClick}
                  disabled={!canRevealSolution}
                >
                  Reveal solution
                </button>
              )}
            </section>
          </div>

          <div className="lab-problem-right">
            <section className="lab-card">
              <h2>Input</h2>
              <ul className="lab-list">
                {problem.input.map((item, itemIndex) => (
                  <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>
                ))}
              </ul>
              <h2>Output</h2>
              <ul className="lab-list">
                {problem.output.map((item, itemIndex) => (
                  <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>
                ))}
              </ul>
              <h2>Constraints</h2>
              <ul className="lab-list">
                {problem.constraints.map((item, itemIndex) => (
                  <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>
                ))}
              </ul>
            </section>

            <section className="lab-card">
              <h2>Examples</h2>
              <div className="lab-example-grid">
                {problem.examples.map((example, index) => (
                  <div key={`${example.input}-${index}`} className="lab-example">
                    <div>
                      <div className="lab-example-label">Example Input</div>
                      <pre className="lab-pre">
                        {formatExampleValue(example.input)}
                      </pre>
                    </div>
                    <div>
                      <div className="lab-example-label">Expected Output</div>
                      <pre className="lab-pre">
                        {formatExampleValue(example.output)}
                      </pre>
                    </div>
                    {example.explanation ? (
                      <p className="lab-example-note">
                        {renderInline(example.explanation)}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="lab-card">
              <div className="lab-card-header">
                <h2>Hints</h2>
                {hasHints ? (
                  <button className="lab-button lab-button--ghost" type="button" onClick={handleHintToggle}>
                    {isHintsOpen ? "Hide hints" : "Show hint"}
                  </button>
                ) : null}
              </div>
              {hasHints ? (
                <div className="lab-hint-panel">
                  {isHintsOpen && revealedHints.length > 0 ? (
                    <ul className="lab-list">
                      {revealedHints.map((hint, hintIndex) => (
                        <li key={`${hintIndex}-${hint}`}>{hint}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="lab-muted">Hints will appear here.</p>
                  )}
                  {hintsUsed < problem.hints.length ? (
                    <button className="lab-button" type="button" onClick={handleNextHint}>
                      Reveal next hint
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="lab-muted">No hints for this problem.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </LabLayout>
  );
}



