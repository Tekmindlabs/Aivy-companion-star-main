import { getMilvusClient } from '../milvus/client';
import { v4 as uuidv4 } from 'uuid';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  userId: string;
  sourceId: string;
  targetId: string;
  relationshipType: string;
  metadata?: Record<string, any>;
}

interface MilvusRelationship {
  id: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  metadata: string;
}

export class KnowledgeGraphService {
  async createRelationship({
    userId,
    sourceId,
    targetId,
    relationshipType,
    metadata = {}
  }: {
    userId: string;
    sourceId: string;
    targetId: string;
    relationshipType: string;
    metadata?: Record<string, any>;
  }) {
    const client = await getMilvusClient();

    await client.insert({
      collection_name: 'knowledge_graph',
      data: [{
        id: uuidv4(),
        user_id: userId,
        source_id: sourceId,
        target_id: targetId,
        relationship_type: relationshipType,
        metadata: JSON.stringify(metadata)
      }]
    });
  }

  async findRelatedContent({
    userId,
    contentId,
    relationshipTypes = [],
    maxDepth = 2
  }: {
    userId: string;
    contentId: string;
    relationshipTypes?: string[];
    maxDepth?: number;
  }): Promise<MilvusRelationship[]> {
    const client = await getMilvusClient();
    const visited = new Set<string>();
    const results: MilvusRelationship[] = [];

    async function traverse(currentId: string, depth: number) {
      if (depth > maxDepth || visited.has(currentId)) return;
      visited.add(currentId);

      let filter = `user_id == "${userId}" && (source_id == "${currentId}" || target_id == "${currentId}")`;
      if (relationshipTypes.length > 0) {
        filter += ` && relationship_type in ${JSON.stringify(relationshipTypes)}`;
      }

      const relationships = await client.query({
        collection_name: 'knowledge_graph',
        filter,
        output_fields: ['source_id', 'target_id', 'relationship_type', 'metadata']
      });

      for (const rel of relationships) {
        const nextId = rel.source_id === currentId ? rel.target_id : rel.source_id;
        results.push(rel);
        await traverse(nextId, depth + 1);
      }
    }

    await traverse(contentId, 0);
    return results;
  }

  async getGraphData(userId: string) {
    const client = await getMilvusClient();
    
    const relationships: MilvusRelationship[] = await client.query({
      collection_name: 'knowledge_graph',
      filter: `user_id == "${userId}"`,
      output_fields: ['id', 'source_id', 'target_id', 'relationship_type', 'metadata']
    });

    return {
      nodes: this.extractNodesFromRelationships(relationships),
      relationships: relationships.map(this.formatRelationship)
    };
  }

  private extractNodesFromRelationships(relationships: MilvusRelationship[]): GraphNode[] {
    const nodesMap = new Map<string, GraphNode>();
    
    relationships.forEach(rel => {
      if (!nodesMap.has(rel.source_id)) {
        nodesMap.set(rel.source_id, {
          id: rel.source_id,
          label: JSON.parse(rel.metadata)?.sourceLabel || rel.source_id,
          type: 'node',
          userId: '',
        });
      }
      if (!nodesMap.has(rel.target_id)) {
        nodesMap.set(rel.target_id, {
          id: rel.target_id,
          label: JSON.parse(rel.metadata)?.targetLabel || rel.target_id,
          type: 'node',
          userId: '',
        });
      }
    });

    return Array.from(nodesMap.values());
  }

  private formatRelationship(rel: MilvusRelationship): GraphRelationship {
    return {
      id: rel.id,
      userId: '',
      sourceId: rel.source_id,
      targetId: rel.target_id,
      relationshipType: rel.relationship_type,
      metadata: JSON.parse(rel.metadata)
    };
  }
}