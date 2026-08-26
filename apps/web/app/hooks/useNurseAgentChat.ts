import { useState } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useNurseAgentChat() {
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);

  const handleSendText = async (onBeforeSend?: () => void) => {
    if (!prompt.trim() || isStreaming) return;

    if (onBeforeSend) {
      onBeforeSend();
    }

    const userText = prompt;
    setPrompt("");
    setIsStreaming(true);
    setAgentStatus(null);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("http://localhost:3001/nurse-agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const rawData = line.replace("data: ", "").trim();
          if (!rawData) continue;

          try {
            const part = JSON.parse(rawData);
            console.log("📡 SSE Part Received:", part);

            if (part.type === "tool-call") {
              setAgentStatus(`Executing tool: ${part.toolName}...`);
            }
            if (part.type === "tool-result") {
              setAgentStatus(null);
            }
            if (part.type === "error") {
              console.error("AI Error:", part.error);
              setAgentStatus("Error occurred while generating response.");
            }

            if (part.type === "text-delta") {
              const deltaText = part.textDelta ?? part.text ?? "";
              setMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                const lastMessage = updated[lastIndex];
                if (lastMessage?.role === "assistant") {
                  updated[lastIndex] = {
                    ...lastMessage,
                    content: lastMessage.content + deltaText,
                  };
                }
                return updated;
              });
            }
          } catch (err) {
            console.error("Error parsing chunk:", err);
          }
        }
      }
    } catch (err) {
      console.error("Stream request failed:", err);
    } finally {
      setIsStreaming(false);
      setAgentStatus(null);
    }
  };

  return {
    prompt,
    setPrompt,
    messages,
    isStreaming,
    agentStatus,
    handleSendText,
  };
}
