import { DataType } from '@zilliz/milvus2-sdk-node';
import { getMilvusClient } from './client';
import { ShowCollectionsResponse } from '@zilliz/milvus2-sdk-node/dist/milvus/types/Collection';

export const VECTOR_DIM = 1024; // GTE-Base dimension

export async function setupCollections() {
  try {
    const client = await getMilvusClient();

    // Content vectors collection
    await client.createCollection({
      collection_name: 'content_vectors',
      fields: [
        { name: 'id', data_type: DataType.VARCHAR, is_primary_key: true, max_length: 36 },
        { name: 'user_id', data_type: DataType.VARCHAR, max_length: 36 },
        { name: 'content_type', data_type: DataType.VARCHAR, max_length: 20 },
        { name: 'content_id', data_type: DataType.VARCHAR, max_length: 36 },
        { name: 'embedding', data_type: DataType.FLOAT_VECTOR, dim: VECTOR_DIM },
        { name: 'metadata', data_type: DataType.JSON }
      ],
      enable_dynamic_field: true
    });

    // Create index
    await client.createIndex({
      collection_name: 'content_vectors',
      field_name: 'embedding',
      index_type: 'IVF_FLAT',
      metric_type: 'COSINE',
      params: { nlist: 1024 }
    });

    await client.loadCollectionSync({ collection_name: 'content_vectors' });
  } catch (error) {
    console.error('Error setting up collections:', error);
    throw error;
  }
}

// Add function to check if collection exists
export async function collectionExists(collectionName: string): Promise<boolean> {
  try {
    const client = await getMilvusClient();
    const response = await client.listCollections();
    
    // Based on the documentation, response should contain collection data
    if (Array.isArray(response)) {
      return response.some(collection => collection.name === collectionName);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking collection existence:', error);
    return false;
  }
}

// Add function to initialize collections if they don't exist
export async function initializeCollections() {
  try {
    const exists = await collectionExists('content_vectors');
    if (!exists) {
      await setupCollections();
      console.log('Collections initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing collections:', error);
    throw error;
  }
}