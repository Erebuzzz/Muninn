import { Bindings } from "../types";

export interface SyncSTTResult {
  text: string;
  words: Array<{ text: string; start: number; end: number; confidence: number }>;
  confidence: number;
  audio_duration_ms?: number;
  session_id?: string;
  request_time_ms?: number;
}

export class SyncSTTService {
  static async transcribeAudio(
    audioBytes: ArrayBuffer,
    mimeType: string = "audio/wav",
    env: Bindings,
    prompt: string = "Engineering voice memo capturing decisions, tasks, questions, or observations."
  ): Promise<SyncSTTResult> {
    if (!env.ASSEMBLYAI_API_KEY || env.ASSEMBLYAI_API_KEY.includes("your_assemblyai_api_key")) {
      return {
        text: "Simulated quick note: We verified the heatsink mounting bracket screws align with the revision B PCB.",
        words: [],
        confidence: 0.95,
        audio_duration_ms: 3200,
        session_id: "sim-" + crypto.randomUUID().slice(0, 8),
      };
    }

    const formData = new FormData();
    const audioBlob = new Blob([audioBytes], { type: mimeType });
    formData.append("audio", audioBlob, "quick-note.wav");
    formData.append(
      "config",
      JSON.stringify({
        prompt,
        timestamps: true,
      })
    );

    try {
      const resp = await fetch("https://sync.assemblyai.com/transcribe", {
        method: "POST",
        headers: {
          Authorization: env.ASSEMBLYAI_API_KEY,
          "X-AAI-Model": "universal-3-5-pro",
        },
        body: formData,
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Sync STT API returned ${resp.status}: ${errorText}`);
      }

      const result = (await resp.json()) as SyncSTTResult;
      return result;
    } catch (err) {
      console.error("[Sync STT] Transcription failed:", err);
      throw err;
    }
  }
}
