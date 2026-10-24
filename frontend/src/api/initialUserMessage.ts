import { api } from "../client/axios";
import type { IMessageType } from "../types/message.type";

class InitialMessageService {
  initialMessage = async ({
    userId,
  }: {
    userId: string;
  }): Promise<IMessageType[] | [] | undefined> => {
    if (!userId || !userId?.trim()) {
      return;
    }
    try {
      // await new Promise((res)=>{
      //   setTimeout(()=>{
      //     res("some")
      //   },2000)
      // })

      // return messages;
      const response = await api.get(`/initialMessage/${userId}`);
      console.log("[initial message] response");
      console.log(response);
      const {
        message: messages,
      }: { message: { role: "user" | "assistant"; content: string }[] | [] } =
        response.data;

      if (messages?.length === 0) return [];
      const updatedMessage = messages.map((m) => ({
        type: m.role,
        message: m.content,
      })) as IMessageType[];
      return updatedMessage;
    } catch (error) {
      console.log("[initial message]", error);
    }
  };
}

export const initialMessageService = new InitialMessageService();
