import type { ReactNode } from "react";
import RequireAuth from "./RequireAuth";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <RequireAuth>{children}</RequireAuth>;
}
