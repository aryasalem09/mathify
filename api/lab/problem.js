import { loadProblems } from "./_data.js";
import { requireApprovedUser } from "./_auth.js";

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    await requireApprovedUser(req);
    const query = req.url?.split("?")[1] ?? "";
    const searchParams = new URLSearchParams(query);
    const idParam = searchParams.get("id");
    const problemId = Number(idParam);

    if (!idParam || Number.isNaN(problemId)) {
      sendJson(res, 400, { error: "Invalid problem ID" });
      return;
    }

    const problems = await loadProblems();
    const problem = problems.find((entry) => entry.id === problemId);

    if (!problem) {
      sendJson(res, 404, { error: "Problem not found" });
      return;
    }

    sendJson(res, 200, problem);
  } catch (error) {
    const status = error?.status || 500;
    sendJson(res, status, { error: error?.message || "Server error" });
  }
}
