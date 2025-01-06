import * as z from "zod";

export const userDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  age: z.number().min(13, "Must be at least 13 years old"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  educationLevel: z.enum(['primary', 'secondary', 'university', 'other']).optional(),
  preferredLanguage: z.string().optional(),
  learningStyle: z.enum(['visual', 'auditory', 'reading', 'kinesthetic']).optional(),
  difficultyPreference: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  gdprConsent: z.boolean().refine((val) => val === true, {
    message: "You must accept the GDPR terms",
  }),
});