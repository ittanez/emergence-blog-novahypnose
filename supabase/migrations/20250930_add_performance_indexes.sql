-- Add performance indexes for articles table
-- This migration adds indexes to optimize query performance on the articles table

BEGIN;

-- Index for filtering published articles (used in homepage)
CREATE INDEX IF NOT EXISTS idx_articles_published
ON public.articles(published)
WHERE published = true;

-- Index for ordering by creation date (used in homepage sorting)
CREATE INDEX IF NOT EXISTS idx_articles_created_at
ON public.articles(created_at DESC);

-- Composite index for published articles ordered by date (most common query)
CREATE INDEX IF NOT EXISTS idx_articles_published_created_at
ON public.articles(published, created_at DESC)
WHERE published = true;

-- Index for filtering by categories (using GIN for array operations)
CREATE INDEX IF NOT EXISTS idx_articles_categories
ON public.articles USING GIN(categories);

-- Index for filtering by tags (using GIN for array operations)
CREATE INDEX IF NOT EXISTS idx_articles_tags
ON public.articles USING GIN(tags);

-- Index for slug lookups (used in article page)
CREATE INDEX IF NOT EXISTS idx_articles_slug
ON public.articles(slug);

-- Index for featured articles
CREATE INDEX IF NOT EXISTS idx_articles_featured
ON public.articles(featured)
WHERE featured = true;

COMMIT;