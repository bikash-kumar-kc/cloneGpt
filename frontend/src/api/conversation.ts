import { api } from "../client/axios";

interface ITextTypeRequest {
  query: string;
  isAudio?: boolean;
  service: "text" | "image";
  userId: string;
}

interface IAudioTypeRequest {
  isAudio: boolean;
  audioFile: File;
  userId: string;
}

interface ITextTypeResponse {
  text: string;
  audio?: string;
}

interface IAudioTypeResponse {
  llmText: string;
  audio: string;
  userText: string;
}

class ConversationService {
  // Function for starting a conversation with audio input
  startConversationWithAudio = async ({
    isAudio,
    audioFile,
    userId,
  }: IAudioTypeRequest) => {
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("isAudio", `${isAudio}`);
      formData.append("audio", audioFile, audioFile.name);
      console.log(audioFile)

      const response = await api.post(`/converse/audio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "json",
      });

      // const audio = await fileToBase64(audioFile)

      const {
        audio,
        llmText: text,
        userText,
      }: IAudioTypeResponse = response.data.data;
      let base64: unknown;

      if (audio) {
        base64 = audio.split(",")[1];
      }
      const audioBlob = new Blob(
        [Uint8Array.from(atob(base64 as string), (c) => c.charCodeAt(0))],
        { type: "audio/mpeg" },
      );

      // await new Promise((res) => {
      //   setTimeout(() => {
      //     res("some");
      //   }, 2000);
      // });

      return {
        audio: audioBlob,
        text: text,
        userText: userText,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Function for starting a conversation with text input
  startConversationWithText = async ({
    data,
  }: {
    data: ITextTypeRequest;
  }): Promise<{ text: string; audio?: Blob }> => {
    try {
      // await new Promise((res) => {
      //   setTimeout(() => {
      //     res("some");
      //   }, 2000);
      // });

      // return {
      //   text: "okay",
      // };

      const response = await api.post(
        `/converse/text`,
        { ...data },
        { responseType: "json" },
      );

      const { audio, text }: ITextTypeResponse = response.data.data;

      const map = new Map();
      map.set("text", text);

      // const audio = await audioFileToBase64("/dummyData/speech.wav");

      let base64: unknown;

      if (audio) {
        base64 = audio.split(",")[1];
      }

      // console.log(audio)
      // console.log("[blob] audio");

      if (audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(base64 as string), (c) => c.charCodeAt(0))],
          { type: "audio/mpeg" },
        );

        map.set("audio", audioBlob);
      }

      // testing...
      // await new Promise((res) => {
      //   setTimeout(() => {
      //     res("some");
      //   }, 2000);
      // });

      return {
        ...Object.fromEntries(map),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}

export const conversationService = new ConversationService();
