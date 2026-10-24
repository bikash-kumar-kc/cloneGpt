import { Router } from "express";
import type { Request, Response } from "express";
import LocalFileDatabase from "../services/localFileDatabase.js";
import GroqClient from "../clients/groq.js";
import TavilyWebSearch from "../clients/webSearchClient.js";
import { IDatabaseType } from "../types/llmCall.types.js";
import ConverseText from "../services/converseText.js";
import MulterService from "../clients/multer.js";
import ConverseAudio from "../services/converseAudio.js";
import { multerFileToFile } from "../utils/multerFileToFile.js";
import fs from "node:fs/promises";
import { Server } from "node:http";
import SocketService from "../clients/socket.io.js";

const conversationFunction = (httpServer: Server) => {
  // temporary local message history
  const localMessageHistory = new Map<String, IDatabaseType[]>();

  // multer instance
  const fileParsingInstance = new MulterService();

  // socket instance
  const socketInstance = new SocketService(
    httpServer,
    "http://localhost:5173",
    ["Get", "Post"],
  );

  const conversationRoutes = Router();
  // route to get initial message from users
  conversationRoutes.get(
    "/initialMessage/:userId",
    async (req: Request, res: Response) => {
      try {
        const searchParams = req.params as { userId: string };
        if (!searchParams || !searchParams?.userId) {
          return res
            .status(400)
            .json({ success: false, errorMsg: "User Id is required" });
        }

        const { userId } = searchParams;

        const localFileDatabaseInstance = new LocalFileDatabase();
        const userPastMessages = await localFileDatabaseInstance.getMessages({
          userId,
        });

        if (!localMessageHistory.has(userId)) {
          localMessageHistory.set(userId, userPastMessages);
        }
        res.status(201).json({ success: true, message: userPastMessages });
      } catch (error) {
        console.log("Failed to load initial messages.", error);
        return res.status(500).json({
          success: false,
          errorMsg:
            error instanceof Error ? error.message : "Internal Server Error ",
        });
      }
    },
  );

  // route to do text to text or text+audio
  conversationRoutes.post(
    "/converse/text",
    async (req: Request, res: Response) => {
      try {
        const {
          userId,
          query,
          isAudio,
          services,
        }: {
          userId: string;
          query: string;
          isAudio: boolean;
          services: "text";
        } = req.body;

        if (!userId?.trim() || !query?.trim()) {
          return res
            .status(400)
            .json({ success: false, errorMsg: "UserId or query is required" });
        }

        if (
          !process.env.GROQ_API_KEY_TTT ||
          !process.env.GROQ_API_KEY_TTS ||
          !process.env.GROQ_MODEL_TTT ||
          !process.env.GROQ_MODEL_TTS ||
          !process.env.TAVILY_API_KEY
        ) {
          return res.status(500).json({
            success: false,
            errorMsg: "Apikeys or modals are missing",
          });
        }

        const webSearchInstance = new TavilyWebSearch(
          process.env.TAVILY_API_KEY,
        );

        const llmTextInstance = new GroqClient(
          process.env.GROQ_API_KEY_TTT,
          process.env.GROQ_MODEL_TTT,
          webSearchInstance,
        );

        const llmAudioInstance = new GroqClient(
          process.env.GROQ_API_KEY_TTS,
          process.env.GROQ_MODEL_TTS,
        );

        const localFileDatabaseInstance = new LocalFileDatabase();

        let messages: IDatabaseType[] | [] = [];

        if (localMessageHistory.has(userId)) {
          messages = localMessageHistory.get(userId) as IDatabaseType[];
        } else {
          localMessageHistory.set(userId, []);
        }

        const converseTextInstance = new ConverseText(
          llmTextInstance,
          llmAudioInstance,
        );

        const { role, content, base64AudioFile, audioFilePath } =
          await converseTextInstance.conversationFromText({
            userId,
            query,
            isAudio,
            messageHistory: messages,
            socketInstance,
          });

        localMessageHistory.get(userId)?.push({ role: "user", content: query });
        localMessageHistory.get(userId)?.push({ role, content });

        console.log("store in file 1");
        await localFileDatabaseInstance.updateMessage({
          userId,
          role: "user",
          message: query,
        });
        console.log("store in file 2");
        await localFileDatabaseInstance.updateMessage({
          userId,
          role,
          message: content,
        });

        if (isAudio && audioFilePath) {
          try {
            await fs.access(audioFilePath);
            await fs.unlink(audioFilePath);
          } catch (error) {
            console.log("audio file");
            throw new Error("Failed to deleted audio file");
          }
        }

        const socket = socketInstance.getSocket({ userId });
        if (socket) {
          socket.emit("event", { type: null, isStarted: false });
        }

        return res.status(201).json({
          success: true,
          data: {
            audio: base64AudioFile,
            text: content,
          },
        });
      } catch (error) {
        console.log("Failed at converse text route.", error);
        return res.status(500).json({
          success: false,
          errorMsg:
            error instanceof Error ? error.message : "Internal Server Error ",
        });
      }
    },
  );

  // route to do text to audio+Text
  conversationRoutes.post(
    "/converse/audio",
    fileParsingInstance.singleFileParsing().single("audio"),
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.body;
        const file = req.file;

        if (!userId?.trim() || !file) {
          return res
            .status(400)
            .json({ success: false, errorMsg: "UserId or file is required" });
        }

        if (
          !process.env.GROQ_API_KEY_TTT ||
          !process.env.GROQ_API_KEY_TTS ||
          !process.env.GROQ_MODEL_TTT ||
          !process.env.GROQ_MODEL_TTS ||
          !process.env.TAVILY_API_KEY ||
          !process.env.GROQ_API_KEY_STT ||
          !process.env.GROQ_MODEL_STT
        ) {
          return res.status(500).json({
            success: false,
            errorMsg: "Apikeys or modals are missing",
          });
        }

        const webSearchInstance = new TavilyWebSearch(
          process.env.TAVILY_API_KEY,
        );

        const llmTextInstance = new GroqClient(
          process.env.GROQ_API_KEY_TTT,
          process.env.GROQ_MODEL_TTT,
          webSearchInstance,
        );

        const llmTextAudioInstance = new GroqClient(
          process.env.GROQ_API_KEY_TTS,
          process.env.GROQ_MODEL_TTS,
        );

        const llmAudioTextInstance = new GroqClient(
          process.env.GROQ_API_KEY_STT,
          process.env.GROQ_MODEL_STT,
        );

        const localFileDatabaseInstance = new LocalFileDatabase();

        let messages: IDatabaseType[] | [] = [];

        if (localMessageHistory.has(userId)) {
          messages = localMessageHistory.get(userId) as IDatabaseType[];
        } else {
          localMessageHistory.set(userId, []);
        }

        const converseAudioInstance = new ConverseAudio(llmAudioTextInstance);

        const browserFile = await multerFileToFile(file);
        const { soundToText } =
          await converseAudioInstance.conversationFromAudio({
            userId,
            audioFile: browserFile,
            socketInstance,
          });

        const converseTextInstance = new ConverseText(
          llmTextInstance,
          llmTextAudioInstance,
        );

        const { role, content, base64AudioFile, audioFilePath } =
          await converseTextInstance.conversationFromText({
            userId,
            query: soundToText,
            isAudio: true,
            messageHistory: messages,
            socketInstance,
          });

        localMessageHistory
          .get(userId)
          ?.push({ role: "user", content: soundToText });
        localMessageHistory.get(userId)?.push({ role, content });

        await localFileDatabaseInstance.updateMessage({
          userId,
          role: "user",
          message: soundToText,
        });
        await localFileDatabaseInstance.updateMessage({
          userId,
          role,
          message: content,
        });

        if (audioFilePath) {
          try {
            await fs.access(audioFilePath);
            await fs.unlink(audioFilePath);
          } catch (error) {
            console.log("audio file");
            throw new Error("Failed to deleted audio file");
          }
        }

        const socket = socketInstance.getSocket({ userId });
        if (socket) {
          socket.emit("event", { type: null, isStarted: false });
        }

        return res.status(201).json({
          success: true,
          data: {
            audio: base64AudioFile,
            userText: soundToText,
            llmText: content,
          },
        });
      } catch (error) {
        console.log("Failed at converse audio route.", error);
        return res.status(500).json({
          success: false,
          errorMsg:
            error instanceof Error ? error.message : "Internal Server Error ",
        });
      }
    },
  );

  return conversationRoutes;
};

export default conversationFunction;
