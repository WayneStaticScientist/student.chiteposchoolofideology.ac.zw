import axios, { AxiosResponse } from "axios";

interface AiMessageModel {
  isAI: boolean;
  message: string;
}

export async function* sendMessageStream(
  message: string,
  messages: AiMessageModel[],
): AsyncIterableIterator<string> {
  let convo = "";
  let startFromIndex = messages.length - 1;

  // 1. Logic to find the starting point of the conversation
  for (let i = messages.length - 1; i >= 0; i--) {
    startFromIndex = i;
    if (i < messages.length - 20) {
      if (!messages[i].isAI) break;
    }
  }

  if (startFromIndex < 0) startFromIndex = 0;

  // 2. Format the conversation string
  let messageCount = 0;
  for (let i = startFromIndex; i < messages.length - 2; i++) {
    const msg = messages[i];
    // Break if convo is too long or we've hit the message limit
    if (convo.length > 10000 || (messageCount > 10 && !msg.isAI)) break;

    const prefix = msg.isAI ? "AI: " : "User: ";
    convo += `${prefix}${msg.message.trim()}\n`;
    messageCount++;
  }

  // 3. Make the Axios request
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_NYIKA_API}/user/chat/ai-stream-van`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: message,
        date: 1,
        convo: convo,
      }),
    },
  );

  if (!response.ok || !response.body) {
    throw new Error("Failed to connect to the stream");
  }

  // 3. Read the stream using a TextDecoder
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Decode the current chunk and add to buffer
    buffer += decoder.decode(value, { stream: true });

    // Split by double newline (standard SSE separator)
    // SSE events are typically separated by double newlines
    const events = buffer.split("\n\n");

    // Keep the last partial part in the buffer
    buffer = events.pop() || "";

    for (const event of events) {
      if (event.startsWith("data: ")) {
        const content = event.replace("data: ", "");

        if (content === "[DONE]") return;

        // Restore real newlines as per your Dart logic
        yield content.replace("\\n", "\n");
      }
    }
  }
}
