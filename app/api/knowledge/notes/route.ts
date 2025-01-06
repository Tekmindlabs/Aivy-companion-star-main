import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getEmbedding } from '@/lib/knowledge/embeddings';
import { insertVector } from '@/lib/milvus/vectors';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { title, content } = await req.json();
    if (!title || !content) {
      return new Response('Title and content are required', { status: 400 });
    }

    // Create the note in the database
    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title,
        content,
        format: 'text',
      },
    });

    // Generate embedding and convert Float32Array to number[]
    const embedding = await getEmbedding(content);
    const embeddingArray = Array.from(embedding);

    console.log('Note embedding generated:', embeddingArray.length);

    // Store the vector
    await insertVector({
      userId: session.user.id,
      contentType: 'note',
      contentId: note.id,
      embedding: embeddingArray,
      metadata: {
        title: note.title,
        createdAt: note.createdAt
      }
    });

    return new Response(JSON.stringify(note), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return new Response('Failed to create note', { status: 500 });
  }
}