
import { supabase } from './supabase';
import { Article } from '../types';

export async function getArticleBySlug(slug: string): Promise<{ data: Article | null; error: any }> {
  // First query the article
  const { data: articleData, error } = await supabase
    .from('articles')
    .select(`
      id, title, content, excerpt, image_url, category, author_id, slug, read_time, published, created_at, updated_at,
      author:authors(id, name, bio, avatar_url, email, created_at, updated_at)
    `)
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching article:', error);
    return { data: null, error };
  }
  
  // Then fetch tags for this article
  const { data: articleTags, error: tagsError } = await supabase
    .from('article_tags')
    .select(`
      tag_id,
      tags:tags(id, name, slug, created_at)
    `)
    .eq('article_id', articleData.id);
  
  if (tagsError) {
    console.error('Error fetching article tags:', tagsError);
    // We can still return the article without tags
  }
  
  // Convert the fetched data to our Article type
  const article: Article = {
    ...articleData,
    keywords: articleData.keywords || [],
    seo_description: articleData.seo_description || '',
    tags: articleTags ? articleTags.map(item => item.tags) : []
  };
  
  return { data: article, error: null };
}

export async function getRelatedArticles(currentArticleId: string, limit: number = 3): Promise<{ data: Article[] | null; error: any }> {
  const { data: relatedArticlesData, error } = await supabase
    .from('articles')
    .select(`
      id, title, content, excerpt, image_url, category, author_id, slug, read_time, published, created_at, updated_at,
      author:authors(id, name, bio, avatar_url, email, created_at, updated_at)
    `)
    .neq('id', currentArticleId)
    .limit(limit);
  
  if (error) {
    console.error('Error fetching related articles:', error);
    return { data: null, error };
  }
  
  // Convert the fetched data to our Article type
  const articles: Article[] = relatedArticlesData.map(data => ({
    ...data,
    keywords: data.keywords || [],
    seo_description: data.seo_description || '',
    tags: []
  }));
  
  return { data: articles, error: null };
}
