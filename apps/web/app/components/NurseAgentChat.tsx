"use client";
import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import LoadingBubbles from "./LoadingBubbles";

export default function NurseAgentChat() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:3001/nurse-agent/chat",
    }),
  });

  const { isRecording, toggleRecording } = useSpeechRecognition({
    onTranscript: setInput,
  });

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming" || status === "submitted")
      return;

    sendMessage({ text: input });
    setInput("");
  };

  // Helper to extract text parts from a UIMessage
  const getMessageTextContent = (msg: (typeof messages)[0]): string => {
    return msg.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => part.text)
      .join("");
  };

  // Derive agent status (e.g. executing tool) from the last assistant message
  const lastMessage = messages[messages.length - 1];
  let activeToolName: string | null = null;
  if (lastMessage?.role === "assistant") {
    for (const part of lastMessage.parts) {
      const partWithState = part as {
        state?: string;
        toolName?: string;
      };
      if (part.type === "dynamic-tool") {
        if (
          partWithState.state !== "output-available" &&
          partWithState.state !== "output-error" &&
          partWithState.state !== "output-denied"
        ) {
          activeToolName = partWithState.toolName ?? null;
          break;
        }
      }
      if (part.type.startsWith("tool-")) {
        if (
          partWithState.state !== "output-available" &&
          partWithState.state !== "output-error" &&
          partWithState.state !== "output-denied"
        ) {
          activeToolName = part.type.replace("tool-", "");
          break;
        }
      }
    }
  }

  const agentStatus =
    (status === "streaming" || status === "submitted") && activeToolName
      ? `Executing tool: ${activeToolName}...`
      : null;

  // Filter messages to show only non-empty user and assistant messages
  const visibleMessages = messages.filter((msg) => {
    const hasText = getMessageTextContent(msg).trim() !== "";
    return (
      (msg.role === "user" && hasText) || (msg.role === "assistant" && hasText)
    );
  });

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 border rounded-lg shadow-sm">
      {/* Header & Active Tool Status Banner */}
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Nurse Assistant 🩺</h1>
        {agentStatus && (
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full animate-pulse">
            🛠️ {agentStatus}
          </span>
        )}
      </header>

      {/* Message History Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {visibleMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-100 text-gray-800"
            }`}
          >
            {getMessageTextContent(msg)}
          </div>
        ))}
        {isStreaming && !activeToolName && (
          <div>
            <LoadingBubbles />
            <p className="text-gray-400 text-sm italic animate-pulse">
              Agent thinking...
            </p>
          </div>
        )}
        {error && (
          <p className="text-red-500 text-sm italic">Error: {error.message}</p>
        )}
      </div>

      {/* Voice Dictation & Text Input */}
      <form onSubmit={onSend} className="p-4 border-t flex gap-2 items-center">
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-3 rounded-full text-white font-semibold transition-all ${
            isRecording
              ? "bg-red-500 animate-pulse"
              : "bg-gray-700 hover:bg-gray-800"
          }`}
          title={isRecording ? "Stop Listening" : "Start Voice Dictation"}
        >
          {isRecording ? "🛑" : "🎙️"}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Dictate or type command (e.g. Check PAT-8X2K9)..."
          className="flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
