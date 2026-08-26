"use client";
import React from "react";
import { useNurseAgentChat } from "../hooks/useNurseAgentChat";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function NurseAgentChat() {
  const {
    prompt,
    setPrompt,
    messages,
    isStreaming,
    agentStatus,
    handleSendText,
  } = useNurseAgentChat();

  const { isRecording, toggleRecording, stopRecording } = useSpeechRecognition({
    onTranscript: setPrompt,
  });

  const onSend = () => {
    handleSendText(stopRecording);
  };

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
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-100 text-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isStreaming && (
          <p className="text-gray-400 text-sm italic">Agent thinking...</p>
        )}
      </div>

      {/* Voice Dictation & Text Input */}
      <div className="p-4 border-t flex gap-2 items-center">
        <button
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
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Dictate or type command (e.g. Check PAT-8X2K9)..."
          className="flex-1 border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === "Enter" && onSend()}
        />

        <button
          onClick={onSend}
          disabled={isStreaming || !prompt.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
