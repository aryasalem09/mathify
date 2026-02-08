import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, getProblem, run } from "../api";
import type { Problem, StatementBlock } from "../types";
import LabLayout from "../components/LabLayout";
import DifficultyBadge from "../components/DifficultyBadge";
import AceJavaEditor from "../components/AceJavaEditor";
import CodeBlock from "../components/CodeBlock";
import {
  getCompletedProblems,
  markProblemCompleted,
  subscribeProgress,
} from "../progress";
import "../lab.css";

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
  const [completedIds, setCompletedIds] = useState<Set<number>>(
    new Set(getCompletedProblems())
  );

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
          navigate("/lab/login", { replace: true });
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
    const unsubscribe = subscribeProgress(() => {
      setCompletedIds(new Set(getCompletedProblems()));
    });
    return unsubscribe;
  }, []);

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
      if (didPass) {
        markProblemCompleted(problem.id);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/lab/login", { replace: true });
        return;
      }
      const message = err instanceof Error ? err.message : "Error running code.";
      setOutput(`Error running code: ${message}`);
      setCompilationTime("");
    } finally {
      setIsRunning(false);
    }
  };

  const totalHints = problem?.hints.length ?? 0;
  const revealedHints = problem?.hints.slice(0, hintsUsed) ?? [];
  const hasHints = totalHints > 0;
  const canRevealSolution = !hasHints || hintsUsed >= totalHints;
  const isCompleted = problem ? completedIds.has(problem.id) : false;

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


