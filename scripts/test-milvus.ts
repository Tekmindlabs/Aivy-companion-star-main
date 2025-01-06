import 'dotenv/config';
import { getMilvusClient } from '../lib/milvus/client';

async function testConnection() {
  console.log('Environment variables:');
  console.log('MILVUS_ADDRESS:', process.env.MILVUS_ADDRESS);
  console.log('MILVUS_TOKEN:', process.env.MILVUS_TOKEN);

  try {
    const client = await getMilvusClient();
    console.log('Testing connection...');
    
    const collections = await client.listCollections();
    console.log('Connected successfully! Available collections:', collections);
    
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection();