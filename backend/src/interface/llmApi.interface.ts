// @ts-nocheck
import SocketService from "../clients/socket.io.js";
import { IMessageHistory, role } from "../types/llmCall.types.js";

class LlmApiClientInterface {
//   constructor(
//     private apiKey: string,
//     private llmModel: string,
//   ) {}

  public textToText = async ({
    text,
    messageHistory,
    socketInstance
  }: {
    text: string;
    messageHistory: IDatabaseType[];
    socketInstance:SocketService
    userId:string;
  }): Promise<{ role: role; content: string }> => {};

  public textToSpeech = async ({
    text,
  }: {
    text: string;
  }): Promise<{ audioFilePath: text }> => {
    return {};
  };

  public SpeechToText = async ({
    audioFile,
  }: {
    audioFile: File;
  }): Promise<{ text: string }> => {};
}

export default LlmApiClientInterface;
