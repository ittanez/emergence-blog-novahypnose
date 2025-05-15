
import { supabase } from '@/integrations/supabase/client';
import { Article, Author, Tag } from '../types';

export async function getArticleBySlug(slug: string): Promise<{ data: Article | null; error: any }> {
  try {
    // First fetch just the article ID to avoid deep type instantiation
    const { data: articleId, error: slugError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (slugError || !articleId) {
      console.error('Error fetching article ID by slug:', slugError);
      return { data: null, error: slugError || new Error('Article not found') };
    }
    
    // Then fetch the full article by ID
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('id, title, content, excerpt, image_url, author, published, created_at, updated_at')
      .eq('id', articleId.id)
      .single();
    
    if (articleError) {
      console.error('Error fetching article details:', articleError);
      return { data: null, error: articleError };
    }
    
    // Get tags for this article with a separate query
    let tags: Tag[] = [];
    const { data: tagRelations, error: tagsError } = await supabase
      .from('article_tags')
      .select('tag_id')
      .eq('article_id', articleData.id);
    
    if (!tagsError && tagRelations && tagRelations.length > 0) {
      const tagIds = tagRelations.map(relation => relation.tag_id);
      
      const { data: tagsData } = await supabase
        .from('tags')
        .select('id, name, slug, created_at')
        .in('id', tagIds);
        
      if (tagsData) {
        tags = tagsData as Tag[];
      }
    }
    
    // Get author details with a separate query
    let author: Author | null = null;
    if (articleData.author && typeof articleData.author === 'string') {
      const { data: authorData } = await supabase
        .from('authors')
        .select('id, name, bio, avatar_url, email, created_at, updated_at')
        .eq('id', articleData.author)
        .maybeSingle();
      
      author = authorData as Author | null;
    }
    
    // Construct the final article object with explicitly defined properties
    const article: Article = {
      id: articleData.id,
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt || '',
      image_url: articleData.image_url || '',
      category: '', 
      author_id: typeof articleData.author === 'string' ? articleData.author : '',
      slug: slug,
      read_time: 0,
      published: articleData.published || false,
      created_at: articleData.created_at,
      updated_at: articleData.updated_at,
      seo_description: '',
      keywords: [],
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
    const { data: relatedArticlesData, error } = await supabase
      .from('articles')
      .select('id, title, content, excerpt, image_url, author, published, created_at, updated_at')
      .neq('id', currentArticleId)
      .limit(limit);
    
    if (error) {
      console.error('Error fetching related articles:', error);
      return { data: null, error };
    }
    
    if (!relatedArticlesData || relatedArticlesData.length === 0) {
      return { data: [], error: null };
    }
    
    // Map data to Article type with default values
    const articles: Article[] = relatedArticlesData.map(data => {
      // Generate a slug from the title
      const generatedSlug = data.title ? 
        data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 
        `article-${data.id}`;
      
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || '',
        image_url: data.image_url || '',
        category: '',
        author_id: typeof data.author === 'string' ? data.author : '',
        slug: generatedSlug,
        read_time: 0,
        published: data.published || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        seo_description: '',
        keywords: [],
        tags: []
      };
    });
    
    return { data: articles, error: null };
  } catch (error) {
    console.error('Unexpected error in getRelatedArticles:', error);
    return { data: null, error };
  }
}
