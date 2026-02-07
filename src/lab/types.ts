export type Difficulty = string;

export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  hints: string[];
  solution: string;
  testCases: TestCase[];
}

export interface LoginResponse {
  ok: boolean;
  user?: {
    username: string;
  };
  error?: string;
}

export interface RunResponse {
  output: string;
}
