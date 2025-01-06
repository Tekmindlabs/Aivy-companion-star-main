// scripts/setup-milvus.ts
import * as dotenv from 'dotenv';
dotenv.config(); // Add this line at the top

import { initializeMilvus } from '../app/api/init';

async function setup() {
  try {
    await initializeMilvus();
    console.log('Milvus collections initialized successfully');
  } catch (error) {
    console.error('Error initializing Milvus:', error);
  }
}

setup();