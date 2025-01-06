import { NextResponse } from 'next/server';
import { KnowledgeService } from '@/lib/services/knowledge-service';

const knowledgeService = new KnowledgeService();

export async function POST(req: Request) {
  try {
    const { userId, sourceId, targetId, type } = await req.json();
    
    await knowledgeService.createContentRelationship(
      userId,
      sourceId,
      targetId,
      type
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create relationship' },
      { status: 500 }
    );
  }
}