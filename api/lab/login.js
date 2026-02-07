import { parseJsonBody, setAuthCookie } from "./_auth.js";

const USERS = [{ username: "testuser", password: "testpassword" }];

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = parseJsonBody(req);
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    const user = USERS.find(
      (entry) => entry.username === username && entry.password === password
    );

    if (!user) {
      sendJson(res, 401, { ok: false, error: "Invalid credentials" });
      return;
    }

    setAuthCookie(res, username);
    sendJson(res, 200, { ok: true, user: { username } });
  } catch (error) {
    const status = error?.status || 500;
    sendJson(res, status, { error: error?.message || "Server error" });
  }
}
