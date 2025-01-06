import { NextResponse } from 'next/server';
import { KnowledgeService } from '@/lib/services/knowledge-service';
import { handleMilvusError } from '@/lib/milvus/error-handler';

const knowledgeService = new KnowledgeService();

export async function POST(req: Request) {
  try {
    const { userId, embedding } = await req.json();
    
    const results = await knowledgeService.searchRelatedContent(
      userId,
      embedding
    );

    return NextResponse.json({ results });
  } catch (error) {
    handleMilvusError(error);
    return NextResponse.json(
      { error: 'Search operation failed' },
      { status: 500 }
    );
  }
}