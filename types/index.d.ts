import { User } from "@prisma/client";

declare global {
  interface UserProfile extends User {
    phoneNumber: string | null;
    age: number | null;
    interests: string[];
    educationLevel: string | null;
    preferredLanguage: string | null;
    learningStyle: string | null;
    difficultyPreference: string | null;
  }
}

export {};