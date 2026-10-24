import express, { Request, Response } from "express";
import cors from "cors";
import conversationRoutes from "./routes/conversation.routes.js";
import http from "http";
import conversationFunction from "./routes/conversation.routes.js";

const app = express();

const whiteListOrigins = (process.env.whiteListedOrigins as string)?.split(
  ",",
) ?? ["http://localhost:5173"];

// for cors
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whiteListOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

// for json requested data parsing
app.use(express.json());

// home route
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    message: "Welcome to cloneGpt",
  });
});

const httpServer = http.createServer(app);

// defining conversational routes
app.use(conversationFunction(httpServer));

export default httpServer;
