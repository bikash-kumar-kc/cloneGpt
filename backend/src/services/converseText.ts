import SocketService from "../clients/socket.io.js";
import LlmApiClientInterface from "../interface/llmApi.interface.js";
import { audioToBase64 } from "../utils/audioFileToBase54.js";

interface IConversationFromTextType {
  userId: string;
  query: string;
  isAudio: boolean;
  messageHistory: {
    role: "user" | "assistant";
    content: string;
  }[];
  socketInstance: SocketService;
}

class ConverseText {
  constructor(
    private llmClientText: LlmApiClientInterface,
    private llmClientTextToAudiio: LlmApiClientInterface,
  ) {}
  public conversationFromText = async ({
    userId,
    query,
    isAudio,
    messageHistory,
    socketInstance,
  }: IConversationFromTextType): Promise<{
    role: "assistant";
    content: string;
    base64AudioFile?: string;
    audioFilePath?: string;
  }> => {
    try {
      if (!userId?.trim() || !query?.trim()) {
        throw new Error("userId or query is missing.");
      }

      const socket = socketInstance.getSocket({ userId });
      if (socket) {
        console.log("Event fired");
        socket.emit("event", { type: "generating", isStarted: true });
      }
      const { role, content } = await this.llmClientText.textToText({
        text: query,
        messageHistory: messageHistory,
        socketInstance: socketInstance,
        userId,
      });
      if (isAudio) {
        
        if (socket) {
          socket.emit("event", { type: "speech synthesis", isStarted: true });
        }
        const { audioFilePath } = await this.llmClientTextToAudiio.textToSpeech(
          {
            text: content,
          },
        );

        const base64AudioFile = await audioToBase64(audioFilePath);

        return {
          role: role as "assistant",
          content,
          base64AudioFile,
          audioFilePath,
        };
      }

      return {
        role: role as "assistant",
        content,
      };
    } catch (error) {
      console.log("[converse text] failed at converse text");
      throw error;
    }
  };
}

export default ConverseText;
