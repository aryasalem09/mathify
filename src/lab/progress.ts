const STORAGE_KEY = "mathify.lab.completed";
const PROGRESS_EVENT = "lab-progress";

type ProgressState = {
  completed: number[];
};

function readState(): ProgressState {
  if (typeof window === "undefined") {
    return { completed: [] };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { completed: [] };

  try {
    const data = JSON.parse(raw) as ProgressState;
    const completed = Array.isArray(data?.completed)
      ? data.completed.filter((value) => Number.isFinite(value))
      : [];
    return { completed: Array.from(new Set(completed)) };
  } catch {
    return { completed: [] };
  }
}

function writeState(state: ProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getCompletedProblems() {
  return readState().completed;
}

export function isProblemCompleted(id: number) {
  return readState().completed.includes(id);
}

export function markProblemCompleted(id: number) {
  const state = readState();
  if (!state.completed.includes(id)) {
    state.completed.push(id);
    writeState(state);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(PROGRESS_EVENT));
    }
  }
}

export function subscribeProgress(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(PROGRESS_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(PROGRESS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
