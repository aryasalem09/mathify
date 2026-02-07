import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiError, getProblem, run } from "../api";
import type { Problem } from "../types";
import AceJavaEditor from "../components/AceJavaEditor";
import LabSubNav from "../components/LabSubNav";
import "../lab.css";

const defaultTemplate = `public class Main {
  public static void main(String[] args) {
    // write your code here
  }
}
`;

export default function LabProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problemId = useMemo(() => Number(id), [id]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(defaultTemplate);
  const [output, setOutput] = useState("");
  const [compilationTime, setCompilationTime] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintText, setHintText] = useState("");
  const [showSolutionButton, setShowSolutionButton] = useState(false);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!id || Number.isNaN(problemId)) {
      setError("Invalid problem ID.");
      return;
    }

    let isMounted = true;
    setError(null);
    setProblem(null);
    setCode(defaultTemplate);
    setOutput("");
    setCompilationTime("");
    setHintsUsed(0);
    setHintText("");
    setShowSolutionButton(false);
    setSolutionVisible(false);

    getProblem(problemId)
      .then((data) => {
        if (!isMounted) return;
        setProblem(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err instanceof ApiError && err.status === 401) {
          navigate("/lab/login", { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Error loading problem.");
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate, problemId]);

  const handleHintClick = () => {
    if (!problem || hintsUsed >= problem.hints.length) return;

    const nextHint = problem.hints[hintsUsed];
    const nextCount = hintsUsed + 1;
    setHintText(nextHint);
    setHintsUsed(nextCount);

    if (nextCount === problem.hints.length) {
      setShowSolutionButton(true);
    }
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

  const outputLines = output ? output.split("\n") : [];

  return (
    <div className="lab-root">
      <header>
        <h1 id="problem-title">{problem?.title ?? "Loading..."}</h1>
        <Link to="/lab/problems">Back to Problems</Link>
        <LabSubNav />
      </header>
      <main>
        <p id="problem-description">
          {error ?? problem?.description ?? "Loading problem details..."}
        </p>
        <h4>Example Test Cases</h4>
        <ul id="test-cases">
          {problem?.testCases.map((testCase, index) => (
            <li key={`${testCase.input}-${index}`}>
              <strong>Input:</strong> {testCase.input} <br />{" "}
              <strong>Expected Output:</strong> {testCase.output}
            </li>
          ))}
        </ul>

        <div id="hint-container">
          <button id="hint-button" type="button" onClick={handleHintClick}>
            Show Hint
          </button>
          <p id="hint-text">{hintText}</p>
          {showSolutionButton ? (
            <button
              id="solution-button"
              type="button"
              onClick={handleSolutionClick}
            >
              Show Solution
            </button>
          ) : null}
          <p
            id="solution-text"
            style={{ display: solutionVisible ? "block" : "none" }}
          >
            {solutionVisible ? problem?.solution : null}
          </p>
        </div>

        <div id="editor-container">
          <h3>Write Your Code:</h3>
          <AceJavaEditor value={code} onChange={setCode} />
          <button id="run-button" type="button" onClick={handleRunClick}>
            {isRunning ? "Running..." : "Run Code"}
          </button>
          <p id="compilation-time">{compilationTime}</p>
        </div>

        <div id="output-container">
          <h3>Output:</h3>
          <div id="output">
            {outputLines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < outputLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
