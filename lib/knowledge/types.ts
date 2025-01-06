// types.ts
export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  vectorId: string | null;
  fileType: string;
  version: number;
  metadata?: {
    previousVersions?: Array<{
      version: number;
      updatedAt: Date;
    }>;
    size?: number;
    lastModified?: number;
    fileType?: string;
    embeddingDimension?: number;
    processingTimestamp?: string;
    [key: string]: any;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface URL {
  id: string;
  url: string;
  title: string;
  content: string;
  userId: string;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  format: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Vector {
  id: string;
  contentType: string;
  contentId: string;
  embedding: number[];
  createdAt: Date;
}

export interface SharedContent {
  id: string;
  ownerId: string;
  sharedWithId: string;
  contentType: string;
  contentId: string;
  permissions: {
    read: boolean;
    write: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
export interface VectorResult {
  id: string;
  user_id: string;
  content_type: string;
  content_id: string;
  metadata: string;
  score?: number;
}