import { CheckCircle2, Circle } from "lucide-react";

export function Steps({ currentStep }: { currentStep: number }) {
  const steps = [
    "Personal Details",
    "Interests",
    "Privacy Consent",
  ];

  return (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute left-0 top-1/2 h-0.5 w-full bg-gray-200 -translate-y-1/2" />
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white">
                {index + 1 < currentStep ? (
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                ) : index + 1 === currentStep ? (
                  <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center text-primary font-medium">
                    {index + 1}
                  </div>
                ) : (
                  <Circle className="h-8 w-8 text-gray-300" />
                )}
              </div>
              <span className="mt-2 text-sm font-medium">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}