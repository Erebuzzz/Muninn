import { DbClient } from "../db/client";
import { Bindings } from "../types";

export const COPILOT_SYSTEM_PROMPT = `You are Muninn, an active engineering co-pilot and technical thought partner.
Your role during this session is to collaborate with the user in real-time:
1. Brainstorm solutions, analyze technical trade-offs, and suggest architectural approaches when the user presents an engineering problem or decision.
2. Engage in dynamic, multi-turn back-and-forth conversation. Listen carefully to user statements, validate their reasoning, and offer clear constructive ideas or solutions.
3. Keep spoken replies concise and conversational (1 to 3 natural sentences per turn) so conversation flows naturally without monologues.
4. When a technical decision or action item emerges, summarize it crisply so it can be committed to memory.
5. If the user asks for alternatives or feedback, provide concrete, actionable technical recommendations.`;

export const SCRIBE_SYSTEM_PROMPT = `You are Muninn, a quiet scribe and listening companion.
Your role during this session is purely to listen and transcribe:
1. Do not give advice, do not summarize, and do not speak unless directly addressed or asked a direct question.
2. If asked directly, answer in one short factual sentence.
3. This is a capture session focused entirely on recording the user's spoken thoughts for memory retention.`;

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
    userId: string,
    mode: "copilot" | "scribe" = "copilot"
  ): Promise<string | null> {
    if (env.ASSEMBLYAI_VOICE_AGENT_ID) {
      return env.ASSEMBLYAI_VOICE_AGENT_ID;
    }

    if (!env.ASSEMBLYAI_API_KEY || env.ASSEMBLYAI_API_KEY.includes("your_assemblyai_api_key")) {
      return null;
    }

    const keyterms = await this.getUserKeyterms(sql, userId);

    const isCopilot = mode === "copilot";
    const payload = {
      name: isCopilot ? "Muninn Engineering Co-Pilot" : "Muninn Quiet Scribe",
      system_prompt: isCopilot ? COPILOT_SYSTEM_PROMPT : SCRIBE_SYSTEM_PROMPT,
      greeting: isCopilot ? "Muninn is listening. What are we solving today?" : "",
      voice: { voice_id: "anna" },
      turn_taking: {
        silence_threshold_ms: isCopilot ? 700 : 1200,
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
    mode: "copilot" | "scribe" = "copilot",
    expiresInSeconds: number = 300,
    maxDurationSeconds: number = 8640
  ): Promise<{
    token: string;
    agent_id?: string | null;
    agent_mode: "copilot" | "scribe";
    expires_in_seconds: number;
    max_session_duration_seconds: number;
    mode: "live" | "simulation";
  }> {
    const agentId = await this.getOrCreateAgent(sql, env, userId, mode);

    if (!env.ASSEMBLYAI_API_KEY || env.ASSEMBLYAI_API_KEY.includes("your_assemblyai_api_key")) {
      return {
        token: "demo-simulation-token",
        agent_id: agentId || "demo-agent-id",
        agent_mode: mode,
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
        agent_mode: mode,
        expires_in_seconds: clampedExpires,
        max_session_duration_seconds: clampedDuration,
        mode: "simulation",
      };
    }

    const data = (await resp.json()) as { token: string };

    return {
      token: data.token,
      agent_id: agentId,
      agent_mode: mode,
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
