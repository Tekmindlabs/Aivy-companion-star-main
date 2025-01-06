import { JinaEmbeddings } from '@langchain/community/embeddings/jina';

// Custom error types
class TensorConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TensorConversionError';
  }
}

class ModelLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelLoadError';
  }
}

export class EmbeddingModel {
  private static embeddings: JinaEmbeddings | null = null;
  private static isLoading: boolean = false;

  private static async getInstance(): Promise<JinaEmbeddings> {
    if (this.embeddings) {
      return this.embeddings;
    }

    try {
      console.log('Initializing Jina embeddings...');

      // Initialize Jina embeddings with your API key
      this.embeddings = new JinaEmbeddings({
        apiKey: process.env.JINA_API_KEY
      });

      if (!this.embeddings) {
        throw new ModelLoadError('Failed to initialize Jina embeddings');
      }

      return this.embeddings;
    } catch (error) {
      console.error('Error initializing Jina embeddings:', error);
      throw new ModelLoadError(`Model initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isLoading = false;
    }
  }

  public static async generateEmbedding(text: string): Promise<Float32Array> {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid input: text must be a non-empty string');
    }

    try {
      const embeddings = await this.getInstance();
      const processedText = text.trim();

      // Generate embeddings using Jina
      const result = await embeddings.embedQuery(processedText);

      // Convert the result to Float32Array
      const embedding = new Float32Array(result);

      // Verify embedding dimension
      if (embedding.length === 0) {
        throw new TensorConversionError('Empty embedding generated');
      }

      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error instanceof Error ? error : new Error('Unknown error during embedding generation');
    }
  }

  public static async clearInstance(): Promise<void> {
    this.embeddings = null;
    this.isLoading = false;
  }
}

// Public function to get embeddings
export async function getEmbedding(
  text: string,
  options?: { maxLength?: number }
): Promise<Float32Array> {
  return await EmbeddingModel.generateEmbedding(text);
}