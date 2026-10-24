import { useEffect, useRef, useState } from "react";
import LlmResponse from "./LlmResponse";
import UserInput from "./UserInput";
import StatusLlm from "./StatusLlm";
import type { ILlmStatusReturned } from "../types/llmStatus.type";
import type { IMessageType } from "../types/message.type";
import type { status } from "../page/CloneGpt";

interface IChatMessageType {
  messageChat: IMessageType[] | [];
  isLoading: boolean;
  status?: status;
  toolName?: string;
  isStarted?: boolean;
}

const ChatSection = ({
  messageChat,
  isLoading,
  status,
  isStarted,
  toolName,
}: IChatMessageType) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [currentState, setCurrentState] = useState<ILlmStatusReturned>();

  // on change in messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageChat]);

  // on status update
  useEffect(() => {
    if (status) {
      console.log("status");
      console.log(status);
      setCurrentState({ type: status, isStarted: true, toolName });
    } else {
      setCurrentState(undefined);
    }
  }, [status, isStarted, toolName]);

  if (isLoading)
    return (
      <div className="w-full flex gap-5 flex-col flex-wrap  pt-10 pb-40 overflow-hidden">
        <p>loading...</p>
      </div>
    );

  if (messageChat.length === 0) return;

  return (
    <div className="w-full flex gap-5 flex-col flex-wrap  pt-10 pb-40 overflow-hidden">
      {messageChat.map((m, idx) =>
        m.type === "user" ? (
          <div key={`${m.type} ${idx} ${m.message}`}>
            <UserInput key={`${m.type} ${idx} ${m.message}`} message={m} />
          </div>
        ) : (
          <div key={`${m.type} ${idx} ${m.message}`}>
            <LlmResponse key={`${m.type} ${idx} ${m.message}`} message={m} />
          </div>
        ),
      )}
      {currentState && currentState.isStarted && (
        <>
          <StatusLlm status={currentState} />
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatSection;
