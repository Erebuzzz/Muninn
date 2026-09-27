export interface Bindings {
  DATABASE_URL: string;
  ASSEMBLYAI_API_KEY: string;
  ASSEMBLYAI_VOICE_AGENT_ID?: string;
  LLM_GATEWAY_URL?: string;
  LLM_GATEWAY_MODEL?: string;
  DEFAULT_USER_ID?: string;
  CORS_ORIGINS?: string;
}

export interface AppEnv {
  Bindings: Bindings;
}

export interface EntityRecord {
  id: string;
  user_id: string;
  type: string;
  name: string;
  first_seen_at: string;
}

export interface TaskStateRecord {
  claim_id: string;
  status: string;
  blocked_by?: string | null;
  resurfaced_at?: string[] | null;
}

export interface ClaimRecord {
  id: string;
  conversation_id: string;
  speaker_id?: string | null;
  speaker_tag?: string | null;
  type: string;
  text: string;
  confidence?: string | null;
  sensitivity: string;
  timestamp: string;
  entities?: EntityRecord[];
  task_state?: TaskStateRecord | null;
}

export interface RelationshipRecord {
  id: string;
  from_claim_id: string;
  to_claim_id: string;
  relation_type: string;
  target_claim_text?: string | null;
}

export interface ConversationRecord {
  id: string;
  user_id: string;
  title?: string | null;
  started_at: string;
  ended_at?: string | null;
  audio_url?: string | null;
  raw_transcript?: any;
  status: string;
  claim_count?: number;
}

export interface SpeakerRecord {
  id: string;
  conversation_id: string;
  diarization_tag: string;
  resolved_name?: string | null;
}

export interface ResurfacingEventRecord {
  id: string;
  user_id: string;
  triggered_by_conv?: string | null;
  subject_claim_id?: string | null;
  subject_claim_text?: string | null;
  message: string;
  reason: string;
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

export interface ChatQueryResponse {
  answer: string;
  citations: CitationItem[];
  precedent_found: boolean;
}

export interface ExtractedEntity {
  type?: string;
  name: string;
}

export interface ExtractedClaim {
  temp_id: string;
  type: string;
  text: string;
  speaker?: string;
  timestamp?: string;
  confidence?: string;
  sensitivity?: string;
  entities: string[];
}

export interface ExtractedRelationship {
  from: string;
  to: string;
  type: string;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  claims: ExtractedClaim[];
  relationships: ExtractedRelationship[];
}
