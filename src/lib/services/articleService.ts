
import { supabase } from '@/integrations/supabase/client';
import { Article } from '../types';

export async function getArticleBySlug(slug: string): Promise<{ data: Article | null; error: any }> {
  try {
    // First query the article to get basic data - use explicit type casting to avoid deep instantiation
    const { data: articleData, error } = await supabase
      .from('articles')
      .select('id, title, content, excerpt, image_url, published, created_at, updated_at, author')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Error fetching article:', error);
      return { data: null, error };
    }
    
    if (!articleData) {
      return { data: null, error: null };
    }
    
    // Then fetch tags for this article - with explicit type casting
    const { data: articleTags, error: tagsError } = await supabase
      .from('article_tags')
      .select('tag_id, tags:tags(id, name, slug, created_at)')
      .eq('article_id', articleData.id);
    
    if (tagsError) {
      console.error('Error fetching article tags:', tagsError);
    }
    
    // Extract tags from the nested structure
    const tags = articleTags?.map(item => item.tags) || [];
    
    // Get author details if needed
    let author = null;
    if (typeof articleData.author === 'string') {
      const { data: authorData } = await supabase
        .from('authors')
        .select('*')
        .eq('id', articleData.author)
        .single();
      
      author = authorData || null;
    }
    
    // Convert to Article type with proper defaults
    const article: Article = {
      id: articleData.id,
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt || '',
      image_url: articleData.image_url || '',
      category: '', // Default
      author_id: typeof articleData.author === 'string' ? articleData.author : '',
      slug: slug,
      read_time: 0, // Default
      published: articleData.published || false,
      created_at: articleData.created_at,
      updated_at: articleData.updated_at,
      seo_description: '', // Default
      keywords: [], // Default
      tags: tags,
      author: author
    };
    
    return { data: article, error: null };
  } catch (error) {
    console.error('Unexpected error in getArticleBySlug:', error);
    return { data: null, error };
  }
}

export async function getRelatedArticles(currentArticleId: string, limit: number = 3): Promise<{ data: Article[] | null; error: any }> {
  try {
    // Simplify query to avoid deep type instantiation
    const { data: relatedArticlesData, error } = await supabase
      .from('articles')
      .select('id, title, content, excerpt, image_url, published, created_at, updated_at, author')
      .neq('id', currentArticleId)
      .limit(limit);
    
    if (error) {
      console.error('Error fetching related articles:', error);
      return { data: null, error };
    }
    
    if (!relatedArticlesData || relatedArticlesData.length === 0) {
      return { data: [], error: null };
    }
    
    // Map to Article type
    const articles: Article[] = relatedArticlesData.map(data => ({
      id: data.id,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || '',
      image_url: data.image_url || '',
      category: '', 
      author_id: typeof data.author === 'string' ? data.author : '',
      slug: '', 
      read_time: 0,
      published: data.published || false,
      created_at: data.created_at,
      updated_at: data.updated_at,
      seo_description: '',
      keywords: [],
      tags: []
    }));
    
    return { data: articles, error: null };
  } catch (error) {
    console.error('Unexpected error in getRelatedArticles:', error);
    return { data: null, error };
  }
}
