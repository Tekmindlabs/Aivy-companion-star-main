import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { Message } from '@/types/chat';
import { MemoryService } from './memory-service';

class AddMemoryTool extends StructuredTool {
  name = 'add_memory';
  description = 'Add messages to memory with associated metadata';
  schema = z.object({
    messages: z.array(
      z.object({
        content: z.string(),
        role: z.enum(['user', 'assistant'])
      })
    ),
    userId: z.string(),
    metadata: z.record(z.any()).optional()
  });

  constructor(private memoryService: MemoryService) {
    super();
  }

  async _call({
    messages,
    userId,
    metadata
  }: {
    messages: Message[];
    userId: string;
    metadata?: Record<string, any>;
  }) {
    const result = await this.memoryService.addMemory(
      messages, 
      userId, 
      {
        ...metadata,
        tool: 'add_memory',
        timestamp: new Date().toISOString()
      }
    );
    return `Memory added successfully with ID: ${result.id}`;
  }
}

class SearchMemoryTool extends StructuredTool {
  name = 'search_memory';
  description = 'Search through memories based on a query';
  schema = z.object({
    query: z.string(),
    userId: z.string(),
    limit: z.number().optional()
  });

  constructor(private memoryService: MemoryService) {
    super();
  }

  async _call({
    query,
    userId,
    limit
  }: {
    query: string;
    userId: string;
    limit?: number;
  }) {
    const memories = await this.memoryService.searchMemories(
      query,
      userId,
      limit
    );
    return JSON.stringify(memories);
  }
}

export class MemoryTools {
  constructor(private memoryService: MemoryService) {}

  createAddMemoryTool() {
    return new AddMemoryTool(this.memoryService);
  }

  createSearchMemoryTool() {
    return new SearchMemoryTool(this.memoryService);
  }
}