import type {
  ILlmStatusReturned,
  ILlmStatusTypes,
} from "../types/llmStatus.type";
import { statusPicker } from "../utilis/getLlmStatus";

const StatusLlm = ({ status }: { status: ILlmStatusReturned }) => {
  const llmStatus: ILlmStatusTypes | string | undefined = statusPicker({
    type: status.type,
  });
  if (typeof llmStatus === "string" || typeof llmStatus === "undefined") return;
  return (
    <div className="w-full flex justify-start">
      <div className=" max-w-fit animate-pulse text-gray-200 px-3 py-1">
        {status.toolName
          ? `${llmStatus.label}->${status.toolName}`
          : llmStatus.label}
      </div>
    </div>
  );
};

export default StatusLlm;
