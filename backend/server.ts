import dotenv from "dotenv";
dotenv.config();
import httpServer from "./src/app.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  httpServer.listen(PORT, () => {
    console.log("server is running at port: " + PORT);
  });
};

startServer();
