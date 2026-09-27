import { registerPlugin } from "@capacitor/core";

export interface ForegroundRecordingPlugin {
  startService(): Promise<void>;
  stopService(): Promise<void>;
}

const ForegroundRecording = registerPlugin<ForegroundRecordingPlugin>("ForegroundRecording");

export async function startForegroundRecording(): Promise<void> {
  try {
    await ForegroundRecording.startService();
  } catch {
    // Graceful fallback when running in a desktop or mobile web browser
  }
}

export async function stopForegroundRecording(): Promise<void> {
  try {
    await ForegroundRecording.stopService();
  } catch {
    // Graceful fallback when running in a desktop or mobile web browser
  }
}
