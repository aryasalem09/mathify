import { parseJsonBody, requireUser } from "./_auth.js";
import { loadProblems } from "./_data.js";

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    requireUser(req);
    const body = parseJsonBody(req);
    const code = typeof body.code === "string" ? body.code : "";
    const problemId = Number(body.problemId);

    if (!code || Number.isNaN(problemId)) {
      sendJson(res, 400, { error: "Invalid payload" });
      return;
    }

    const problems = await loadProblems();
    const problem = problems.find((entry) => entry.id === problemId);

    if (!problem) {
      sendJson(res, 400, { error: "Invalid problem ID" });
      return;
    }

    let correctCount = 0;
    let failedResult = "";

    for (const testCase of problem.testCases) {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "java",
          version: "15.0.2",
          files: [{ name: "Main.java", content: code }],
          stdin: testCase.input,
        }),
      });

      if (!response.ok) {
        throw new Error(`Piston error: ${response.status}`);
      }

      const result = await response.json();
      const output = String(result?.run?.output ?? "").trim();
      const expected = String(testCase.output ?? "").trim();

      if (output === expected) {
        correctCount += 1;
      } else {
        failedResult += `Expected: ${testCase.output}\nGot: ${output}\n\n`;
      }
    }

    const passed = correctCount === problem.testCases.length;

    if (passed) {
      sendJson(res, 200, { output: "All test cases passed!", passed: true });
      return;
    }

    const failedCount = problem.testCases.length - correctCount;
    sendJson(res, 200, {
      output: `${failedCount} out of ${problem.testCases.length} test cases failed.\n${failedResult}`,
      passed: false,
    });
  } catch (error) {
    const status = error?.status || 500;
    const message =
      error instanceof Error ? error.message : "Error executing code";
    const errorMessage =
      status === 401 ? message : `Error executing code: ${message}`;
    sendJson(res, status, { error: errorMessage });
  }
}

