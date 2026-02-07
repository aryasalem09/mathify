import crypto from "crypto";

const COOKIE_NAME = "lab_auth";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(value, secret) {
  return base64UrlEncode(
    crypto.createHmac("sha256", secret).update(value).digest()
  );
}

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function createToken(payload, secret) {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
}

function verifyToken(token, secret) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded, secret);
  if (expected.length !== signature.length) return null;

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
  if (!isValid) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded));
    if (!payload || typeof payload.username !== "string") return null;
    if (typeof payload.exp === "number" && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function requireUser(req) {
  const secret = process.env.LAB_AUTH_SECRET;
  if (!secret) {
    throw createError(500, "LAB_AUTH_SECRET is not set");
  }

  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) {
    throw createError(401, "Unauthorized");
  }

  const payload = verifyToken(token, secret);
  if (!payload) {
    throw createError(401, "Unauthorized");
  }

  return { username: payload.username };
}

export function setAuthCookie(res, username) {
  const secret = process.env.LAB_AUTH_SECRET;
  if (!secret) {
    throw createError(500, "LAB_AUTH_SECRET is not set");
  }

  const payload = {
    username,
    exp: Date.now() + MAX_AGE_MS,
  };
  const token = createToken(payload, secret);
  const maxAgeSeconds = Math.floor(MAX_AGE_MS / 1000);
  const cookieParts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (isProduction) {
    cookieParts.push("Secure");
  }

  res.setHeader("Set-Cookie", cookieParts.join("; "));
}

export function clearAuthCookie(res) {
  const cookieParts = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (isProduction) {
    cookieParts.push("Secure");
  }

  res.setHeader("Set-Cookie", cookieParts.join("; "));
}

export function parseJsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString("utf8"));
    } catch {
      return {};
    }
  }
  return req.body;
}
