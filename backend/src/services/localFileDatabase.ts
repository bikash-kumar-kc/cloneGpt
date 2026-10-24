import fs from "node:fs/promises";
import { IUserType } from "../interface/database.interface.js";
import { IDatabaseType } from "../types/llmCall.types.js";

class LocalFileDatabase implements LocalFileDatabase {
  constructor(private dirName = "./fileDatabase") {}

  private isDirExist = async (): Promise<boolean> => {
    try {
      await fs.access(this.dirName);
      return true;
    } catch (error) {
      console.log("[dir file exists]", error);
      return false;
    }
  };

  private isFileExist = async ({ userId }: IUserType): Promise<boolean> => {
    try {
      const filePath = this.dirName + `/${userId}.json`;
      await fs.access(filePath);
      return true;
    } catch (error) {
      console.log("[file exists]", error);
      return false;
    }
  };

  private createFile = async ({
    type,
    fileName,
  }: {
    type: "file" | "dir";
    fileName?: string;
  }): Promise<boolean> => {
    try {
      if (type === "file") {
        await fs.mkdir(this.dirName);
      } else {
        if (!fileName) {
          throw new Error("file name is required.");
        }
        const filePath = this.dirName + `/${fileName}.json`;
        await fs.writeFile(filePath, "");
      }
      return true;
    } catch (error) {
      console.log("[Dir/file creation]: ", error);
      return false;
    }
  };

  public getMessages = async ({
    userId,
  }: IUserType): Promise<IDatabaseType[]> => {
    try {
      if (!userId) throw new Error("User id is required");
      const isFileExists = await this.isFileExist({ userId });
      if (!isFileExists) {
        throw new Error("File does not exist");
      }
      const filePath = this.dirName + `/${userId}` + ".json";
      const data = await fs.readFile(filePath, "utf-8");
      const messages: IDatabaseType[] = JSON.parse(data);
      return messages;
    } catch (error) {
      console.log("[get messages]", error);
      throw error;
    }
  };

  public updateMessage = async ({
    userId,
    role,
    message,
  }: {
    userId: string;
    role: "assistant" | "user";
    message: string;
  }): Promise<boolean> => {
    try {
      console.log("updated messages.");
      if (!(await this.isDirExist())) {
        console.log("direcotry created");
        await this.createFile({ type: "dir" });
      }

      const filePath = this.dirName + `/${userId}.json`;
      if (!(await this.isFileExist({ userId }))) {
        console.log("file created");
        await this.createFile({ type: "file", fileName: userId });
        const m = [{ role, content: message }];
        await fs.writeFile(filePath, JSON.stringify(m));
      } else {
        const messagesJson = await this.getMessages({ userId });
        messagesJson.push({ role, content: message });
        const messagesToString = JSON.stringify(messagesJson);
        await fs.writeFile(filePath, messagesToString);
      }

      return true;
    } catch (error) {
      console.log("[update messages]", error);
      throw error;
    }
  };

  public delateMessages = async ({ userId }: IUserType): Promise<boolean> => {
    try {
      if (!(await this.isFileExist({ userId })))
        throw new Error("File does not exist.");
      const filePath = this.dirName + `/${userId}.json`;
      await fs.unlink(filePath);
      console.log("File deleted");
      return true;
    } catch (error: any) {
      console.log("[delete file]", error);
      return false;
    }
  };
}

export default LocalFileDatabase;
