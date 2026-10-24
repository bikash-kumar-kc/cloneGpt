import type { IMessageType } from "../types/message.type";

const LlmResponse = ({ message }: { message: IMessageType }) => {
  return (
    <div className="w-full flex justify-start">
      <div
        className={`flex justify-start w-full max-w-fit text-white px-3 py-1 rounded-md text-wrap${message.isError ? "bg-red-700" : ""}`}
      >
        {message.isError ? message.error : message.message}
      </div>
    </div>
  );
};

export default LlmResponse;
