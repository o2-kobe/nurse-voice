import { useState, useRef } from "react";
import {
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
  SpeechRecognitionInstance,
  SpeechRecognitionWindow,
} from "../types/nurseAgent.types";

interface UseSpeechRecognitionOptions {
  onTranscript: (transcript: string) => void;
}

export function useSpeechRecognition({
  onTranscript,
}: UseSpeechRecognitionOptions) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GH";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (const result of event.results) {
        const alternative = result[0];
        if (alternative) {
          transcript += alternative.transcript;
        }
      }
      console.log("🎙️ Transcribed Speech:", transcript);
      onTranscript(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    toggleRecording,
    stopRecording,
  };
}
