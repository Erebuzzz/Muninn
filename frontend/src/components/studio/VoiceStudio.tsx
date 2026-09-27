"use client";

import React, { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { soundFX } from "@/lib/soundfx";
import { localStore } from "@/lib/storage";
import { startForegroundRecording, stopForegroundRecording } from "@/lib/foregroundService";
import { Waveform } from "./Waveform";

interface VoiceStudioProps {
  onSessionCompleted?: (sessionId: string) => void;
  onExtractionFinished?: () => void;
}

interface TranscriptTurn {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  onSessionCompleted,
  onExtractionFinished,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "listening" | "processing">("idle");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [rawText, setRawText] = useState("");
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("PCB & Heatsink Sync");
  const [manualTranscript, setManualTranscript] = useState(
    "Speaker A: We got the updated revision of the PCB today from the fabricator.\n" +
    "Speaker A: The mounting holes on the heatsink bracket do not align with the board.\n" +
    "Speaker A: We decided to pause enclosure fabrication until the heatsink redesign is verified.\n" +
    "Speaker A: Task for Alex: redesign the heatsink mounting bracket by Thursday.\n" +
    "Speaker A: Question: should we order the high-conductivity thermal paste now or wait for the new bracket?\n" +
    "Speaker A: Off the record, Alex mentioned the supplier overcharged us by $1,200 on the prototype batch."
  );

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const startLiveSession = async () => {
    try {
      setStatus("connecting");
      soundFX.playSessionStart();
      await startForegroundRecording();

      const conv = await api.createSession("Live Capture Session");
      setCurrentSessionId(conv.id);

      const tokenData = await api.getVoiceToken();

      if (tokenData.token === "demo-simulation-token") {
        setStatus("listening");
        setIsRecording(true);
        simulateTurn("Speaker A", "Starting capture session. Discussing the battery management module.");
        return;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;
      await audioCtx.audioWorklet.addModule("/pcm-processor.js");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false },
      });
      micStreamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");

      const wsUrl = new URL("wss://agents.assemblyai.com/v1/ws");
      wsUrl.searchParams.set("token", tokenData.token);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      let ready = false;
      let playbackTime = audioCtx.currentTime;

      workletNode.port.onmessage = (e) => {
        if (ready && ws.readyState === WebSocket.OPEN) {
          const b64 = btoa(String.fromCharCode(...new Uint8Array(e.data)));
          ws.send(JSON.stringify({ type: "input.audio", audio: b64 }));
        }
      };

      source.connect(workletNode).connect(audioCtx.destination);

      ws.onopen = () => {
        if (tokenData.agent_id) {
          ws.send(JSON.stringify({
            type: "session.update",
            session: { agent_id: tokenData.agent_id },
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "session.ready") {
            ready = true;
            setStatus("listening");
            setIsRecording(true);
          } else if (msg.type === "transcript.user" && msg.text) {
            soundFX.playTurnDetected();
            addTurn("Speaker A", msg.text);
          } else if (msg.type === "transcript.agent" && msg.text) {
            addTurn("Muninn", msg.text);
          } else if (msg.type === "reply.audio" && msg.data) {
            playAgentAudio(msg.data, audioCtx, playbackTime);
          }
        } catch (err) {
          console.error("WebSocket message parse error", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setStatus("idle");
        setIsRecording(false);
      };

      ws.onclose = () => {
        setStatus("idle");
        setIsRecording(false);
      };

    } catch (err) {
      console.error("Failed to start session:", err);
      setStatus("idle");
      setIsRecording(false);
      alert("Could not access microphone or connect to voice gateway. You can use the Import/Simulate option below.");
    }
  };

  const playAgentAudio = (base64Audio: string, audioCtx: AudioContext, playbackTime: number) => {
    try {
      const raw = atob(base64Audio);
      const pcm16 = new Int16Array(raw.length / 2);
      for (let i = 0; i < pcm16.length; i++) {
        pcm16[i] = raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8);
      }
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768;
      }
      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      src.connect(audioCtx.destination);
      const now = audioCtx.currentTime;
      const scheduledTime = Math.max(playbackTime, now);
      src.start(scheduledTime);
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  const addTurn = (speaker: string, text: string) => {
    const newTurn: TranscriptTurn = {
      id: Math.random().toString(36).substring(2, 9),
      speaker,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setTurns((prev) => {
      const updated = [...prev, newTurn];
      if (currentSessionId) {
        localStore.saveDraftTurn(currentSessionId, "Active Session", newTurn);
      }
      return updated;
    });
  };

  const simulateTurn = (speaker: string, text: string) => {
    soundFX.playTurnDetected();
    addTurn(speaker, text);
  };

  const endSession = async () => {
    setStatus("processing");
    soundFX.playSessionEnd();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "session.end" }));
      wsRef.current.close();
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }

    await stopForegroundRecording();

    setIsRecording(false);

    if (currentSessionId) {
      const fullTranscript = turns.map((t) => `${t.speaker}: ${t.text}`).join("\n");
      try {
        await api.completeSession(currentSessionId, {
          transcript_text: fullTranscript,
          raw_transcript: { turns },
        });
        if (onSessionCompleted) onSessionCompleted(currentSessionId);
        if (onExtractionFinished) onExtractionFinished();
      } catch (err) {
        console.error("Error completing session:", err);
      }
    }

    setStatus("idle");
  };

  const handleManualImport = async () => {
    if (!manualTranscript.trim()) return;
    setStatus("processing");
    soundFX.playSessionStart();

    try {
      await api.extractRaw(manualTranscript, manualTitle);
      soundFX.playClaimStored();
      setManualInputOpen(false);
      if (onExtractionFinished) onExtractionFinished();
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to extract from transcript.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="bg-[#11151c] border border-[#1e2634] rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Top Banner with session state */}
      <div className="flex items-center justify-between border-b border-[#1c2330] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            status === "listening" ? "bg-amber-400 animate-ping" : status === "connecting" ? "bg-cyan-400 animate-pulse" : "bg-[#2a3547]"
          }`} />
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
              Capture Session
            </h2>
            <p className="text-xs text-[#8b9bb4]">
              {status === "listening"
                ? "Muninn is listening. Speak freely; clarify when asked."
                : status === "processing"
                ? "Extracting claims, linking entities, evaluating resurfacing..."
                : "Opt-in recording. Nothing is stored until you decide."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setManualInputOpen(!manualInputOpen)}
            className="text-xs px-2.5 py-1 rounded bg-[#161b24] hover:bg-[#1f2633] text-[#8b9bb4] hover:text-white border border-[#222c3e] transition"
          >
            {manualInputOpen ? "Close Import" : "Import / Seed Scenario"}
          </button>
        </div>
      </div>

      {/* Manual Import / Synthetic Test Panel */}
      {manualInputOpen && (
        <div className="mb-5 p-4 rounded-lg bg-[#0e1219] border border-[#2a3547] text-xs">
          <div className="font-semibold text-white mb-1">Pre-seed / Ingest Conversation</div>
          <p className="text-[#8b9bb4] mb-3">
            Paste a transcript with tagged speakers. Claims, relationships, and sensitivity flags will be automatically extracted.
          </p>
          <input
            type="text"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            className="w-full bg-[#161b24] border border-[#222c3e] rounded px-3 py-1.5 text-white mb-2 focus:outline-none focus:border-amber-500"
            placeholder="Conversation Title"
          />
          <textarea
            value={manualTranscript}
            onChange={(e) => setManualTranscript(e.target.value)}
            rows={5}
            className="w-full bg-[#161b24] border border-[#222c3e] rounded p-2.5 text-white font-mono text-[11px] mb-3 focus:outline-none focus:border-amber-500"
            placeholder="Speaker A: We noticed..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setManualInputOpen(false)}
              className="px-3 py-1.5 rounded text-[#8b9bb4] hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleManualImport}
              disabled={status === "processing"}
              className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold transition disabled:opacity-50"
            >
              Run Extraction
            </button>
          </div>
        </div>
      )}

      {/* Visualizer */}
      <Waveform isActive={status === "listening"} />

      {/* Live Transcripts Scroll */}
      <div className="min-h-[140px] max-h-[220px] overflow-y-auto rounded-lg bg-[#0c0f15] border border-[#1a212d] p-3 my-4 space-y-2.5">
        {turns.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-[#4b5563] italic">
            {status === "listening"
              ? "Listening... spoken utterances will appear here in real time."
              : "No active audio. Click 'Start Capture' or 'Import Scenario' to begin."}
          </div>
        ) : (
          turns.map((turn) => (
            <div key={turn.id} className="text-xs flex gap-2">
              <span
                className={`font-mono font-medium px-1.5 py-0.5 rounded text-[10px] shrink-0 h-fit ${
                  turn.speaker === "Muninn"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-[#1f2633] text-[#94a3b8]"
                }`}
              >
                {turn.speaker}
              </span>
              <span className="text-[#e2e8f0] flex-1 leading-relaxed">{turn.text}</span>
              <span className="text-[10px] text-[#4b5563] shrink-0">{turn.timestamp}</span>
            </div>
          ))
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-[11px] text-[#8b9bb4]">
          {isRecording ? (
            <span className="text-amber-400 font-medium">Session in progress (AudioWorklet 24 kHz)</span>
          ) : (
            <span>Ready for session</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={startLiveSession}
              disabled={status === "connecting" || status === "processing"}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
              Start Capture
            </button>
          ) : (
            <button
              onClick={endSession}
              disabled={status === "processing"}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <span className="w-2 h-2 rounded bg-white" />
              End & Remember
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
