import { DbClient } from "../db/client";
import { Bindings } from "../types";

export const MUNINN_SYSTEM_PROMPT = `You are Muninn, a quiet listening companion for someone thinking out loud about their work: a project, a problem, a decision, a plan. Your job during this session is almost entirely to listen well, not to lead.

Rules:
1. Do not summarize, advise, or interject unless the person pauses and seems to be waiting for a response, or directly asks you something.
2. If a statement is ambiguous in a way that would break the record (an unclear referent like 'it', 'that', 'they', a decision without a stated owner, a task without a stated deadline), ask ONE short clarifying question. Do not ask more than one clarifying question per turn.
3. Never invent facts, dates, names, or numbers. If you do not have information, say you do not have it.
4. Keep every response to one short sentence. This is a capture session, not a conversation with you as the main character.
5. If the person says something that sounds financial, medical, or about a third person's private situation, do not comment on it, do not repeat it back, and do not ask about it further than necessary for the record to make sense. Let it pass through to the transcript as-is; downstream systems handle sensitivity, not you.
6. If the person explicitly says 'don't record that' or 'off the record', acknowledge briefly and do not treat the following statement as capturable (flag it for exclusion).
7. At the start of a session, if this is a fresh start, greet briefly and confirm what is being worked on today in one sentence. Do not recap prior sessions here; that happens outside the call, in the resurfacing feed.`;

const AGENTS_BASE_URL = "https://agents.assemblyai.com/v1";

export class VoiceAgentService {
  static async getUserKeyterms(sql: DbClient, userId: string): Promise<string[]> {
    try {
      const rows = (await sql(
        `SELECT name FROM entities WHERE user_id = $1 LIMIT 100`,
        [userId]
      )) as Array<{ name: string }>;
      return rows
        .map((r) => r.name)
        .filter((n) => n && n.trim().length > 1);
    } catch {
      return [];
    }
  }

  static async getOrCreateAgent(
    sql: DbClient,
    env: Bindings,
    userId: string
  ): Promise<string | null> {
    if (env.ASSEMBLYAI_VOICE_AGENT_ID) {
      return env.ASSEMBLYAI_VOICE_AGENT_ID;
    }

    if (!env.ASSEMBLYAI_API_KEY || env.ASSEMBLYAI_API_KEY.includes("your_assemblyai_api_key")) {
      return null;
    }

    const keyterms = await this.getUserKeyterms(sql, userId);

    const payload = {
      name: "Muninn Capture Agent",
      system_prompt: MUNINN_SYSTEM_PROMPT,
      greeting: "Muninn is listening. What are you working on?",
      voice: { voice_id: "anna" },
      turn_taking: {
        silence_threshold_ms: 900,
        allow_interruptions: true,
      },
      keyterms,
      tools: [],
    };

    try {
      const resp = await fetch(`${AGENTS_BASE_URL}/agents`, {
        method: "POST",
        headers: {
          Authorization: env.ASSEMBLYAI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        const data = (await resp.json()) as { id: string };
        return data.id;
      }
      return null;
    } catch {
      return null;
    }
  }

  static async generateToken(
    sql: DbClient,
    env: Bindings,
    userId: string,
    expiresInSeconds: number = 300,
    maxDurationSeconds: number = 8640
  ): Promise<{
    token: string;
    agent_id?: string | null;
    expires_in_seconds: number;
    max_session_duration_seconds: number;
    mode: "live" | "simulation";
  }> {
    const agentId = await this.getOrCreateAgent(sql, env, userId);

    if (!env.ASSEMBLYAI_API_KEY || env.ASSEMBLYAI_API_KEY.includes("your_assemblyai_api_key")) {
      return {
        token: "demo-simulation-token",
        agent_id: agentId || "demo-agent-id",
        expires_in_seconds: expiresInSeconds,
        max_session_duration_seconds: maxDurationSeconds,
        mode: "simulation",
      };
    }

    const clampedExpires = Math.min(Math.max(expiresInSeconds, 1), 600);
    const clampedDuration = Math.min(Math.max(maxDurationSeconds, 60), 10800);

    const url = new URL(`${AGENTS_BASE_URL}/token`);
    url.searchParams.set("expires_in_seconds", String(clampedExpires));
    url.searchParams.set("max_session_duration_seconds", String(clampedDuration));

    const resp = await fetch(url.toString(), {
      headers: {
        Authorization: env.ASSEMBLYAI_API_KEY,
      },
    });

    if (!resp.ok) {
      return {
        token: "fallback-token-" + crypto.randomUUID().slice(0, 8),
        agent_id: agentId,
        expires_in_seconds: clampedExpires,
        max_session_duration_seconds: clampedDuration,
        mode: "simulation",
      };
    }

    const data = (await resp.json()) as { token: string };

    return {
      token: data.token,
      agent_id: agentId,
      expires_in_seconds: clampedExpires,
      max_session_duration_seconds: clampedDuration,
      mode: "live",
    };
  }

  static async fetchSession(env: Bindings, sessionId: string): Promise<any | null> {
    if (!env.ASSEMBLYAI_API_KEY || env.ASSEMBLYAI_API_KEY.includes("your_assemblyai_api_key")) {
      return null;
    }

    try {
      const resp = await fetch(`${AGENTS_BASE_URL}/sessions/${sessionId}`, {
        headers: { Authorization: env.ASSEMBLYAI_API_KEY },
      });
      if (resp.status === 404) return null;
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }

  static async downloadSessionArtifacts(sessionData: any): Promise<{
    timeline: any | null;
    audio_url: string | null;
    metadata: any | null;
  }> {
    const artifacts: Array<{ type: string; url: string }> = sessionData?.artifacts || [];
    const result: { timeline: any | null; audio_url: string | null; metadata: any | null } = {
      timeline: null,
      audio_url: null,
      metadata: null,
    };

    for (const item of artifacts) {
      if (!item.url) continue;

      if (item.type === "timeline") {
        try {
          const resp = await fetch(item.url);
          if (resp.ok) {
            result.timeline = await resp.json();
          }
        } catch {
          // ignore
        }
      } else if (item.type === "audio") {
        result.audio_url = item.url;
      } else if (item.type === "metadata") {
        try {
          const resp = await fetch(item.url);
          if (resp.ok) {
            result.metadata = await resp.json();
          }
        } catch {
          // ignore
        }
      }
    }

    return result;
  }
}
