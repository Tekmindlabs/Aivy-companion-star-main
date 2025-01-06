import { URL } from './types';
import { prisma } from '@/lib/prisma';
import { getEmbedding } from './embeddings';
import { insertVector } from '../milvus/vectors';

export async function processURL(
  url: string,
  userId: string
): Promise<URL> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const content = extractContent(html);
    const title = extractTitle(html);
    
    const embeddingArray = await getEmbedding(content);
    // Convert Float32Array to regular number array
    const embedding = Array.from(embeddingArray);
    console.log('URL content embedding generated:', embedding.length);

    // Create URL document
    const urlDoc = await prisma.url.create({
      data: {
        userId,
        url,
        title,
        content,
      },
    });

    // Store vector in Milvus
    await insertVector({
      userId,
      contentType: 'url',
      contentId: urlDoc.id,
      embedding,
      metadata: {
        url,
        title
      }
    });

    return urlDoc;
  } catch (error) {
    console.error('Error processing URL:', error);
    throw error;
  }
}

function extractContent(html: string): string {
  // Implement proper HTML content extraction
  return html.replace(/<[^>]*>/g, ' ').trim();
}

function extractTitle(html: string): string {
  const match = html.match(/<title>(.*?)<\/title>/);
  return match ? match[1] : '';
}