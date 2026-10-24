import type { IMessageType } from "../types/message.type";

export const messages: IMessageType[] = [
  { type: "user", message: "Hello, how are you?" },
  { type: "llm", message: "I'm doing great! How can I help you?" },
  { type: "user", message: "Explain React hooks." },
  {
    type: "llm",
    message:
      "React Hooks let you use state and other React features in functional components.",
  },
  { type: "user", message: "What is useState?" },
  {
    type: "llm",
    message: "useState is a Hook used to add state to a functional component.",
  },
  { type: "user", message: "What is useEffect?" },
  {
    type: "llm",
    message: "useEffect lets you perform side effects in a component.",
  },
  { type: "user", message: "Explain useMemo." },
  {
    type: "llm",
    message: "useMemo memoizes a computed value between renders.",
  },
  { type: "user", message: "What is useCallback?" },
  { type: "llm", message: "useCallback memoizes a function between renders." },
  { type: "user", message: "What is Redux?" },
  {
    type: "llm",
    message: "Redux is a state management library for JavaScript applications.",
  },
  { type: "user", message: "What is React Query?" },
  {
    type: "llm",
    message:
      "React Query manages server state, caching, fetching, and synchronization.",
  },
  { type: "user", message: "What is TypeScript?" },
  {
    type: "llm",
    message: "TypeScript is JavaScript with static type checking.",
  },
  { type: "user", message: "Thanks!" },
  { type: "llm", message: "You're welcome!" },
];
