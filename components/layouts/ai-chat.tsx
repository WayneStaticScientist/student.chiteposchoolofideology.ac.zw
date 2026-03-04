"use client";
import { ImSpinner3 } from "react-icons/im";
import { aiChat } from "@/stores/ai-chat-store";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import Image from "next/image";
export default function AiChat() {
  const ai = aiChat();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // Auto-scroll chat to bottom
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatEndRef.current) {
      console.log("ai chat -> scroll");
      chatEndRef.current!.scrollIntoView({ behavior: "smooth" });
    }
  }, [ai.aiChats, isChatOpen]);

  // --- HANDLERS ---
  const handleSendMessage = (e: any) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    ai.sendMessage(chatInput);
    setChatInput("");
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isChatOpen && (
        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 ease-in-out origin-bottom-right h-[500px] max-h-[70vh]">
          {/* Chat Header */}
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center backdrop-blur-sm">
                <Image
                  src={"/apple-touch-icon.png"}
                  alt={"Van"}
                  width={16}
                  height={16}
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm">The Vanguard</h3>
                <p className="text-xs text-emerald-200">
                  Online & ready to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-emerald-200 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {ai.aiChats.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${!msg.isAI ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm  ${
                    !msg.isAI
                      ? "bg-emerald-600 text-white rounded-br-sm"
                      : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  {msg.isLoading ? (
                    <span className="flex items-center gap-3">
                      <ImSpinner3 className=" animate-spin" /> syncing response
                    </span>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      <MarkdownPreview
                        className="bg-background
                      "
                        style={{
                          backgroundColor: "transparent",
                          color: msg.isAI ? "black" : "white",
                        }}
                        source={msg.message}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md shadow-emerald-500/20"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
          isChatOpen
            ? "bg-slate-800 text-white"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}
