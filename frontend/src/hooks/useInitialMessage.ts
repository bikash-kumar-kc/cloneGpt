import { useEffect, useState } from "react";
import type { IMessageType } from "../types/message.type";
import { initialMessageService } from "../api/initialUserMessage";

export interface IUserIdType {
  userId: string | null;
}

const useInitialMessage = ({ userId }: IUserIdType) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<IMessageType[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (userId) {
          setIsLoading(true);
          const response = await initialMessageService.initialMessage({
            userId,
          });
          if (response && response.length > 0) {
            setMessages(response);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userId]);

  return {
    isInitialMessageLoading: isLoading,
    initialMessage: messages,
  };
};

export default useInitialMessage;
