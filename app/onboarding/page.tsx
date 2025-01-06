"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserDetailsForm } from "@/components/onboarding/user-details-form";
import { InterestsForm } from "@/components/onboarding/interests-form";
import { GDPRConsent } from "@/components/onboarding/gdpr-consent";
import { Steps } from "@/components/onboarding/steps";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    age: 0,
    interests: [] as string[],
    gdprConsent: false,
    educationLevel: "other", // Add required fields
    preferredLanguage: "",
    learningStyle: "visual",
    difficultyPreference: "beginner"
  });
  const router = useRouter();

  const handleNext = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (step === 3) {
      completeOnboarding();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Onboarding failed:", data.error);
        // Handle error (show toast/notification)
        return;
      }
  
      router.push("/chat");
    } catch (error) {
      console.error("Onboarding error:", error);
      // Handle error (show toast/notification)
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Steps currentStep={step} />
      
      {step === 1 && (
        <UserDetailsForm 
          initialData={formData} 
          onNext={handleNext} 
        />
      )}
      
      {step === 2 && (
        <InterestsForm 
          initialData={formData} 
          onNext={handleNext} 
        />
      )}
      
      {step === 3 && (
        <GDPRConsent 
          initialData={formData} 
          onNext={handleNext} 
        />
      )}
    </div>
  );
}