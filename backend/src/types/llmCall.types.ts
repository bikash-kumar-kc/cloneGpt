export type role = "user" | "assistant" | "tool" | "system";

import Groq from "groq-sdk";

export type IMessageHistory =
  | { role: "system"; content: string; name?: string }
  | { role: "user"; content: string; name?: string }
  | {
      role: "assistant";
      content: string;
      name?: string;
      tool_calls: Groq.Chat.Completions.ChatCompletionMessageToolCall[];
    }
  | { role: "tool"; content: string; tool_call_id: string; name: string };

export interface IDatabaseType {
  role: "user" | "assistant";
  content: string;
}
