import { useEffect, useState } from "react";
import type { IMessageType } from "../types/message.type";
import { Check, Copy } from "lucide-react";

const UserInput = ({ message }: { message: IMessageType }) => {
  const [copy, setCopy] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message?.trim());
    setCopy(true);
  };

  useEffect(() => {
    let timeOut: number;
    if (copy) {
      timeOut = setTimeout(() => {
        setCopy(false);
      }, 1500);
    }
    return () => clearTimeout(timeOut);
  }, [copy]);

  return (
    <div className="group w-full flex justify-end">
      <div className="relative max-w-fit pb-8">
        <div className="text-white px-3 py-1 rounded-md bg-neutral-800">{message.message}</div>

        <button
          onClick={handleCopy}
          className="
        absolute bottom-0 left-0
        hidden group-hover:flex
        items-center justify-center
        p-1.5 rounded-md
        text-gray-400
        hover:text-white
        hover:bg-white/10
        transition-colors
      "
          title="Copy"
        >
          {copy ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
};

export default UserInput;
