-- 1. Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- 2. Add a vector column to the products table (Gemini embeddings use 768 dimensions)
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Create an HNSW index to make similarity search lightning fast
CREATE INDEX IF NOT EXISTS products_embedding_idx ON products USING hnsw (embedding vector_cosine_ops);

-- 4. Create a specialized function to match logic
-- We use '<=>' which is the cosine distance operator in pgvector
CREATE OR REPLACE FUNCTION match_products (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  name text,
  price numeric,
  stock integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.price,
    p.stock,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
