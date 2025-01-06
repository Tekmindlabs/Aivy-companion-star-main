import { getMilvusClient } from './client';
import { DataType } from '@zilliz/milvus2-sdk-node';

export async function initializeMilvusCollections() {
  try {
    const client = await getMilvusClient();
    
    // Create content_vectors collection
    await client.createCollection({
      collection_name: 'content_vectors',
      fields: [
        { name: 'id', data_type: DataType.VARCHAR, is_primary_key: true, max_length: 36 },
        { name: 'user_id', data_type: DataType.VARCHAR, max_length: 36 },
        { name: 'content_type', data_type: DataType.VARCHAR, max_length: 50 },
        { name: 'content_id', data_type: DataType.VARCHAR, max_length: 36 },
        { name: 'metadata', data_type: DataType.JSON },
        { name: 'embedding', data_type: DataType.FLOAT_VECTOR, dim: 1024 }
      ]
    });

    // Create knowledge_graph collection
    await client.createCollection({
      collection_name: 'knowledge_graph',
      fields: [
        { name: 'id', data_type: DataType.VARCHAR, is_primary_key: true, max_length: 36 },
        { name: 'user_id', data_type: DataType.VARCHAR, max_length: 36 },
        { name: 'source_id', data_type: DataType.VARCHAR, max_length: 36 },
        { name: 'target_id', data_type: DataType.VARCHAR, max_length: 36 },
        { name: 'relationship_type', data_type: DataType.VARCHAR, max_length: 50 },
        { name: 'metadata', data_type: DataType.JSON }
      ]
    });

    console.log('Milvus collections initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Milvus collections:', error);
    throw error;
  }
}