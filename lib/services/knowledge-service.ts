import { getEmbedding } from '@/lib/knowledge/embeddings';
import { insertVector, searchSimilarContent } from '@/lib/milvus/vectors';
import { Document, Note, URL, Vector, VectorResult } from '@/lib/knowledge/types';
import { handleMilvusError } from '@/lib/milvus/error-handler';
import { createRelationship, findRelatedContent } from '@/lib/milvus/knowledge-graph';
import { getMilvusClient } from '@/lib/milvus/client';
import { prisma } from '@/lib/prisma';

// Transform relationships into edges
interface RelationshipResult {
  source_id: string;
  target_id: string;
  relationship_type: string;
  metadata: string;
}

interface GraphNode {
  id: string;
  type: string;
  label: string;
  metadata: any;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  metadata: any;
}

interface GraphData {
  nodes: GraphNode[];
  relationships: GraphEdge[];
}

export class KnowledgeService {
  async addDocument(userId: string, document: Document): Promise<void> {
    try {
      // Generate embedding for document content
      const embedding = await getEmbedding(document.content);
      console.log('Generated embedding:', embedding?.length);

      // Insert vector into Milvus
      const vectorResult = await insertVector({
        userId,
        contentType: 'document',
        contentId: document.id,
        embedding: Array.from(embedding),
        metadata: {
          title: document.title,
          fileType: document.fileType,
          version: document.version,
          createdAt: new Date().toISOString()
        }
      });

      console.log('Vector inserted:', vectorResult);

      // Find similar content to create relationships
      const similarContent = await searchSimilarContent({
        userId,
        embedding: Array.from(embedding),
        limit: 5
      });

      console.log('Similar content found:', similarContent);

      // Create relationships with similar content
      for (const content of similarContent) {
        if (content.content_id !== document.id) {
          const relationshipResult = await createRelationship({
            userId,
            sourceId: document.id,
            targetId: content.content_id,
            relationshipType: 'related',
            metadata: {
              similarity: content.score,
              createdAt: new Date().toISOString()
            }
          });

          console.log('Relationship created:', relationshipResult);
        }
      }
    } catch (error) {
      handleMilvusError(error);
      throw error;
    }
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    try {
      console.log('🗑️ Starting document deletion process:', {
        userId,
        documentId
      });
  
      // 1. Get the document to verify ownership and get vectorId
      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          userId: userId
        }
      });
  
      if (!document) {
        console.log('❌ Document not found or unauthorized');
        throw new Error('Document not found or unauthorized');
      }
  
      console.log('📄 Found document:', {
        documentId: document.id,
        vectorId: document.vectorId
      });
  
      // 2. Delete vector from Milvus if it exists
      if (document.vectorId) {
        const client = await getMilvusClient();
        await client.delete({
          expr: `id in [${document.vectorId}]`
        });
        console.log('🗑️ Deleted vector from Milvus:', document.vectorId);
      }
  
      // 3. Delete relationships from knowledge graph
      const relationshipResults = await findRelatedContent({
        userId,
        contentId: documentId,
        maxDepth: 1,
        relationshipTypes: ['related', 'references', 'similar_to']
      });
  
      if (relationshipResults.data && relationshipResults.data.length > 0) {
        const client = await getMilvusClient();
        await client.delete({
          expr: `source_id == "${documentId}" || target_id == "${documentId}"`
        });
        console.log('🔗 Deleted relationships from knowledge graph');
      }
  
      // 4. Delete document from database
      await prisma.document.delete({
        where: {
          id: documentId
        }
      });
  
      console.log('✅ Document successfully deleted:', documentId);
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      handleMilvusError(error);
      throw error;
    }
  }

  async getKnowledgeGraph(userId: string): Promise<GraphData> {
    try {
      console.log('Fetching knowledge graph for user:', userId);
      const client = await getMilvusClient();
      
      // Get content nodes with better error handling
      const contentResults = await client.query({
        collection_name: 'content_vectors', // Make sure this matches your collection name
        filter: `user_id == "${userId}"`,
        output_fields: ['content_id', 'content_type', 'metadata']
      });

      console.log('Raw content results:', contentResults);

      if (!contentResults?.data || !Array.isArray(contentResults.data)) {
        console.warn('No content results found:', contentResults);
        return { nodes: [], relationships: [] };
      }

      // Transform content into nodes
      const nodes: GraphNode[] = contentResults.data.map((content: VectorResult) => ({
        id: content.content_id,
        type: content.content_type,
        label: this.parseMetadata(content.metadata).title || content.content_id,
        metadata: this.parseMetadata(content.metadata)
      }));

      if (nodes.length === 0) {
        return { nodes: [], relationships: [] };
      }

      // Get relationships between nodes
      const relationshipResults = await findRelatedContent({
        userId,
        contentId: nodes[0]?.id,
        maxDepth: 3,
        relationshipTypes: ['related', 'references']
      });
      
      // Then use it in the map function:
      const relationships: GraphEdge[] = relationshipResults.data.map((rel: RelationshipResult) => ({
        source: rel.source_id,
        target: rel.target_id,
        type: rel.relationship_type,
        metadata: this.parseMetadata(rel.metadata)
      }));

      return { nodes, relationships };
    } catch (error) {
      handleMilvusError(error);
      throw error;
    }
  }

  async createContentRelationship(
    userId: string,
    sourceId: string,
    targetId: string,
    relationshipType: string
  ): Promise<void> {
    try {
      const result = await createRelationship({
        userId,
        sourceId,
        targetId,
        relationshipType,
        metadata: {
          createdAt: new Date().toISOString()
        }
      });
      console.log('Relationship created:', result);
    } catch (error) {
      handleMilvusError(error);
      throw error;
    }
  }

  private parseMetadata(metadata: string | null | undefined): any {
    if (!metadata) return {};
    try {
      return JSON.parse(metadata);
    } catch (error) {
      console.warn('Failed to parse metadata:', error);
      return {};
    }
  }
}
