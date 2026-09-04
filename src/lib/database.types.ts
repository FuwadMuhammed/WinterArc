export type UserArcStatus = "active" | "completed" | "abandoned";

export type TaskCategory =
  | "ui_practice"
  | "connection"
  | "learn_explain"
  | "rotating_lens"
  | "build_public"
  | "reflection";

export type Arc = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  duration_weeks: number;
  created_at: string;
};

export type Week = {
  id: string;
  arc_id: string;
  week_number: number;
  is_rest_week: boolean;
  connection_goal: number | null;
};

export type Task = {
  id: string;
  arc_id: string;
  week_number: number;
  day_number: number | null;
  category: TaskCategory;
  heading: string;
  subcontent: string;
  requires_proof: boolean;
  weight: number;
  sort_order: number;
  created_at: string;
};

export type UserArc = {
  id: string;
  user_id: string;
  arc_id: string;
  joined_at: string;
  status: UserArcStatus;
};

export type TaskEntry = {
  id: string;
  user_arc_id: string;
  task_id: string;
  completed: boolean;
  note: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      arcs: {
        Row: Arc;
        Insert: Partial<Arc> & Pick<Arc, "name" | "start_date" | "duration_weeks">;
        Update: Partial<Arc>;
        Relationships: [];
      };
      weeks: {
        Row: Week;
        Insert: Partial<Week> & Pick<Week, "arc_id" | "week_number">;
        Update: Partial<Week>;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task> &
          Pick<Task, "arc_id" | "week_number" | "category" | "heading" | "subcontent">;
        Update: Partial<Task>;
        Relationships: [];
      };
      user_arcs: {
        Row: UserArc;
        Insert: Partial<UserArc> & Pick<UserArc, "user_id" | "arc_id">;
        Update: Partial<UserArc>;
        Relationships: [];
      };
      task_entries: {
        Row: TaskEntry;
        Insert: Partial<TaskEntry> & Pick<TaskEntry, "user_arc_id" | "task_id">;
        Update: Partial<TaskEntry>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
