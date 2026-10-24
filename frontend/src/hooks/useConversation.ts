import { useCallback, useState } from "react";
import type { IMessage } from "../page/CloneGpt";
import { conversationService } from "../api/conversation";

interface IConversationType {
  onMessage: ({ role, text, status, error, isError }: IMessage) => void;
  handleAudioSrc: (src: string) => void;
  userId: string | undefined | null;
}

type ITool = "text" | "image";

const useConversation = ({
  onMessage,
  handleAudioSrc,
  userId,
}: IConversationType) => {
  const [selectedTool, setSelectedTool] = useState<ITool>("text");
  const [isAudioOutput, setIsAudioOutput] = useState<boolean>(false);
  const [isAudioInputOutputSelected, setIsAudioInputOutputSelected] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSelectedTool = ({ tool }: { tool: ITool }) => {
    setSelectedTool(tool);
  };

  const handleAudioOutput = () => {
    setIsAudioOutput((prevs) => !prevs);
  };

  const handleAudioInputOutputSelected = () => {
    setIsAudioInputOutputSelected((prevs) => !prevs);
  };

  const handleError = (role: "llm" | "user", error: string) => {
    if (error) {
      onMessage({ role: role, error: error, isError: true });
    }
  };

  const handleTextConverse = useCallback(
    async ({ text }: { text: string }) => {
      if (!text || !userId) {
        alert("text or userId is missing");
        return;
      }
      onMessage({ role: "user", text });
      setIsLoading(true);
      try {
        const requiredParams = {
          query: text,
          isAudio: isAudioOutput,
          service: selectedTool,
          userId: userId,
        };
        // Get audio and text from the API
        const { audio, text: llmText } =
          await conversationService.startConversationWithText({
            data: requiredParams,
          });

        // update the message
        onMessage({
          role: "llm",
          text: llmText,
        });

        // set audioUrl only if
        if (audio) {
          const audioUrl = URL.createObjectURL(audio);
          // console.log("hello")
          // handleAudioSrc("/dummyData/speech.wav");
          handleAudioSrc(audioUrl);
        }
      } catch (error: unknown) {
        if (error instanceof Error) handleError("llm", JSON.stringify(error));
        else handleError("llm", `Error starting  text to text/audio ${error}`);
        console.error("Error starting  text to text/audio:", error);
        alert("please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isAudioOutput, selectedTool, onMessage],
  );

  const handleAudioConverseAudio = useCallback(
    async ({ file }: { file: File }) => {
      if (!file || file.size === 0 ) {
        console.error("Error: Attempted to send an empty file.");
        handleError("user", "Error: Attempted to send an empty file.");
        return;
      }

      if(!userId){
        console.log("userId is missing");
        return;
      }

      try {
        setIsLoading(true);
        const {
          audio,
          text: llmText,
          userText,
        } = await conversationService.startConversationWithAudio({
          isAudio: isAudioInputOutputSelected,
          audioFile: file,
          userId,
        });
        const newAudioUrl = URL.createObjectURL(audio);

        onMessage({
          role: "user",
          text: userText,
        });
        onMessage({
          role: "llm",
          text: llmText,
        });

        handleAudioSrc(newAudioUrl);
      } catch (error) {
        if (error instanceof Error) handleError("llm", JSON.stringify(error));
        else handleError("llm", `Error starting  audio to text+audio ${error}`);
        console.error("Error sending message to endpoint:", error);
        alert("please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isAudioInputOutputSelected],
  );

  return {
    handleSelectedTool,
    handleAudioOutput,
    handleAudioInputOutputSelected,
    handleAudioConverseAudio,
    handleTextConverse,
    selectedTool,
    isAudioOutput,
    isAudioInputOutputSelected,
    isLlmCalling: isLoading,
  };
};

export default useConversation;
