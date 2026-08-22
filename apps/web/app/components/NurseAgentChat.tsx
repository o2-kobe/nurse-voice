"use client";
import React, { useState, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function NurseAgentChat() {
  // 1. Core State Registration
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);

  // 2. Persistent reference for the Web Speech instance
  const recognitionRef = useRef<any>(null);

  // 3. Web Speech API Dictation Toggle 🎙️
  const toggleRecording = () => {
    if (isRecording) {
      // Stop active recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Check browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keeps listening until manually stopped
    recognition.interimResults = true; // Streams text as words are spoken

    // Live Speech Capture
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");

      console.log("🎙️ Transcribed Speech:", transcript);
      setPrompt(transcript); // 🔄 Updates input field live!
    };

    // Reset recording state when audio stops
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      switch (event.error) {
        case "no-speech":
          console.log("No speech detected.");
          break;

        case "not-allowed":
          console.error("Microphone permission was denied.");
          setIsRecording(false);
          break;

        case "audio-capture":
          console.error(
            "No microphone was found or the microphone is unavailable.",
          );
          setIsRecording(false);
          break;

        case "network":
          console.error("Speech recognition network error.");
          setIsRecording(false);
          break;

        default:
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
      }
    };

    // Store reference & start audio capture
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // 4. SSE Stream Handler Placeholder 📡
  const handleSendText = async () => {
    if (!prompt.trim() || isStreaming) return;

    // Stop recording if active when sending
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    console.log("Sending prompt to NestJS backend:", prompt);
    // SSE fetch streaming logic will go here
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 border rounded-lg shadow-sm">
      {/* 🏥 Header & Active Tool Status Banner */}
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Nurse Assistant 🩺</h1>
        {agentStatus && (
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full animate-pulse">
            🛠️ {agentStatus}
          </span>
        )}
      </header>

      {/* 💬 Message History Feed */}
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

      {/* 🎛️ Voice Dictation & Text Input */}
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
          onKeyDown={(e) => e.key === "Enter" && handleSendText()}
        />

        <button
          onClick={handleSendText}
          disabled={isStreaming || !prompt.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
