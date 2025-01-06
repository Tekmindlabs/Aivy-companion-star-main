import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { KnowledgeService } from '@/lib/services/knowledge-service';
import { handleMilvusError } from '@/lib/milvus/error-handler';
import { getMilvusClient } from '@/lib/milvus/client';

const knowledgeService = new KnowledgeService();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session user:', session?.user?.id);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getMilvusClient();
    const countResult = await client.query({
      collection_name: 'content',   
      filter: `user_id == "${session.user.id}"`,    
      output_fields: ['id'], // You can specify any field here
    
    });
    
    const contentCount = countResult.length;

    console.log('Milvus content count:', contentCount);

    const graphData = await knowledgeService.getKnowledgeGraph(session.user.id);
    console.log('Graph data retrieved:', {
      nodeCount: graphData.nodes.length,
      relationshipCount: graphData.relationships.length
    });
    
    return Response.json(graphData);
  } catch (error) {
    console.error('Error fetching graph data:', error);
    return Response.json({ error: "Failed to fetch graph data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }


    const { sourceId, targetId, type } = await req.json();
    
    if (!sourceId || !targetId || !type) {
      return Response.json(
        { error: "Missing required parameters" }, 
        { status: 400 }
      );
    }

    await knowledgeService.createContentRelationship(
      session.user.id,
      sourceId,
      targetId,
      type
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating relationship:', error);
    handleMilvusError(error);
    return Response.json({ error: "Failed to create relationship" }, { status: 500 });
  }
}