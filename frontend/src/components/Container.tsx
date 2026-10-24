import type { IChildParams } from "../types/childParams.type";

const Container = ({ children }: IChildParams) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="w-full flex flex-col wrap">{children}</div>
    </div>
  );
};

export default Container;
