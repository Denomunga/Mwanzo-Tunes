import React from "react";

type OTPContextType = {
  slots: {
    char: string;
    hasFakeCaret: boolean;
    isActive: boolean;
  }[];
};

export const InputOTPContext = React.createContext<OTPContextType | null>(null);

type OTPInputProps = {
  length: number;
};

export default function InputOTP({ length }: OTPInputProps) {
  const inputOTPContext = React.useContext(InputOTPContext);

  if (!inputOTPContext) {
    return <div>Missing InputOTPContext</div>;
  }

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, index) => {
        const slot = inputOTPContext.slots[index];
        const char = slot?.char ?? "";
        const hasFakeCaret = slot?.hasFakeCaret ?? false;
        const isActive = slot?.isActive ?? false;

        return (
          <div
            key={index}
            className={`w-10 h-12 border flex items-center justify-center rounded ${
              isActive ? "border-blue-500" : "border-gray-300"
            }`}
          >
            {char || (hasFakeCaret ? "|" : "")}
          </div>
        );
      })}
    </div>
  );
}
