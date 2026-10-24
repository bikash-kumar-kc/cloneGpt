import LocalFileDatabase from "../services/localFileDatabase.js";

const loadPastConversation = async ({
  userId,
  fileDatabaseInstance,
}: {
  userId: string;
  fileDatabaseInstance: LocalFileDatabase;
}) => {
  if (!userId) return;
  try {
    const messages = await fileDatabaseInstance.getMessages({ userId });
    return messages;
  } catch (error) {
    console.log(
      "'[load past conversation] problem in loading past conversation",
      error,
    );
  }
};


