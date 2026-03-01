import { sendMessageStream } from "@/services/ai-chat";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const aiChat = create<{
  aiChats: AiMessageModel[];
  sendMessage: (message: string) => void;
}>()(
  immer((set, get) => ({
    aiChats: [],
    sendMessage: async (message: string) => {
      set((state) => {
        state.aiChats.push({ isAI: false, message: message, isLoading: false });
      });

      // 2. Add an empty AI message that we will "fill" with the stream
      set((state) => {
        state.aiChats.push({ isAI: true, message: "", isLoading: true });
      });

      // Get the index of the message we just added (the last one)
      const aiMessageIndex = get().aiChats.length - 1;

      try {
        // 3. Start the stream (using the function we converted earlier)
        const stream = sendMessageStream(message, get().aiChats);
        for await (const chunk of stream) {
          set((state) => {
            state.aiChats[aiMessageIndex].message += chunk.replaceAll(
              "\\n",
              "",
            );
            state.aiChats[aiMessageIndex].isLoading = false;
          });
        }
      } catch (error) {
        set((state) => {
          state.aiChats[aiMessageIndex].message =
            "Error: Could not connect to AI.";
        });
      }
    },
  })),
);
