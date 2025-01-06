import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { userDetailsSchema } from "@/lib/validations/onboarding";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    
    // Validate the data using the schema
    const validationResult = userDetailsSchema.safeParse(data);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Validation failed", 
          details: validationResult.error.errors 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const validatedData = validationResult.data;

    // Log the data before update
    console.log("Updating user with data:", validatedData);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: validatedData,
    });

    return new Response(JSON.stringify(updatedUser), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error("Detailed profile update error:", error);
    
    // Type guard for error handling
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(JSON.stringify({ 
      error: "Error updating profile",
      details: errorMessage 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}