"use client";
import React from "react";
import { useNurseAgentChat } from "../hooks/useNurseAgentChat";
import LoadingBubbles from "./LoadingBubbles";
import TextareaAutosize from "react-textarea-autosize";

export default function NurseAgentChat() {
  const {
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
  } = useNurseAgentChat();

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 border rounded-lg shadow-sm">
      {/* Header & Active Tool Status Banner */}
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Nurse Assistant 🩺</h1>
        <div className="flex items-center gap-2">
          {agentStatus && (
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full animate-pulse">
              🛠️ {agentStatus}
            </span>
          )}
          {isSpeaking && (
            <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full animate-pulse">
              🔊 Speaking…
            </span>
          )}
          {/* Auto-read / Mute toggle */}
          {ttsSupported && (
            <button
              type="button"
              onClick={toggleAutoRead}
              title={autoRead ? "Mute auto-read" : "Enable auto-read"}
              className={`p-2 rounded-full text-lg transition-all ${
                autoRead
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-400"
              }`}
            >
              {autoRead ? "🔊" : "🔇"}
            </button>
          )}
        </div>
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
            {msg.text}
          </div>
        ))}
        {isStreaming && !agentStatus && (
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

        <TextareaAutosize
          minRows={1}
          maxRows={6}
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
