export type Difficulty = "Easy" | "Medium" | "Hard";

export type StatementBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "code";
      text: string;
    };

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  difficulty: Difficulty;
  tags: string[];
  points?: number;
  statement: StatementBlock[];
  input: string[];
  output: string[];
  constraints: string[];
  examples: Example[];
  hints: string[];
  starterCode: string;
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
  passed?: boolean;
}
