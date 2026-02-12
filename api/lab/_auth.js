import { createClient } from "@supabase/supabase-js";

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getSupabaseConfig() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw createError(
      500,
      "Supabase env vars missing. Set SUPABASE_URL and SUPABASE_ANON_KEY."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

let cachedClient = null;

function getSupabaseClient() {
  if (cachedClient) return cachedClient;
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return cachedClient;
}

function getAccessTokenFromRequest(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}

function getSupabaseClientForToken(token) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });
}

export async function requireSupabaseUser(req) {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    throw createError(401, "Unauthorized");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    throw createError(401, "Unauthorized");
  }

  return data.user;
}

export async function requireApprovedUser(req) {
  const token = getAccessTokenFromRequest(req);
  if (!token) {
    throw createError(401, "Unauthorized");
  }

  const user = await requireSupabaseUser(req);
  const supabase = getSupabaseClientForToken(token);
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    throw createError(403, "Awaiting approval");
  }

  if (data.role !== "student" && data.role !== "admin") {
    throw createError(403, "Awaiting approval");
  }

  return user;
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
