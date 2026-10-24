import SocketService from "../clients/socket.io.js";
import LlmApiClientInterface from "../interface/llmApi.interface.js";

interface IConversationFromAudioType {
  userId: string;
  audioFile: File;
  socketInstance: SocketService;
}

class ConverseAudio {
  constructor(private llmClient: LlmApiClientInterface) {}
  public conversationFromAudio = async ({
    userId,
    audioFile,
    socketInstance,
  }: IConversationFromAudioType): Promise<{
    soundToText: string;
  }> => {
    try {
      if (!userId?.trim()) {
        throw new Error("userId is missing.");
      }
      const socket = socketInstance.getSocket({ userId });
      if (socket) {
        socket.emit("event", { type: "transcription", isStarted: true });
      }
      const { text } = await this.llmClient.SpeechToText({ audioFile });
      return {
        soundToText: text,
      };
    } catch (error) {
      console.log("[converse audio] failed at converse text");
      throw error;
    }
  };
}

export default ConverseAudio;
