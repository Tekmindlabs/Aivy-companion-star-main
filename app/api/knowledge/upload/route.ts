// app/api/knowledge/upload/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { processDocument } from "@/lib/knowledge/document-processor";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 });
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return Response.json({
        success: false,
        error: "User not found"
      }, { status: 404 });
    }

    const formData = await req.formData();
    const uploadedFile = formData.get("file") as File;
    
    if (!uploadedFile) {
      return Response.json({
        success: false,
        error: "No file provided"
      }, { status: 400 });
    }

    // File validation
    const allowedTypes = [
      'application/pdf', 
      'text/plain', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(uploadedFile.type)) {
      return Response.json({
        success: false,
        error: "Invalid file type. Allowed types: PDF, TXT, DOC, DOCX"
      }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (uploadedFile.size > maxSize) {
      return Response.json({
        success: false,
        error: `File size exceeds 10MB limit`
      }, { status: 400 });
    }

    console.log('Processing document for user ID:', session.user.id);
    const document = await processDocument(uploadedFile, session.user.id);
    
    // Updated response to include version information
    return Response.json({
      success: true,
      document,
      message: document.version > 1 ? 
        `Document updated to version ${document.version}` : 
        "Document uploaded successfully",
      version: document.version,
      isUpdate: document.version > 1
    });

  } catch (error: unknown) {
    console.error("Upload error:", error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload document"
    }, { status: 500 });
  }
}

// Add configuration for API route
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser
    responseLimit: false, // Remove the response size limit
  },
};