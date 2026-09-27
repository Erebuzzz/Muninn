import { Preferences } from "@capacitor/preferences";
import { Claim, ResurfacingItem, Conversation, User } from "./types";

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
  private AUTH_TOKEN_KEY = "muninn_auth_token";
  private AUTH_USER_KEY = "muninn_auth_user";
  private inMemoryToken: string | null = null;
  private inMemoryUser: User | null = null;

  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  async initAuth(): Promise<{ token: string | null; user: User | null }> {
    if (!this.isClient()) return { token: null, user: null };
    try {
      const { value: tokenVal } = await Preferences.get({ key: this.AUTH_TOKEN_KEY });
      const { value: userVal } = await Preferences.get({ key: this.AUTH_USER_KEY });
      this.inMemoryToken = tokenVal || localStorage.getItem(this.AUTH_TOKEN_KEY);
      const userRaw = userVal || localStorage.getItem(this.AUTH_USER_KEY);
      this.inMemoryUser = userRaw ? JSON.parse(userRaw) : null;
      return { token: this.inMemoryToken, user: this.inMemoryUser };
    } catch {
      this.inMemoryToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
      const userRaw = localStorage.getItem(this.AUTH_USER_KEY);
      this.inMemoryUser = userRaw ? JSON.parse(userRaw) : null;
      return { token: this.inMemoryToken, user: this.inMemoryUser };
    }
  }

  async saveAuth(token: string, user: User): Promise<void> {
    this.inMemoryToken = token;
    this.inMemoryUser = user;
    if (!this.isClient()) return;
    try {
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      localStorage.setItem(this.AUTH_USER_KEY, JSON.stringify(user));
      await Preferences.set({ key: this.AUTH_TOKEN_KEY, value: token });
      await Preferences.set({ key: this.AUTH_USER_KEY, value: JSON.stringify(user) });
    } catch (e) {
      console.warn("Preferences write failed:", e);
    }
  }

  getAuthToken(): string | null {
    if (this.inMemoryToken) return this.inMemoryToken;
    if (!this.isClient()) return null;
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  getAuthUser(): User | null {
    if (this.inMemoryUser) return this.inMemoryUser;
    if (!this.isClient()) return null;
    try {
      const raw = localStorage.getItem(this.AUTH_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async clearAuth(): Promise<void> {
    this.inMemoryToken = null;
    this.inMemoryUser = null;
    if (!this.isClient()) return;
    try {
      localStorage.removeItem(this.AUTH_TOKEN_KEY);
      localStorage.removeItem(this.AUTH_USER_KEY);
      await Preferences.remove({ key: this.AUTH_TOKEN_KEY });
      await Preferences.remove({ key: this.AUTH_USER_KEY });
    } catch (e) {
      console.warn("Preferences remove failed:", e);
    }
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
