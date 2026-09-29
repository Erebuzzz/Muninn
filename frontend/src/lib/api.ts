import { Capacitor } from "@capacitor/core";
import {
  Conversation,
  Claim,
  ResurfacingItem,
  ChatResponse,
  GraphData,
  Relationship,
  User,
  AuthResponse,
} from "./types";
import { localStore } from "./storage";

let isOnline = true;
const statusListeners = new Set<(online: boolean) => void>();

function setOnlineState(online: boolean) {
  if (isOnline !== online) {
    isOnline = online;
    statusListeners.forEach((fn) => fn(online));
  }
}

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
  const token = localStore.getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error ${res.status}: ${errorText}`);
    }

    setOnlineState(true);
    return res.json();
  } catch (err: any) {
    if (
      err?.name === "TypeError" ||
      err?.message?.includes("Failed to fetch") ||
      err?.message?.includes("NetworkError")
    ) {
      setOnlineState(false);
    }
    throw err;
  }
}

export const api = {
  isServerOnline(): boolean {
    return isOnline;
  },

  subscribeStatus(listener: (online: boolean) => void): () => void {
    statusListeners.add(listener);
    listener(isOnline);
    return () => {
      statusListeners.delete(listener);
    };
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${getBaseUrl()}/health`, { method: "GET" });
      const online = res.ok;
      setOnlineState(online);
      return online;
    } catch {
      setOnlineState(false);
      return false;
    }
  },

  async getVoiceToken(): Promise<{
    token: string;
    agent_id?: string;
    expires_in_seconds: number;
    max_session_duration_seconds: number;
    mode?: "live" | "simulation";
  }> {
    try {
      return await request("/sessions/token");
    } catch {
      return {
        token: "demo-simulation-token",
        expires_in_seconds: 3600,
        max_session_duration_seconds: 600,
        mode: "simulation",
      };
    }
  },

  async createSession(title?: string): Promise<Conversation> {
    try {
      return await request("/sessions", {
        method: "POST",
        body: JSON.stringify({ title: title || "Live Capture Session" }),
      });
    } catch {
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
    data: { transcript_text?: string; raw_transcript?: any }
  ): Promise<any> {
    try {
      return await request(`/sessions/${id}/complete`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      localStore.queueOfflineSession({
        id,
        title: "Completed Session",
        transcriptText: data.transcript_text || "",
        turns: [],
        createdAt: new Date().toISOString(),
      });
      return { status: "queued_locally", id };
    }
  },

  async submitQuickNote(audioBlob: Blob): Promise<{
    transcript_text: string;
    claims_extracted: number;
    session_id?: string;
  }> {
    const url = `${getBaseUrl()}/sessions/quick-note`;
    const token = localStore.getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "audio/wav",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: audioBlob,
      });

      if (!res.ok) {
        throw new Error(`Quick note HTTP error ${res.status}`);
      }

      setOnlineState(true);
      return res.json();
    } catch (err) {
      setOnlineState(false);
      throw err;
    }
  },

  async extractRaw(transcriptText: string, title?: string): Promise<any> {
    return request("/sessions/extract-raw", {
      method: "POST",
      body: JSON.stringify({
        transcript_text: transcriptText,
        title: title || "Imported Scenario",
      }),
    });
  },

  async listClaims(conversationId?: string): Promise<Claim[]> {
    try {
      const qs = conversationId ? `?conversation_id=${conversationId}` : "";
      return await request(`/claims${qs}`);
    } catch {
      return [];
    }
  },

  async getClaim(id: string): Promise<{
    claim: Claim;
    conversation_title?: string | null;
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
    decisions: Array<{ claim_id: string; action: "store" | "discard" }>
  ): Promise<{ stored_count: number; discarded_count: number; status: string }> {
    return request("/review", {
      method: "POST",
      body: JSON.stringify({ decisions }),
    });
  },

  async discardAllPending(): Promise<{ stored_count: number; discarded_count: number; status: string }> {
    return request("/review/discard-all-pending", {
      method: "POST",
    });
  },

  async decideSensitivity(
    claimId: string,
    decision: "confirmed_store" | "confirmed_discard"
  ): Promise<Claim> {
    return request(`/review/${claimId}`, {
      method: "POST",
      body: JSON.stringify({ decision }),
    });
  },

  async bulkReview(
    decision: "confirmed_store" | "confirmed_discard"
  ): Promise<{ updated: number }> {
    return request("/review/bulk", {
      method: "POST",
      body: JSON.stringify({ decision }),
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
    try {
      const qs = entityName ? `?entity_name=${encodeURIComponent(entityName)}` : "";
      return await request(`/graph/entities${qs}`);
    } catch {
      // Graceful fallback when backend is offline
      return { nodes: [], edges: [] };
    }
  },

  async getDependencies(claimId: string): Promise<any[]> {
    try {
      return await request(`/graph/dependencies/${claimId}`);
    } catch {
      return [];
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await localStore.saveAuth(res.token, res.user);
    return res;
  },

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    await localStore.saveAuth(res.token, res.user);
    return res;
  },

  async getMe(): Promise<User> {
    const res = await request<{ user: User }>("/auth/me");
    return res.user;
  },

  async forgotPassword(email: string): Promise<{ message: string; recovery_token?: string; code?: string }> {
    return await request<{ message: string; recovery_token?: string; code?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(params: {
    email: string;
    code: string;
    new_password: string;
    recovery_token?: string;
  }): Promise<{ success: boolean; message: string }> {
    return await request<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  async logout(): Promise<void> {
    await localStore.clearAuth();
  },
};
