// @ts-nocheck

import { IMessageHistory } from "../types/llmCall.types.js";

export interface IUserType {
  userId: string;
}

class LocalDatabaseInterface {
  private isExist = async (): Promise<boolean> => {};

  private isFileExist = async ({ userId }: IUserType): Promise<boolean> => {};

  public getMessages = async ({
    userId,
  }: IUserType): Promise<IMessageHistory[]> => {};

  public updateMessage = async ({ role, message }: Promise<boolean>) => {};

  public delateMessages = async ({ userId }: IUserType): Promise<boolean> => {};
}

export default LocalDatabaseInterface;
