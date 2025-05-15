
import { supabase } from './supabase';
import { Article } from '../types';

export async function getArticleBySlug(slug: string): Promise<{ data: Article | null; error: any }> {
  // First query the article
  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      author: author_id (*)
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
      tags:tag_id (*)
    `)
    .eq('article_id', article.id);
  
  if (tagsError) {
    console.error('Error fetching article tags:', tagsError);
    // We can still return the article without tags
  } else if (articleTags) {
    // Map the tags into the expected format
    article.tags = articleTags.map(item => item.tags);
  }
  
  return { data: article, error: null };
}

export async function getRelatedArticles(currentArticleId: string, limit: number = 3): Promise<{ data: Article[] | null; error: any }> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author: author_id (*)
    `)
    .neq('id', currentArticleId)
    .limit(limit);
  
  if (error) {
    console.error('Error fetching related articles:', error);
    return { data: null, error };
  }
  
  return { data, error: null };
}
