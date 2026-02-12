export type ProfileRole = "admin" | "student" | "pending" | "blocked" | string;

export type AdminProfile = {
  id: string;
  email: string | null;
  role: ProfileRole | null;
  created_at: string | null;
};

export type Assignment = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  type: "homework" | "test" | string;
  problem_ids: number[];
  assigned_to: "all" | "selected" | string;
  assigned_user_ids: string[] | null;
  created_at: string | null;
};

export type Submission = {
  id: string;
  user_id: string;
  assignment_id: string | null;
  problem_id: number | null;
  code: string | null;
  output: string | null;
  created_at: string | null;
};

export type Grade = {
  id: string;
  submission_id: string | null;
  assignment_id: string | null;
  problem_id: number | null;
  user_id: string;
  score: number | null;
  feedback: string | null;
  created_at: string | null;
};
