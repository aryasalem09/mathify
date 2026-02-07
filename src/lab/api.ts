import type { LoginResponse, Problem, RunResponse } from "./types";

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

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string" ? data : data?.error || "Request failed";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function login(username: string, password: string) {
  return apiFetch<LoginResponse>("/api/lab/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return apiFetch<{ ok: boolean }>("/api/lab/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function me() {
  return apiFetch<LoginResponse>("/api/lab/me");
}

export async function getProblems() {
  const res = await fetch("/api/lab/problems", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("failed to fetch problems");
  }

  const data = await res.json();


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
