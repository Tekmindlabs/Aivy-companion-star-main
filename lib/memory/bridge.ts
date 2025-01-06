import { PythonShell, Options } from 'python-shell';
import path from 'path';
import fs from 'fs';

export interface MemoryMetadata {
  content_type?: string;
  content_id?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface CreateMemoryParams {
  content: string;
  userId: string;
  metadata?: MemoryMetadata;
}

export interface UpdateMemoryParams {
  memoryId: string;
  userId: string;
  content?: string;
  metadata?: MemoryMetadata;
}

export class Mem0Bridge {
  private pythonPath: string;

  constructor() {
    this.pythonPath = path.join(process.cwd(), 'lib/memory/python/mem0_bridge.py');
    
    // Verify Python script exists
    if (!fs.existsSync(this.pythonPath)) {
      throw new Error(`Python bridge script not found at: ${this.pythonPath}`);
    }
  }

  private async runPythonCommand(command: string, args: any): Promise<any> {
    const options: Options = {
      mode: 'text' as const,
      pythonPath: 'python',
      pythonOptions: ['-u'],
      args: [command, JSON.stringify(args)]
    };

    try {
      console.log(`Running Python command: ${command}`);
      console.log(`With args:`, args);
      
      const results = await PythonShell.run(this.pythonPath, options);
      console.log('Python results:', results);

      if (!results || !results[0]) {
        throw new Error('No response from Python script');
      }

      return JSON.parse(results[0]);
    } catch (error) {
      console.error('Python bridge error:', error);
      throw error;
    }
  }

  /**
   * Create a new memory entry
   */
  async createMemory({ content, userId, metadata }: CreateMemoryParams): Promise<any> {
    if (!content || !userId) {
      throw new Error('Content and userId are required for creating memory');
    }

    const enrichedMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
    };

    // Changed from 'create' to 'add' to match Python bridge commands
    return this.runPythonCommand('add', {
      content,
      userId,
      metadata: enrichedMetadata
    });
  }

  /**
   * Add a memory entry (direct implementation instead of alias)
   */
  async addMemory(content: string, userId: string, metadata?: Record<string, any>) {
    if (!content || !userId) {
      throw new Error('Content and userId are required for adding memory');
    }

    const enrichedMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
    };

    return this.runPythonCommand('add', {
      content,
      userId,
      metadata: enrichedMetadata
    });
  }

  /**
   * Update an existing memory entry
   */
  async updateMemory({ memoryId, userId, content, metadata }: UpdateMemoryParams): Promise<any> {
    if (!memoryId || !userId) {
      throw new Error('MemoryId and userId are required for updating memory');
    }

    const updateData: any = {
      memoryId,
      userId,
    };

    if (content !== undefined) {
      updateData.content = content;
    }

    if (metadata !== undefined) {
      updateData.metadata = {
        ...metadata,
        updated_at: new Date().toISOString()
      };
    }

    return this.runPythonCommand('update', updateData);
  }

  /**
   * Search for memories
   */
  async searchMemories(query: string, userId: string, limit: number = 5) {
    if (!query || !userId) {
      throw new Error('Query and userId are required for searching memories');
    }

    return this.runPythonCommand('search', { query, userId, limit });
  }

  /**
   * Delete a memory entry
   */
  async deleteMemory(userId: string, memoryId: string): Promise<any> {
    if (!userId || !memoryId) {
      throw new Error('UserId and memoryId are required for deleting memory');
    }

    return this.runPythonCommand('delete', { userId, memoryId });
  }

  /**
   * Get a single memory by ID
   */
  async getMemory(userId: string, memoryId: string): Promise<any> {
    if (!userId || !memoryId) {
      throw new Error('UserId and memoryId are required for getting memory');
    }

    return this.runPythonCommand('get', { userId, memoryId });
  }
}