import { readFile } from "fs/promises";
import path from "path";

let cachedProblems = null;

export async function loadProblems() {
  if (cachedProblems) {
    return cachedProblems;
  }

  const filePath = path.join(process.cwd(), "problems.json");
  const raw = await readFile(filePath, "utf8");
  cachedProblems = JSON.parse(raw);
  return cachedProblems;
}
