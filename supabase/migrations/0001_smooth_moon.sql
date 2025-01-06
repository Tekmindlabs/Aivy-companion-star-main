/*
  # Knowledge Base Schema

  1. New Tables
    - `documents`
      - Document storage and metadata
      - Version control support
      - User ownership tracking
    - `urls`
      - Web content storage
      - Source tracking
      - Access timestamps
    - `notes`
      - Personal note management
      - Rich text support
      - Cross-referencing
    - `tags`
      - Content categorization
    - `content_tags`
      - Many-to-many relationship for content tagging
    - `vectors`
      - Embedding storage for RAG
    - `shared_content`
      - Content sharing management

  2. Security
    - RLS policies for content isolation
    - Sharing controls
*/

-- Documents table for file storage
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  file_type TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- URLs table for web content
CREATE TABLE IF NOT EXISTS urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  url TEXT NOT NULL,
  title TEXT,
  content TEXT,
  last_accessed TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notes table for personal notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT,
  format TEXT DEFAULT 'markdown',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tags for content organization
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, user_id)
);

-- Content tags junction table
CREATE TABLE IF NOT EXISTS content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES tags(id),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vector storage for RAG
CREATE TABLE IF NOT EXISTS vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shared content management
CREATE TABLE IF NOT EXISTS shared_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  shared_with_id UUID NOT NULL REFERENCES users(id),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  permissions JSONB DEFAULT '{"read": true, "write": false}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own documents"
  ON documents
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own URLs"
  ON urls
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own notes"
  ON notes
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own tags"
  ON tags
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_urls_user_id ON urls(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_vectors_content ON vectors(content_type, content_id);
CREATE INDEX idx_shared_content_user ON shared_content(owner_id, shared_with_id);