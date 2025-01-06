import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
      return new Response("Tag name is required", { status: 400 });
    }

    // Note: Use prisma.tag instead of prisma.tags
    const tag = await prisma.tag.create({
      data: {
        userId: session.user.id,
        name,
      },
    });

    return Response.json(tag);
  } catch (error) {
    console.error("Tag creation error:", error);
    return new Response("Internal error", { status: 500 });
  }
}