import { useEffect, useRef, useState } from "react";
import {
  Plus,
  X,
  ArrowUp,
  Type,
  Image as ImageIcon,
  AudioLines,
  Volume2,
  Disc,
} from "lucide-react";
import IconButton from "./IconButton";
import type { IMessage } from "../page/CloneGpt";
import useConversation from "../hooks/useConversation";
import { initializeMicrophone } from "../services/audio.service";
import { useSpeechRecognition } from "../hooks/useSpeechRecognization";

export default function ChatSearchBar({
  isPastConversation,
  onMessage,
  handleAudioSrc,
  handleAudioPermission,
  userId,
}: {
  isPastConversation: boolean;
  onMessage: ({ role, text, status }: IMessage) => void;
  handleAudioSrc: (src: string) => void;
  handleAudioPermission: () => void;
  userId:string | null
}) {
  const [message, setMessage] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isInput, setIsInput] = useState(false);

  const {
    handleSelectedTool,
    handleAudioOutput,
    handleAudioInputOutputSelected,
    handleAudioConverseAudio,
    handleTextConverse,
    isLlmCalling,
    selectedTool,
    isAudioOutput: audioOutput,
    isAudioInputOutputSelected,
  } = useConversation({ onMessage, handleAudioSrc,userId });

  const { isRecording, toggleRecording, audioFile, setAudioFile } =
    useSpeechRecognition();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const searchBarPosition = isPastConversation
    ? "bottom-0"
    : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ";

  const resizeTextarea = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    // Reset first so shrinking also works
    textarea.style.height = "auto";

    // Grow according to content
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleChange = (value: string) => {
    setMessage(value);
    setIsInput(value.trim().length > 0);

    requestAnimationFrame(() => {
      resizeTextarea();
    });
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    await handleTextConverse({ text: message });
    setMessage("");
    setIsInput(false);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "40px";
      }
    });
  };

  useEffect(() => {
    if (audioFile) {
      handleAudioConverseAudio({ file: audioFile });
      setAudioFile(undefined);
    }
  }, [audioFile, handleAudioConverseAudio]);

  return (
    <div
      className={`fixed   w-full max-w-3xl mb-1 bg-black ${searchBarPosition}`}
    >
      {showTools && (
        <div className="absolute bottom-25 w-fit rounded-md border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <button
            type="button"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 ${selectedTool === "text" ? "dark:bg-neutral-800" : "dark:bg-neutral-900"} mb-1`}
            onClick={() => {
              console.log("Text generation");
              handleSelectedTool({ tool: "text" });
              setShowTools(false);
            }}
            disabled={isAudioInputOutputSelected || audioOutput || isLlmCalling}
          >
            <Type size={18} />
            <span>Text generation</span>
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm  hover:bg-neutral-100 dark:text-neutral-700 dark:hover:bg-neutral-800"
            disabled={true}
          >
            <ImageIcon size={18} />
            <span>Image generation</span>
          </button>
        </div>
      )}

      <div className="flex flex-col flex-wrap gap-3">
        {!isPastConversation && (
          <div className="text-center text-2xl">
            <h1 className="font-bold">What is on you mind ?</h1>
          </div>
        )}
        <div
          className="
          relative flex items-end
          rounded-[28px]
          border border-neutral-200
          bg-white
          px-3 py-2
          shadow-sm
          transition
          focus-within:border-neutral-300
          focus-within:shadow-md
          dark:border-neutral-700
          dark:bg-neutral-800
          dark:focus-within:border-neutral-600
        "
        >
          <IconButton
            onClick={() => setShowTools((prev) => !prev)}
            disabled={isAudioInputOutputSelected || audioOutput || isLlmCalling}
            aria-label={showTools ? "Close tools" : "Open tools"}
            className="mb-0.5"
          >
            {showTools ? <X size={21} /> : <Plus size={21} />}
          </IconButton>

          <div className="flex min-w-0 flex-1 px-2">
            {isListening && isRecording ? (
              <div className="flex min-h-10 items-center text-sm text-neutral-500 dark:text-neutral-400">
                Listening...
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={message}
                rows={1}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Message cloneGPT"
                className="
                min-h-10
                max-h-50
                w-full
                resize-none
                overflow-y-auto
                bg-transparent
                py-2
                text-[15px]
                leading-6
                text-neutral-900
                outline-none
                placeholder:text-neutral-500
                dark:text-white
                dark:placeholder:text-neutral-400
              "
              />
            )}
          </div>

          <div className="mb-0.5 flex shrink-0 items-center gap-1">
            <IconButton
              onClick={async () => {
                if (audioOutput) {
                  handleAudioOutput();
                  handleAudioPermission();
                  return;
                }
                // const res = await initializeMicrophone();
                // if (res) {
                //   console.log("ask for audio permission");
                handleAudioOutput();
                handleAudioPermission();
                //   }
              }}
              disabled={isAudioInputOutputSelected || isLlmCalling}
              active={audioOutput}
              aria-label={
                audioOutput ? "Stop audio output" : "Start audio output"
              }
            >
              <Volume2 size={20} />
            </IconButton>

            {isInput && (
              <IconButton
                variant="primary"
                onClick={handleSubmit}
                aria-label="Send message"
                disabled={isAudioInputOutputSelected || isLlmCalling}
              >
                <ArrowUp size={19} strokeWidth={2.5} />
              </IconButton>
            )}

            {!isInput && (
              <IconButton
                variant="solid"
                active={isAudioInputOutputSelected}
                onClick={async () => {
                  if (isAudioInputOutputSelected) {
                    handleAudioInputOutputSelected();
                    setIsListening((prevs) => !prevs);
                    console.log("[recording end]");
                    await toggleRecording();
                    // handleAudioPermission();
                    return;
                  }
                  const res = await initializeMicrophone();
                  if (res) {
                    handleAudioInputOutputSelected();
                    setIsListening((prevs) => !prevs);
                    // handleAudioPermission();
                    console.log("[recording start]");
                    await toggleRecording();
                  }
                }}
                disabled={audioOutput || isLlmCalling}
                aria-label={
                  isAudioInputOutputSelected ? "Stop voice" : "Start voice"
                }
              >
                {isAudioInputOutputSelected ? (
                  <Disc size={19} strokeWidth={2.5} />
                ) : (
                  <AudioLines size={19} strokeWidth={2.5} />
                )}
              </IconButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
