function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export default function handler(_req, res) {
  sendJson(res, 410, {
    error: "Deprecated. Use Supabase auth on the client.",
  });
}
