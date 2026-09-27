import { Capacitor } from "@capacitor/core";
import {
  Conversation,
  Claim,
  ResurfacingItem,
  ChatResponse,
  GraphData,
  Relationship,
} from "./types";
import { localStore } from "./storage";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    if (
      Capacitor.isNativePlatform() ||
      window.location.protocol === "capacitor:" ||
      (window.location.hostname === "localhost" && (!window.location.port || window.location.port === "80" || window.location.port === "443"))
    ) {
      return "http://10.0.2.2:8000/api";
    }
  }
  return "http://localhost:8000/api";
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error ${res.status}: ${errorText}`);
    }

    return res.json();
  } catch (err) {
    throw err;
  }
}

export const api = {
  async getVoiceToken(): Promise<{
    token: string;
    agent_id?: string;
    expires_in_seconds: number;
    max_session_duration_seconds: number;
  }> {
    return request("/sessions/token");
  },

  async createSession(title?: string): Promise<Conversation> {
    try {
      return await request("/sessions", {
        method: "POST",
        body: JSON.stringify({ title: title || "Live Capture Session" }),
      });
    } catch {
      // Local fallback for offline session creation
      const localId = "local-" + Math.random().toString(36).substring(2, 10);
      return {
        id: localId,
        user_id: "00000000-0000-0000-0000-000000000001",
        title: title || "Offline Capture Session",
        started_at: new Date().toISOString(),
        status: "active",
        claim_count: 0,
      };
    }
  },

  async listSessions(): Promise<Conversation[]> {
    try {
      return await request("/sessions");
    } catch {
      const queue = localStore.getOfflineQueue();
      return queue.map((q) => ({
        id: q.id,
        user_id: "00000000-0000-0000-0000-000000000001",
        title: q.title,
        started_at: q.createdAt,
        status: "completed",
        claim_count: 0,
      }));
    }
  },

  async getSession(id: string): Promise<{
    conversation: Conversation;
    claims: Claim[];
    entities: any[];
    speakers: any[];
  }> {
    return request(`/sessions/${id}`);
  },

  async completeSession(
    id: string,
    data: {
      external_session_id?: string;
      transcript_text?: string;
      raw_transcript?: any;
    }
  ): Promise<{ status: string; session_id: string }> {
    try {
      const res = await request<{ status: string; session_id: string }>(
        `/sessions/${id}/complete`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      localStore.clearDraft();
      return res;
    } catch (e) {
      // Save to local offline queue for sync when connection restores
      localStore.queueOfflineSession({
        id,
        title: "Session " + new Date().toLocaleTimeString(),
        transcriptText: data.transcript_text || "",
        turns: data.raw_transcript?.turns || [],
        createdAt: new Date().toISOString(),
      });
      localStore.clearDraft();
      return { status: "queued_offline", session_id: id };
    }
  },

  async extractRaw(
    transcriptText: string,
    title?: string
  ): Promise<{
    conversation_id: string;
    claims_extracted: number;
    entities_found: number;
    resurfacing_events_triggered: number;
  }> {
    return request("/sessions/extract-raw", {
      method: "POST",
      body: JSON.stringify({
        transcript_text: transcriptText,
        title: title || "Imported Capture",
      }),
    });
  },

  async listClaims(params?: {
    conversation_id?: string;
    entity_name?: string;
    claim_type?: string;
    sensitivity?: string;
  }): Promise<Claim[]> {
    const query = new URLSearchParams();
    if (params?.conversation_id) query.set("conversation_id", params.conversation_id);
    if (params?.entity_name) query.set("entity_name", params.entity_name);
    if (params?.claim_type) query.set("claim_type", params.claim_type);
    if (params?.sensitivity) query.set("sensitivity", params.sensitivity);
    const qs = query.toString();

    try {
      const claims = await request<Claim[]>(`/claims${qs ? `?${qs}` : ""}`);
      localStore.cacheClaims(claims);
      return claims;
    } catch {
      return localStore.getCachedClaims();
    }
  },

  async getClaim(id: string): Promise<{
    claim: Claim;
    conversation_title?: string;
    incoming_relationships: Relationship[];
    outgoing_relationships: Relationship[];
  }> {
    return request(`/claims/${id}`);
  },

  async getPendingReview(): Promise<Claim[]> {
    try {
      return await request("/review");
    } catch {
      return [];
    }
  },

  async submitReview(
    decisions: { claim_id: string; action: "store" | "discard" }[]
  ): Promise<{ stored_count: number; discarded_count: number }> {
    return request("/review", {
      method: "POST",
      body: JSON.stringify({ decisions }),
    });
  },

  async discardAllPending(): Promise<{ discarded_count: number }> {
    return request("/review/discard-all-pending", {
      method: "POST",
    });
  },

  async getResurfacing(): Promise<ResurfacingItem[]> {
    try {
      const items = await request<ResurfacingItem[]>("/resurfacing");
      localStore.cacheResurfacing(items);
      return items;
    } catch {
      return localStore.getCachedResurfacing();
    }
  },

  async dismissResurfacing(id: string): Promise<{ status: string }> {
    return request(`/resurfacing/${id}/dismiss`, {
      method: "POST",
    });
  },

  async queryChat(query: string, conversationId?: string): Promise<ChatResponse> {
    return request("/chat", {
      method: "POST",
      body: JSON.stringify({ query, conversation_id: conversationId }),
    });
  },

  async getGraph(entityName?: string): Promise<GraphData> {
    const qs = entityName ? `?entity_name=${encodeURIComponent(entityName)}` : "";
    return request(`/graph/entities${qs}`);
  },

  async getDependencies(claimId: string): Promise<any[]> {
    return request(`/graph/dependencies/${claimId}`);
  },
};
