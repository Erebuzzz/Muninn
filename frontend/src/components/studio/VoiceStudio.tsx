"use client";

import React, { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { soundFX } from "@/lib/soundfx";
import { localStore } from "@/lib/storage";
import { startForegroundRecording, stopForegroundRecording } from "@/lib/foregroundService";
import { Waveform } from "./Waveform";
import { MythicMicButton } from "./MythicMicButton";
import { runeCipherDecode } from "@/lib/animations";

interface VoiceStudioProps {
  onSessionCompleted?: (sessionId: string) => void;
  onExtractionFinished?: () => void;
}

interface TranscriptTurn {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  isNew?: boolean;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({
  onSessionCompleted,
  onExtractionFinished,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [status, setStatus] = useState<"idle" | "connecting" | "listening" | "processing">("idle");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [manualInputOpen, setManualInputOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("PCB & Thermal Heatsink Sync");
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
  const [isRecordingMemo, setIsRecordingMemo] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const turnsEndRef = useRef<HTMLDivElement | null>(null);

  // Live timer for capture duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

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
      isNew: true,
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

  const handleMicToggle = () => {
    if (isRecording) {
      endSession();
    } else {
      startLiveSession();
    }
  };

  const startQuickMemo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        stream.getTracks().forEach((t) => t.stop());
        setStatus("processing");
        try {
          const res = await api.submitQuickNote(audioBlob);
          soundFX.playClaimStored();
          setTurns((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              speaker: "You (Quick Note)",
              text: res.transcript_text,
              timestamp: new Date().toLocaleTimeString(),
              isNew: true,
            },
          ]);
          if (onExtractionFinished) onExtractionFinished();
        } catch (err) {
          console.error("Quick note error:", err);
          alert("Quick note capture failed. Verify microphone permissions.");
        } finally {
          setStatus("idle");
          setIsRecordingMemo(false);
        }
      };

      recorder.start();
      setIsRecordingMemo(true);
      setStatus("listening");
      soundFX.playSessionStart();
    } catch (err) {
      console.error("Mic access failed:", err);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopQuickMemo = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
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
    <div className="glass-window relative rounded-2xl p-6 shadow-2xl overflow-hidden">
      {/* Sun Orange Decorative Horizon Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />

      {/* Header and Telemetry */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              status === "listening"
                ? "bg-orange-500 shadow-md shadow-orange-500/80 animate-ping"
                : status === "connecting"
                ? "bg-sky-400 animate-pulse"
                : "bg-slate-400 dark:bg-slate-700"
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-widest">
                Odin&apos;s Ear: Acoustic Capture
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-slate-900 border border-orange-500/30 dark:border-slate-700/80 text-orange-600 dark:text-orange-400">
                24kHz PCM
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {status === "listening"
                ? "Muninn is actively transcribing. Ground-truth claims crystallize automatically."
                : status === "processing"
                ? "Dissecting semantic claims, entities, and surfacing vectors..."
                : "Opt-in recording. Zero retention until you decide."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setManualInputOpen(!manualInputOpen)}
            className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-300 dark:border-slate-700/70 transition shadow-sm"
          >
            {manualInputOpen ? "Close Scenario" : "Import / Seed Scenario"}
          </button>
        </div>
      </div>

      {/* Manual Ingest Panel */}
      {manualInputOpen && (
        <div className="mb-5 p-4 rounded-xl bg-slate-900/90 border border-orange-500/30 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-200">Ingest Conversation Transcript</span>
            <span className="text-[10px] font-mono text-orange-400">SYNTHETIC INGESTION</span>
          </div>
          <p className="text-slate-400 mb-3 text-[11px]">
            Input meeting transcript with tagged speakers. Hypotheses, decisions, and tasks will be extracted with ground-truth citations.
          </p>
          <input
            type="text"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 mb-2.5 focus:outline-none focus:border-orange-500 text-xs font-mono"
            placeholder="Conversation Title"
          />
          <textarea
            value={manualTranscript}
            onChange={(e) => setManualTranscript(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono text-[11px] mb-3 focus:outline-none focus:border-orange-500 leading-relaxed"
            placeholder="Speaker A: We noticed..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setManualInputOpen(false)}
              className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              onClick={handleManualImport}
              disabled={status === "processing"}
              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-semibold font-mono text-xs transition disabled:opacity-50"
            >
              Crystallize Memory
            </button>
          </div>
        </div>
      )}

      {/* Central Mythic Raven Mic & Waveform Display */}
      <div className="my-6 flex flex-col items-center justify-center">
        <MythicMicButton
          isRecording={isRecording}
          onToggle={handleMicToggle}
          disabled={status === "connecting" || status === "processing" || isRecordingMemo}
          duration={recordingSeconds}
          size={96}
        />
        <Waveform isActive={status === "listening"} className="mt-4" />
      </div>

      {/* Live Stream Runic Transcript Feed */}
      <div className="min-h-[140px] max-h-[220px] overflow-y-auto rounded-2xl bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800/80 p-3.5 space-y-2.5 shadow-inner">
        {turns.length === 0 ? (
          <div className="h-28 flex flex-col items-center justify-center text-xs text-slate-500 italic">
            <span className="font-mono text-slate-400 dark:text-slate-600 text-sm mb-1">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ</span>
            {status === "listening"
              ? "Awaiting speech... Spoken utterances decode in real time."
              : "No active audio stream. Tap the mythic raven mic to initiate live capture."}
          </div>
        ) : (
          turns.map((turn) => (
            <TranscriptTurnRow key={turn.id} turn={turn} />
          ))
        )}
        <div ref={turnsEndRef} />
      </div>

      {/* Tactical Sub-Controls (Quick Voice Memo & State HUD) */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200/80 dark:border-slate-800/40">
        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-2">
          {isRecording ? (
            <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              Live Stream Active (PCM 24kHz)
            </span>
          ) : isRecordingMemo ? (
            <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              Voice Memo Recording (Sync STT)
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">Capture Idle. Ready for stream or memo.</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isRecording && (
            <button
              onClick={isRecordingMemo ? stopQuickMemo : startQuickMemo}
              disabled={status === "connecting" || status === "processing"}
              className={`px-4 py-2 rounded-full font-mono text-xs font-medium transition shadow-md flex items-center gap-2 ${
                isRecordingMemo
                  ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                  : "bg-white/80 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-300 border border-slate-300 dark:border-slate-700/80"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isRecordingMemo ? "bg-white" : "bg-sky-400"}`}
              />
              {isRecordingMemo ? "Finish Memo" : "Quick Memo"}
            </button>
          )}

          {isRecording && (
            <button
              onClick={endSession}
              disabled={status === "processing"}
              className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold transition shadow-md flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              End & Crystallize
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Runic decipher text row component
function TranscriptTurnRow({ turn }: { turn: TranscriptTurn }) {
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (turn.isNew && textRef.current) {
      runeCipherDecode(textRef.current, turn.text, 700);
      turn.isNew = false;
    }
  }, [turn]);

  return (
    <div className="text-xs flex items-start gap-2.5">
      <span
        className={`font-mono font-medium px-2.5 py-0.5 rounded-full text-[10px] shrink-0 h-fit border ${
          turn.speaker === "Muninn"
            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
            : "bg-sky-500/10 dark:bg-slate-900 text-sky-700 dark:text-sky-300 border-sky-500/20 dark:border-slate-800"
        }`}
      >
        {turn.speaker}
      </span>
      <span ref={textRef} className="text-slate-900 dark:text-slate-200 flex-1 leading-relaxed font-sans">
        {turn.text}
      </span>
      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">{turn.timestamp}</span>
    </div>
  );
}
