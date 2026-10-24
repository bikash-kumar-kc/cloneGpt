import type { ILlmStatusTypes } from "../types/llmStatus.type";

export const statusPicker = ({
  type,
}: {
  type:
    | "thinking"
    | "toolCalling"
    | "generating"
    | "imageGenerating"
    | "transcription"
    | "speech synthesis";
}) => {
  const status: Record<string, ILlmStatusTypes> = {
    thinking: {
      type: "thinking",
      label: "Thinking...",
    },
    toolCalling: {
      type: "toolCalling",
      label: "ToolCalling...",
    },
    imageGenerating: {
      type: "imageGenerating",
      label: "ImageGenerating...",
    },
    transcription: {
      type: "transcription",
      label: "Transcripting...",
    },
    "speech synthesis": {
      type: "speech synthesis",
      label: "Speech synthesising...",
    },
    generating: {
      type: "generating",
      label: "Generating...",
    },
  };

  return status[type] ? status[type] : undefined;
};
