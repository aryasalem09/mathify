import type { Problem, RunResponse } from "./types";
import { supabase } from "../lib/supabase";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const API_BASE = "";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers || {});
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const dataPayload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof dataPayload === "string"
        ? dataPayload
        : dataPayload?.error || "Request failed";
    throw new ApiError(message, response.status);
  }

  return dataPayload as T;
}

export async function getProblems() {
  const data = await apiFetch<Problem[]>("/api/lab/problems");
  return Array.isArray(data) ? data : [];
}

export function getProblem(id: number | string) {
  return apiFetch<Problem>(`/api/lab/problem?id=${id}`);
}

export function run(code: string, problemId: number) {
  return apiFetch<RunResponse>("/api/lab/run", {
    method: "POST",
    body: JSON.stringify({ code, problemId }),
  });
}
