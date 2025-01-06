import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const MILVUS_ADDRESS = process.env.MILVUS_ADDRESS;
const MILVUS_TOKEN = process.env.MILVUS_TOKEN;

class MilvusConnection {
  private static instance: MilvusClient;

  private constructor() {}

  public static async getInstance(): Promise<MilvusClient> {
    if (!MilvusConnection.instance) {
      if (!MILVUS_ADDRESS || !MILVUS_TOKEN) {
        throw new Error('Milvus configuration missing: MILVUS_ADDRESS and MILVUS_TOKEN are required');
      }

      const config = {
        address: MILVUS_ADDRESS.replace('https://', ''), // Remove https:// if present
        token: MILVUS_TOKEN,
        ssl: true // Always true for cloud cluster
      };

      MilvusConnection.instance = new MilvusClient(config);
    }
    return MilvusConnection.instance;
  }
}

export const getMilvusClient = () => MilvusConnection.getInstance();