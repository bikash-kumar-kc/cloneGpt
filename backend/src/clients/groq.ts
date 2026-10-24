import fs from "node:fs/promises";
import Groq from "groq-sdk";
import LlmApiClientInterface from "../interface/llmApi.interface.js";
import {
  IDatabaseType,
  IMessageHistory,
  role,
} from "../types/llmCall.types.js";
import { systemPromptText } from "../constants/systemPromptText.js";
import { tools } from "../constants/toolDefination.js";
import WebSearchInterafce from "../interface/Websearch.interface.js";
import SocketService from "./socket.io.js";

type audioFormat = "wav" | "flac" | "mp3" | "mulaw" | "ogg" | undefined;

class GroqClient implements LlmApiClientInterface {
  private client: Groq;
  private MAX_RETRIES: number;
  constructor(
    private apiKey: string,
    private llmModel: string,
    private webSearch?: WebSearchInterafce,
    private audioOutputVoice?: string,
    private audioOutputFormat?: audioFormat,
  ) {
    this.client = new Groq({ apiKey: this.apiKey });
    this.MAX_RETRIES = 5;
  }

  public textToText = async ({
    text,
    messageHistory,
    socketInstance,
    userId,
  }: {
    text: string;
    messageHistory: IDatabaseType[];
    socketInstance: SocketService;
    userId: string;
  }): Promise<{ role: "assistant"; content: string }> => {
    try {
      if (!text?.trim()) throw new Error("user text is required");

      //@ts-ignore
      const messages: IMessageHistory[] = messageHistory;

      messages.push({
        role: "user",
        content: text,
      });

      let llmText: unknown;

      // to break the infinite looping

      let count = 0;

      console.log("llm call text initiated");
      while (true) {
        count++;
        if (count > this.MAX_RETRIES) {
          throw new Error("Failed to generate. Please try again.");
        }
        const response = await this.client.chat.completions.create({
          messages: [
            {
              role: "system",
              content: systemPromptText,
            },
            ...messages,
          ],
          model: this.llmModel,
          temperature: 0.7,
          tools: tools,
          tool_choice: "auto",
        });

        const toolCollection = response.choices[0].message.tool_calls;

        console.log("response");
        console.log(response);

        if (!toolCollection) {
          console.log("Final text generation");
          llmText = response.choices[0].message.content;
          console.log("[llmText]", llmText);
          break;
        }

        messageHistory.push({
          role: "assistant",
          //@ts-ignore
          tool_calls: toolCollection,
        });

        //@ts-ignore
        for (const tool of toolCollection) {
          console.log("tool calling...");
          switch (tool.function.name) {
            case "webSearch":
              console.log("tool calling");
              const socket = socketInstance.getSocket({ userId });
              if (socket) {
                socket.emit("event", {
                  type: "toolCalling",
                  isStarted: true,
                  toolName: "webSearch",
                });
              }
              const webResponse = await this.webSearch?.webSearch({
                query: JSON.parse(tool.function.arguments).query,
              });

              messages.push({
                tool_call_id: tool.id,
                role: "tool",
                name: tool.function.name,
                content: JSON.stringify(
                  webResponse?.content ??
                    "no response from web search. Looks like the query is blocked. So terminate the call.",
                ),
              });
          }
        }
      }

      if (!llmText) throw new Error("Llm failed to generate text");

      return {
        role: "assistant",
        content: llmText as string,
      };
    } catch (error) {
      console.log("[text to text] failed to generate text", error);
      throw error;
    }
  };

  public textToSpeech = async ({
    text,
  }: {
    text: string;
    // @ts-ignore
  }): Promise<{ audioFilePath: string }> => {
    try {
      if (!text) throw new Error("Text is required to convert into audio.");
      // unique audio file path...
      const speechFilePath = `./audioFiles/${Date.now()}speech.wav`;
      const response = await this.client.audio.speech.create({
        model: this.llmModel ?? "canopylabs/orpheus-arabic-saudi",
        voice: this.audioOutputVoice ?? "abdullah",
        response_format: this.audioOutputFormat ?? "wav",
        input: text,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(speechFilePath, buffer);
      return {
        audioFilePath: speechFilePath,
      };
    } catch (error) {
      console.log("[tts] Failed to generate audio", error);
      throw error;
    }
  };

  public SpeechToText = async ({
    audioFile,
  }: {
    audioFile: File;
    // @ts-ignore
  }): Promise<{ text: string }> => {
    try {
      if (!audioFile) throw new Error("No audio file");
      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: this.llmModel ?? "whisper-large-v3-turbo",
        temperature: 0,
        response_format: "verbose_json",
      });
      console.log(transcription.text);
      return {
        text: transcription.text,
      };
    } catch (error) {
      console.log("[stt] failed to generate speech to text", error);
      throw error;
    }
  };
}

export default GroqClient;
