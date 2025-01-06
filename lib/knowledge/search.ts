import { EmbeddingModel } from './embeddings'; // Add this import
import { searchSimilarContent } from '../milvus/vectors';
import { findRelatedContent } from '../milvus/knowledge-graph';
import { prisma } from '@/lib/prisma';

// Add interfaces for type safety
interface SearchResult {
  content_id: string;
  content_type: string;
  score: number;
}

interface ContentDetails {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface SearchOutput {
  id: string;
  type: string;
  title: string;
  excerpt: string;
  createdAt: Date;
  score: number;
  related: any[]; // You might want to define a more specific type for related content
}

export async function searchKnowledgeBase(
  query: string,
  userId: string,
  limit: number = 10
): Promise<SearchOutput[]> {
  try {
    const { data } = await EmbeddingModel.generateEmbedding(query);
    console.log('Search query embedding generated:', data.length);

    const similarContent = await searchSimilarContent({
      userId,
      embedding: Array.from(data),
      limit
    });

    // Get content details from Prisma
    const contentIds = similarContent.map((result: SearchResult) => result.content_id);
    const contents = await prisma.document.findMany({ // Changed from documents to document
      where: {
        id: { in: contentIds },
        userId
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true
      }
    });

    // Find related content
    const relatedContent = await Promise.all(
      contentIds.map((id: string) => findRelatedContent({ 
        userId, 
        contentId: id, 
        maxDepth: 1 
      }))
    );

    return similarContent.map((result: SearchResult, index: number): SearchOutput => ({
      id: result.content_id,
      type: result.content_type,
      title: contents[index]?.title || '',
      excerpt: contents[index]?.content?.substring(0, 200) + '...',
      createdAt: contents[index]?.createdAt,
      score: result.score,
      related: relatedContent[index]
    }));
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    throw error;
  }
}