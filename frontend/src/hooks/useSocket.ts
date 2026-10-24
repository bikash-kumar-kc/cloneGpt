import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { status } from "../page/CloneGpt";

const statusArr = [
  "thinking",
  "toolCalling",
  "generating",
  "transcription",
  "speech synthesis",
];

const useSocket = ({
  userId,
  updateStatus,
}: {
  userId: string | null;
  updateStatus: (status: undefined | status) => void;
}) => {
  const socketRef = useRef<Socket>(null);
  const [toolName, setToolName] = useState<string | undefined>(undefined);

  const handleEvent = useCallback(
    (data: { type: status; isStarted: boolean; toolName: string }) => {
      // console.log(type, isStart, toolName);
      // console.log(data
      console.log("data");
      console.log(data);
      if (data.isStarted && statusArr.includes(data.type)) {
        console.log(data);
        updateStatus(data.type);
        setToolName(toolName);
      } else if (!data.isStarted) {
        updateStatus(undefined);
      }

      console.log("data");
      console.log(data);
    },
    [userId],
  );

  //   const handleCloseEvent = useCallback(({type,isStart}) => {}, [userId]);

  const socketConnect = useCallback(() => {
    if (!userId) {
      console.log("[socket connect] userId is required");
      return;
    }

    if (socketRef.current) return;

    const newSocket = io("http://localhost:7000", {
      transports: ["websocket", "polling"],
      reconnection: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on("connect", () => {
      console.log("[socket connect] socket connection successfully");
      newSocket.emit("registerUser", { userId });
    });

    // handle the event from server
    newSocket.on("event", handleEvent);
    // newSocket.on("closeEvent", handleCloseEvent);

    // when server disconnects
    newSocket.on("disconnect", (reason) => {
      console.log("[use socket] server disconnects ", reason);
      socketRef.current = null;
    });

    socketRef.current = newSocket;
  }, [userId, handleEvent]);

  // request for connection if userId
  useEffect(() => {
    if (!userId) return;
    socketConnect();
  }, [userId, socketConnect, socketRef]);

  // close the connection when user leave
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return { socket: socketRef, toolName };
};

export default useSocket;
