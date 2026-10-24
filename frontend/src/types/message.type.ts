export interface IMessageType {
  type: "user" | "llm";
  message: string;
  error?: string;
  isError?: boolean;
}
