import { setupCollections, initializeCollections } from '../../lib/milvus/collections';
import { handleMilvusError } from '../../lib/milvus/error-handler';

// Main application initialization
export async function initializeApp() {
  try {
    await initializeMilvus();
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    throw error;
  }
}

// Milvus specific initialization
export async function initializeMilvus() {
  try {
    // Use the existing initializeCollections function which checks if collections exist
    // before creating them
    await initializeCollections();
    console.log('Milvus collections initialized successfully');
  } catch (error) {
    console.error('Error initializing Milvus:', error);
    handleMilvusError(error);
    throw error; // Rethrow to be caught by initializeApp
  }
}