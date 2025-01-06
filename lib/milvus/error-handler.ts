export class MilvusOperationError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = 'MilvusOperationError';
  }
}

export function handleMilvusError(error: any) {
  console.error('Milvus operation failed:', error);

  if (error.code === 'ECONNREFUSED') {
    throw new MilvusOperationError(
      'Could not connect to Milvus server. Please ensure the server is running.',
      error
    );
  }

  if (error.message?.includes('collection not found')) {
    throw new MilvusOperationError(
      'Collection has not been initialized.',
      error
    );
  }

  throw new MilvusOperationError(
    'Vector operation failed. Please try again.',
    error
  );
}