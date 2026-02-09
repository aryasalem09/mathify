import { supabase } from "../lib/supabase";

const LAB_ID = "mathify-labs";
const PROGRESS_EVENT = "lab-progress";

type LabProgressRow = {
  problem_id: string;
  status: string | null;
  score: number | null;
};

export async function getCompletedProblems(userId: string) {
  const { data, error } = await supabase
    .from("user_lab_progress")
    .select("problem_id, status")
    .eq("user_id", userId)
    .eq("lab_id", LAB_ID);

  if (error) {
    throw error;
  }

  const rows = Array.isArray(data) ? data : [];
  return rows
    .filter((row) => row.status === "completed")
    .map((row) => Number(row.problem_id))
    .filter((value) => Number.isFinite(value));
}

export async function fetchLabProgress(userId: string) {
  const { data, error } = await supabase
    .from("user_lab_progress")
    .select("problem_id, status, score")
    .eq("user_id", userId)
    .eq("lab_id", LAB_ID);

  if (error) {
    throw error;
  }

  return (data ?? []) as LabProgressRow[];
}

export async function markProblemCompleted(params: {
  userId: string;
  problemId: number;
  score?: number | null;
}) {
  const { userId, problemId, score } = params;
  const { error } = await supabase.from("user_lab_progress").upsert(
    {
      user_id: userId,
      lab_id: LAB_ID,
      problem_id: String(problemId),
      status: "completed",
      score: typeof score === "number" ? score : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lab_id,problem_id" }
  );

  if (error) {
    throw error;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }
}

export function subscribeProgress(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(PROGRESS_EVENT, callback);

  return () => {
    window.removeEventListener(PROGRESS_EVENT, callback);
  };
}
