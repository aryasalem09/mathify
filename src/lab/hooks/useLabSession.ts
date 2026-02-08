import { useCallback, useEffect, useState } from "react";
import { ApiError, me } from "../api";
import type { LoginResponse } from "../types";

export type AuthState = "loading" | "authed" | "guest" | "error";

type LabUser = NonNullable<LoginResponse["user"]>;

export function useLabSession() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [user, setUser] = useState<LabUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setAuthState("loading");
    setError(null);

    try {
      const data = await me();
      setUser(data.user ?? null);
      setAuthState("authed");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setAuthState("guest");
        return;
      }
      setUser(null);
      setAuthState("error");
      setError(err instanceof Error ? err.message : "Unable to load session.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setGuest = useCallback(() => {
    setUser(null);
    setAuthState("guest");
    setError(null);
  }, []);

  return {
    authState,
    user,
    error,
    refresh,
    setGuest,
  };
}
