export interface ILlmStatusTypes {
  type:
    | "thinking"
    | "toolCalling"
    | "generating"
    | "transcription"
    | "speech synthesis"
    | "imageGenerating";
  label:
    | "Thinking..."
    | "ToolCalling..."
    | "ImageGenerating..."
    | "Transcripting..."
    | "Speech synthesising..."
    | "Generating..."
  toolName?: string;
}

export interface ILlmStatusReturned {
  type:
    | "thinking"
    | "toolCalling"
    | "generating"
    | "transcription"
    | "speech synthesis"
    | "imageGenerating";
  isStarted: boolean;
  toolName?: string;
}
