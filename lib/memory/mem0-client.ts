// /lib/memory/mem0-client.ts
import { Mem0Bridge } from './bridge';

interface Mem0Response {
  success: boolean;
  error?: string;
  results?: {
    results: Array<{
      id?: string;
      content_id?: string;
      user_id: string;
      metadata?: Record<string, any>;
      score?: number;
    }>;
  };
}

export interface Mem0Client {
  add(content: string, userId: string, metadata?: Record<string, any>): Promise<Mem0Response>;
  search(query: string, userId: string, limit?: number): Promise<Mem0Response>;
  delete(userId: string, memoryId: string): Promise<Mem0Response>;
}

class DefaultMem0Client implements Mem0Client {
  private bridge: Mem0Bridge;

  constructor() {
    this.bridge = new Mem0Bridge();
  }

  async add(content: string, userId: string, metadata?: Record<string, any>): Promise<Mem0Response> {
    try {
      const result = await this.bridge.addMemory(content, userId, metadata);
      return { success: true, results: result };
    } catch (error) {
      console.error('Error adding memory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async search(query: string, userId: string, limit: number = 10): Promise<Mem0Response> {
    try {
      const results = await this.bridge.searchMemories(query, userId, limit);
      return { success: true, results: { results } };
    } catch (error) {
      console.error('Error searching memories:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async delete(userId: string, memoryId: string): Promise<Mem0Response> {
    try {
      await this.bridge.deleteMemory(userId, memoryId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting memory:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

let mem0Client: Mem0Client | null = null;

export function getMem0Client(): Mem0Client {
  if (!mem0Client) {
    mem0Client = new DefaultMem0Client();
  }
  return mem0Client;
}