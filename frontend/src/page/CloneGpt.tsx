import { useEffect, useState } from "react";
import ChatSearchBar from "../components/ChatSearchBar";
import ChatSection from "../components/ChatSection";
import Container from "../components/Container";
import { generateRandomString } from "../utils/randomString";
import useInitialMessage from "../hooks/useInitialMessage";
import type { IMessageType } from "../types/message.type";
import { useAudioManager } from "../hooks/useAudioManager";
import SpeechWave from "../components/SpeechWave";
import useSocket from "../hooks/useSocket";

export type status =
  | "thinking"
  | "toolCalling"
  | "generating"
  | "transcription"
  | "speech synthesis"
  | "imageGenerating";

export interface IMessage {
  role: "user" | "llm" | "status";
  text?: string;
  status?: status;
  error?: string;
  isError?: boolean;
}

const CloneGpt = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessageType[] | []>([]);
  const [status, setStatus] = useState<status | undefined>();
  const [audioSrc, setAudioSrc] = useState<string>();
  const [audioPermission, setAudioPermission] = useState(false);
  const statusType = [
    "thinking",
    "toolCalling",
    "generating",
    "transcribing",
    "imageGenerating",
  ];
  const roleType = ["user", "llm", "status"];

  const { initialMessage, isInitialMessageLoading } = useInitialMessage({
    userId,
  });

  // audio manager hook
  const { audioRef, isPlaying, setIsPlaying, playAudio } = useAudioManager();

  // real time llm event hook
  const { toolName } = useSocket({
    userId,
    updateStatus: (s: undefined | status) => setStatus(s),
  });

  const handleMessageChange = ({ role, text, status }: IMessage) => {
    if (!role) {
      console.log("[role] is missing");
      return;
    }

    if (
      role &&
      roleType.includes(role) &&
      status &&
      statusType.includes(status)
    ) {
      console.log("[status] status updated.");
      setStatus(status);
      return;
    }

    if (role && text && roleType.includes(role)) {
      setMessages((prevs) => [
        ...prevs,
        { type: role as "user" | "llm", message: text },
      ]);
      console.log("[messages] updated");
      return;
    }

    console.log("[role,text,status] something is missing.");
  };

  const handleAudioSrc = (src: string) => {
    console.log(src);
    console.log("in the clone gpt");
    setAudioSrc(src);
  };

  // handle session
  useEffect(() => {
    const id = localStorage.getItem("userIdForCloneGpt");
    if (!id) {
      const randomString = generateRandomString();
      if (!randomString) {
        setUserId(null);
      }
      localStorage.setItem("userIdForCloneGpt", randomString);
      setUserId(randomString);
    }
    setUserId(id);
  }, []);

  // handle initialMessageLoad
  useEffect(() => {
    setMessages((prevs) => [...initialMessage, ...prevs]);
  }, [initialMessage?.length, initialMessage]);

  // start audio play , if audio source is provided
  useEffect(() => {
    console.log("in the use effect clonegpt");
    if (audioSrc) {
      console.log("hey,,,");
      playAudio(audioSrc);
    }
  }, [audioSrc]);

  return (
    <Container>
      <ChatSection
        messageChat={messages ?? []}
        isLoading={isInitialMessageLoading}
        status={status}
        toolName={toolName}
      />

      <ChatSearchBar
        isPastConversation={messages.length > 0}
        onMessage={handleMessageChange}
        handleAudioSrc={handleAudioSrc}
        handleAudioPermission={() => setAudioPermission((prevs) => !prevs)}
        userId={userId}
      />

      {/* {isPlaying && ( */}
      <div className="hidden">
        <SpeechWave isPlaying={isPlaying} />

        <audio
          ref={audioRef}
          // ref={"../dummyData/speech.wav"}
          autoPlay
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setAudioSrc(undefined);
          }}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
      {/* )} */}
    </Container>
  );
};

export default CloneGpt;
