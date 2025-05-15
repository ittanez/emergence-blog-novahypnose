
import { supabase } from '@/integrations/supabase/client';
import { Article, Author, Tag } from '../types';

export async function getArticleBySlug(slug: string): Promise<{ data: Article | null; error: any }> {
  try {
    // Use a generic type approach to avoid deep type instantiation
    const { data: articleData, error } = await supabase
      .from('articles')
      .select('id, title, content, excerpt, image_url, published, created_at, updated_at, author, slug')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Error fetching article:', error);
      return { data: null, error };
    }
    
    if (!articleData) {
      return { data: null, error: null };
    }
    
    // Get tags for this article with a separate simple query
    let tags: Tag[] = [];
    const { data: tagRelations, error: tagsError } = await supabase
      .from('article_tags')
      .select('tag_id')
      .eq('article_id', articleData.id);
    
    if (tagsError) {
      console.error('Error fetching article tag relations:', tagsError);
    } else if (tagRelations && tagRelations.length > 0) {
      // Fetch tags data if tag relations exist
      const tagIds = tagRelations.map(relation => relation.tag_id);
      
      const { data: tagsData } = await supabase
        .from('tags')
        .select('id, name, slug, created_at');
        
      if (tagsData) {
        tags = tagsData;
      }
    }
    
    // Get author details if needed with a separate query
    let author: Author | null = null;
    if (typeof articleData.author === 'string') {
      const { data: authorData } = await supabase
        .from('authors')
        .select('id, name, bio, avatar_url, email, created_at, updated_at')
        .eq('id', articleData.author)
        .single();
      
      author = authorData || null;
    }
    
    // Construct the final article object with proper defaults
    const article: Article = {
      id: articleData.id,
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt || '',
      image_url: articleData.image_url || '',
      category: '', // Default value
      author_id: typeof articleData.author === 'string' ? articleData.author : '',
      slug: articleData.slug || '',
      read_time: 0, // Default value
      published: articleData.published || false,
      created_at: articleData.created_at,
      updated_at: articleData.updated_at,
      seo_description: '', // Default value
      keywords: [], // Default value
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
    // Use a generic type approach to avoid deep type instantiation
    const { data: relatedArticlesData, error } = await supabase
      .from('articles')
      .select('id, title, content, excerpt, image_url, published, created_at, updated_at, author, slug')
      .neq('id', currentArticleId)
      .limit(limit);
    
    if (error) {
      console.error('Error fetching related articles:', error);
      return { data: null, error };
    }
    
    if (!relatedArticlesData || relatedArticlesData.length === 0) {
      return { data: [], error: null };
    }
    
    // Map data to Article type with default values where needed
    const articles: Article[] = relatedArticlesData.map(data => ({
      id: data.id,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || '',
      image_url: data.image_url || '',
      category: '', // Default value
      author_id: typeof data.author === 'string' ? data.author : '',
      slug: data.slug || '',
      read_time: 0, // Default value
      published: data.published || false,
      created_at: data.created_at,
      updated_at: data.updated_at,
      seo_description: '', // Default value
      keywords: [], // Default value
      tags: [] // Default value
    }));
    
    return { data: articles, error: null };
  } catch (error) {
    console.error('Unexpected error in getRelatedArticles:', error);
    return { data: null, error };
  }
}
