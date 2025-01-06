declare module 'mem0' {
    export interface Mem0Result {
      id: string;
      user_id: string;
      created_at: string;
      metadata?: {
        messages?: string;
        [key: string]: any;
      };
    }
  
    export interface Mem0SearchResponse {
      results: Mem0Result[];
    }
  
    export class Memory {
      static from_config(config: any): Memory;
      add(content: string, userId: string, metadata?: Record<string, any>): Promise<void>;
      search(query: string, userId: string): Promise<Mem0SearchResponse>;
    }
  }