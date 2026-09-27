export type ClaimType = "observation" | "hypothesis" | "decision" | "task" | "question";
export type ClaimSensitivity = "none" | "flagged" | "confirmed_store" | "confirmed_discard";
export type ClaimConfidence = "verified" | "unverified" | "superseded";
export type TaskStatus = "open" | "blocked" | "done" | "stale";

export interface Entity {
  id: string;
  type: string;
  name: string;
  first_seen_at: string;
}

export interface TaskState {
  status: TaskStatus;
  blocked_by?: string | null;
  resurfaced_at?: string[] | null;
}

export interface Relationship {
  id: string;
  from_claim_id: string;
  to_claim_id: string;
  relation_type: string;
  target_claim_text?: string | null;
}

export interface Claim {
  id: string;
  conversation_id: string;
  speaker_id?: string | null;
  speaker_tag?: string | null;
  type: ClaimType;
  text: string;
  confidence?: ClaimConfidence | null;
  sensitivity: ClaimSensitivity;
  timestamp: string;
  entities: Entity[];
  task_state?: TaskState | null;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string | null;
  started_at: string;
  ended_at?: string | null;
  audio_url?: string | null;
  raw_transcript?: any;
  status: "active" | "completed" | "discarded";
  claim_count?: number;
}

export interface ResurfacingItem {
  id: string;
  user_id: string;
  triggered_by_conv?: string | null;
  subject_claim_id?: string | null;
  subject_claim_text?: string | null;
  message: string;
  reason: "blocked_now_unblocked" | "reopened_question" | "conflicting_decision" | "stale_and_relevant" | string;
  created_at: string;
  dismissed: boolean;
}

export interface CitationItem {
  claim_id: string;
  claim_text: string;
  claim_type: string;
  confidence?: string | null;
  speaker?: string | null;
  timestamp?: string | null;
  conversation_title?: string | null;
}

export interface ChatResponse {
  answer: string;
  citations: CitationItem[];
  precedent_found: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "claim" | "entity";
  claim_type?: string;
  full_text?: string;
  confidence?: string;
  status?: string;
  entity_type?: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
