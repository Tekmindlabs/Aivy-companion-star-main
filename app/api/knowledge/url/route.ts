import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { processURL } from "@/lib/knowledge/url-processor";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { url } = await req.json();
    
    if (!url) {
      return new Response("No URL provided", { status: 400 });
    }

    const urlDoc = await processURL(url, session.user.id);
    
    return Response.json(urlDoc);
  } catch (error) {
    console.error("URL processing error:", error);
    return new Response("Internal error", { status: 500 });
  }
}