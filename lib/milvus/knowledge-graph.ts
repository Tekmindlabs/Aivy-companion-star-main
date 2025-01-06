import { getEmbedding } from '@/lib/knowledge/embeddings';
import { insertVector, searchSimilarContent } from '@/lib/milvus/vectors';
import { Document, Note, URL, Vector, VectorResult } from '@/lib/knowledge/types';
import { handleMilvusError } from '@/lib/milvus/error-handler';
import { getMilvusClient } from './client';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for graph data structures
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


interface RelationshipMetadata {
  similarity?: number;
  createdAt: string;
  [key: string]: any;
}

interface CreateRelationshipParams {
  userId: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  metadata: RelationshipMetadata;
}


interface RelationshipParams {
  userId: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  metadata: Record<string, any>;
}

interface RelatedContentParams {
  userId: string;
  contentId: string;
  maxDepth?: number;
  relationshipTypes?: string[];
}

export async function createRelationship(params: RelationshipParams) {
  const client = await getMilvusClient();
  return await client.insert({
    collection_name: 'relationships',
    data: [{
      id: uuidv4(),
      user_id: params.userId,
      source_id: params.sourceId,
      target_id: params.targetId,
      relationship_type: params.relationshipType,
      metadata: JSON.stringify(params.metadata)
    }]
  });
}

export async function findRelatedContent(params: RelatedContentParams) {
  const client = await getMilvusClient();
  const maxDepth = params.maxDepth || 3;
  const relationshipTypes = params.relationshipTypes || ['related', 'references'];
  
  const filter = `user_id == "${params.userId}" && relationship_type in ${JSON.stringify(relationshipTypes)}`;
  
  return await client.query({
    collection_name: 'relationships',
    filter,
    output_fields: ['source_id', 'target_id', 'relationship_type', 'metadata']
  });
}

export class KnowledgeService {
  async addDocument(userId: string, document: Document): Promise<void> {
    try {
      console.log('Adding document:', {
        userId,
        documentId: document.id,
        title: document.title
      });

      // Generate embedding for document content
      const embedding = await getEmbedding(document.content);
      if (!embedding) {
        throw new Error('Failed to generate embedding for document');
      }
      console.log('Generated embedding:', embedding.length);

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

      // Find similar content
      const similarContent = await searchSimilarContent({
        userId,
        embedding: Array.from(embedding),
        limit: 5
      });

      console.log('Similar content found:', similarContent.length);

      // Create relationships with similar content
      const relationshipPromises = similarContent.map(async (content: VectorResult) => {
        if (content.content_id !== document.id) {
          return this.createContentRelationship(
            userId,
            document.id,
            content.content_id,
            'related',
            {
              similarity: content.score,
              createdAt: new Date().toISOString()
            }
          );
        }
      });

      await Promise.all(relationshipPromises.filter(Boolean));
      console.log('Document processing completed successfully');

    } catch (error) {
      console.error('Error in addDocument:', error);
      handleMilvusError(error);
      throw error;
    }
  }

  async getKnowledgeGraph(userId: string): Promise<GraphData> {
    try {
      console.log('Fetching knowledge graph for user:', userId);
      const client = await getMilvusClient();
      
      // Get content nodes
      const contentResults = await client.query({
        collection_name: 'content',
        filter: `user_id == "${userId}"`,
        output_fields: ['content_id', 'content_type', 'metadata']
      });

      if (!contentResults?.data || !Array.isArray(contentResults.data)) {
        console.log('No content results found or invalid format');
        return { nodes: [], relationships: [] };
      }

      // Transform content into nodes
const nodes: GraphNode[] = contentResults.data.map((content: {
  content_id: string;
  content_type: string;
  metadata: string;
}) => ({
  id: content.content_id,
  type: content.content_type,
  label: this.parseMetadata(content.metadata).title || content.content_id,
  metadata: this.parseMetadata(content.metadata)
}));

      if (nodes.length === 0) {
        return { nodes: [], relationships: [] };
      }

      // Get relationships between nodes
      const relationships = await this.getRelationships(userId, nodes[0]?.id);

      // Transform relationships into edges
const edges: GraphEdge[] = relationships.map((rel: {
  source_id: string;
  target_id: string;
  relationship_type: string;
  metadata: string;
}) => ({
  source: rel.source_id,
  target: rel.target_id,
  type: rel.relationship_type,
  metadata: this.parseMetadata(rel.metadata)
}));

      console.log('Graph data retrieved:', {
        nodeCount: nodes.length,
        edgeCount: edges.length
      });

      return {
        nodes,
        relationships: edges
      };

    } catch (error) {
      console.error('Error in getKnowledgeGraph:', error);
      handleMilvusError(error);
      throw error;
    }
  }

  async createContentRelationship(
    userId: string,
    sourceId: string,
    targetId: string,
    relationshipType: string,
    metadata: RelationshipMetadata = { createdAt: new Date().toISOString() }
  ): Promise<void> {
    try {
      console.log('Creating relationship:', {
        userId,
        sourceId,
        targetId,
        relationshipType
      });

      const params: CreateRelationshipParams = {
        userId,
        sourceId,
        targetId,
        relationshipType,
        metadata
      };

      await this.createRelationshipInMilvus(params);
      console.log('Relationship created successfully');

    } catch (error) {
      console.error('Error in createContentRelationship:', error);
      handleMilvusError(error);
      throw error;
    }
  }

  // Helper methods
  private async getRelationships(userId: string, startNodeId: string) {
    return await this.queryRelationships({
      userId,
      contentId: startNodeId,
      maxDepth: 3,
      relationshipTypes: ['related', 'references']
    });
  }

  private async createRelationshipInMilvus(params: CreateRelationshipParams) {
    const client = await getMilvusClient();
    await client.insert({
      collection_name: 'relationships',
      data: [{
        user_id: params.userId,
        source_id: params.sourceId,
        target_id: params.targetId,
        relationship_type: params.relationshipType,
        metadata: JSON.stringify(params.metadata)
      }]
    });
  }

  private async queryRelationships(params: {
    userId: string;
    contentId: string;
    maxDepth: number;
    relationshipTypes: string[];
  }) {
    const client = await getMilvusClient();
    const filter = `user_id == "${params.userId}" && relationship_type in ${JSON.stringify(params.relationshipTypes)}`;
    
    return await client.query({
      collection_name: 'relationships',
      filter,
      output_fields: ['source_id', 'target_id', 'relationship_type', 'metadata']
    });
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