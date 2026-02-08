import { loadProblems } from "./_data.js";

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
    const problems = await loadProblems();
    sendJson(res, 200, problems);
  } catch (error) {
    const status = error?.status || 500;
    sendJson(res, status, { error: error?.message || "Server error" });
  }
}
