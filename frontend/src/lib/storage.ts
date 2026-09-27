import { Claim, ResurfacingItem, Conversation } from "./types";

export interface DraftTurn {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
}

export interface DraftSession {
  id: string;
  title: string;
  startedAt: string;
  turns: DraftTurn[];
}

export interface OfflineSession {
  id: string;
  title: string;
  transcriptText: string;
  turns: DraftTurn[];
  createdAt: string;
}

class LocalStorageManager {
  private DRAFT_KEY = "muninn_draft_session";
  private OFFLINE_QUEUE_KEY = "muninn_offline_queue";
  private CACHED_CLAIMS_KEY = "muninn_cached_claims";
  private CACHED_RESURFACING_KEY = "muninn_cached_resurfacing";

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  saveDraft(draft: DraftSession): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn("Local storage write failed:", e);
    }
  }

  saveDraftTurn(sessionId: string, title: string, turn: DraftTurn): void {
    if (!this.isClient()) return;
    try {
      const existing = this.getDraft();
      let draft: DraftSession;
      if (existing && existing.id === sessionId) {
        draft = {
          ...existing,
          turns: [...existing.turns, turn],
        };
      } else {
        draft = {
          id: sessionId,
          title,
          startedAt: new Date().toISOString(),
          turns: [turn],
        };
      }
      this.saveDraft(draft);
    } catch (e) {
      console.warn("Failed to append draft turn:", e);
    }
  }

  getDraft(): DraftSession | null {
    if (!this.isClient()) return null;
    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  clearDraft(): void {
    if (!this.isClient()) return;
    try {
      localStorage.removeItem(this.DRAFT_KEY);
    } catch (e) {
      console.warn("Failed to clear draft:", e);
    }
  }

  queueOfflineSession(session: OfflineSession): void {
    if (!this.isClient()) return;
    try {
      const queue = this.getOfflineQueue();
      queue.push(session);
      localStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn("Failed to queue offline session:", e);
    }
  }

  getOfflineQueue(): OfflineSession[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(this.OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  clearOfflineQueue(): void {
    if (!this.isClient()) return;
    try {
      localStorage.removeItem(this.OFFLINE_QUEUE_KEY);
    } catch (e) {
      console.warn("Failed to clear offline queue:", e);
    }
  }

  cacheClaims(claims: Claim[]): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(this.CACHED_CLAIMS_KEY, JSON.stringify(claims));
    } catch (e) {
      console.warn("Failed to cache claims:", e);
    }
  }

  getCachedClaims(): Claim[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(this.CACHED_CLAIMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  cacheResurfacing(items: ResurfacingItem[]): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(this.CACHED_RESURFACING_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to cache resurfacing items:", e);
    }
  }

  getCachedResurfacing(): ResurfacingItem[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(this.CACHED_RESURFACING_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const localStore = new LocalStorageManager();
