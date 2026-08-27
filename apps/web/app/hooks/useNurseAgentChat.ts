"use client";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { useTextToSpeech } from "./useTextToSpeech";

// Shape of a visible message
export interface VisibleMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

// Everything the presentational component need
export interface UseNurseAgentChatReturn {
  // Input
  input: string;
  setInput: (value: string) => void;
  onSend: (e: React.FormEvent) => void;

  // Messages
  visibleMessages: VisibleMessage[];
  error: Error | undefined;

  // Stream / tool state
  isStreaming: boolean;
  agentStatus: string | null;

  // Voice dictation (STT)
  isRecording: boolean;
  toggleRecording: () => void;

  // Text-to-speech
  isSpeaking: boolean;
  ttsSupported: boolean;
  autoRead: boolean;
  toggleAutoRead: () => void;
}

// Helper to extract plain text from a message's parts
function extractText(
  parts: { type: string; [key: string]: unknown }[],
): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

// Helper to derive the name of the currently active tool (if any)
function getActiveToolName(
  msg:
    | { role: string; parts: { type: string; [key: string]: unknown }[] }
    | undefined,
): string | null {
  if (!msg || msg.role !== "assistant") return null;

  for (const part of msg.parts) {
    const p = part as { type: string; state?: string; toolName?: string };
    const isRunning =
      p.state !== "output-available" &&
      p.state !== "output-error" &&
      p.state !== "output-denied";

    if (p.type === "dynamic-tool" && isRunning) return p.toolName ?? null;
    if (p.type.startsWith("tool-") && isRunning)
      return p.type.replace("tool-", "");
  }
  return null;
}

// Main Hook
export function useNurseAgentChat(): UseNurseAgentChatReturn {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:3001/nurse-agent/chat",
    }),
  });

  const { isRecording, toggleRecording } = useSpeechRecognition({
    onTranscript: setInput,
  });

  const {
    isSpeaking,
    isSupported: ttsSupported,
    autoRead,
    toggleAutoRead,
    speak,
    stop,
  } = useTextToSpeech({ rate: 1, pitch: 1, voiceName: "female" });

  // Auto-read completed assistant messages
  const lastReadIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    if (!autoRead || !ttsSupported) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    if (lastMsg.id === lastReadIdRef.current) return;

    const text = extractText(
      lastMsg.parts as { type: string; [key: string]: unknown }[],
    ).trim();
    if (!text) return;

    lastReadIdRef.current = lastMsg.id;
    speak(text);
  }, [messages, status, autoRead, ttsSupported, speak]);

  // Derived state
  const isStreaming = status === "streaming" || status === "submitted";

  const lastMessage = messages[messages.length - 1] as
    | { role: string; parts: { type: string; [key: string]: unknown }[] }
    | undefined;

  const activeToolName = getActiveToolName(lastMessage);

  const agentStatus =
    isStreaming && activeToolName
      ? `Executing tool: ${activeToolName}...`
      : null;

  const visibleMessages: VisibleMessage[] = messages
    .filter((msg) => {
      const text = extractText(
        msg.parts as { type: string; [key: string]: unknown }[],
      ).trim();
      return (msg.role === "user" || msg.role === "assistant") && text !== "";
    })
    .map((msg) => ({
      id: msg.id,
      role: msg.role as "user" | "assistant",
      text: extractText(
        msg.parts as { type: string; [key: string]: unknown }[],
      ),
    }));

  // Actions
  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    stop();
    sendMessage({ text: input });
    setInput("");
  };

  return {
    input,
    setInput,
    onSend,
    visibleMessages,
    error,
    isStreaming,
    agentStatus,
    isRecording,
    toggleRecording,
    isSpeaking,
    ttsSupported,
    autoRead,
    toggleAutoRead,
  };
}
