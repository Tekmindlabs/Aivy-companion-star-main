import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { userDetailsSchema } from "@/lib/validations/onboarding";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    
    try {
      const validatedData = userDetailsSchema.parse(body);
      
      // Only include fields that exist in the Prisma schema
      const updateData = {
        name: validatedData.name,
        phoneNumber: validatedData.phoneNumber,
        age: validatedData.age,
        interests: validatedData.interests,
        educationLevel: validatedData.educationLevel,
        preferredLanguage: validatedData.preferredLanguage,
        learningStyle: validatedData.learningStyle,
        difficultyPreference: validatedData.difficultyPreference,
        gdprConsent: validatedData.gdprConsent,
        onboarded: true,
      };

      await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      });

      return new NextResponse(
        JSON.stringify({ message: "Onboarding completed successfully" }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (validationError: any) {
      console.error("Validation error:", validationError);
      return new NextResponse(
        JSON.stringify({ 
          error: "Validation Error", 
          details: validationError.errors 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}