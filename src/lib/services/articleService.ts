import { supabase } from '@/integrations/supabase/client';
import { Article, Author, Category, Tag, CategoryBase, CategoryNode } from '../types';

// Transformation des données d'un article récupéré de Supabase
export const transformArticleData = (data: any): Article => {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt || "",
    image_url: data.image_url || "",
    seo_description: "",
    keywords: [],
    category: data.category || "",
    author_id: typeof data.author === 'string' ? data.author : "",
    slug: data.slug || "",
    read_time: 0,
    published: data.published || false,
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
    // Conversion des tags
    tags: Array.isArray(data.tags) 
      ? data.tags.map(tag => ({ 
          id: "", 
          name: tag, 
          slug: tag.toLowerCase().replace(/\s+/g, '-'),
          created_at: new Date().toISOString()
        }))
      : [],
  };
};

// Récupérer un article par son slug
export async function getArticleBySlug(slug: string): Promise<{ data: Article | null; error: any }> {
  try {
    // D'abord, obtenir l'ID de l'article en utilisant notre fonction RPC personnalisée
    const { data: articleId, error: slugError } = await supabase
      .rpc('get_article_id_by_slug', { slug_param: slug });
    
    if (slugError) {
      console.error('Error fetching article ID by slug:', slugError);
      return { data: null, error: slugError };
    }
    
    if (!articleId) {
      return { data: null, error: new Error('Article not found') };
    }
    
    // Ensuite, récupérer les données complètes de l'article avec l'ID récupéré
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('id, title, content, excerpt, image_url, author, published, created_at, updated_at')
      .eq('id', articleId)
      .single();
    
    if (articleError) {
      console.error('Error fetching article details:', articleError);
      return { data: null, error: articleError };
    }
    
    // Récupérer les tags pour cet article avec une requête séparée
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
    
    // Récupérer les catégories pour cet article
    let categories: Category[] = [];
    const { data: categoryRelations, error: categoriesError } = await supabase
      .from('article_categories')
      .select('category_id')
      .eq('article_id', articleData.id);
      
    if (!categoriesError && categoryRelations && categoryRelations.length > 0) {
      const categoryIds = categoryRelations.map(relation => relation.category_id);
      
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, slug, description, created_at')
        .in('id', categoryIds);
        
      if (categoriesData) {
        categories = categoriesData as Category[];
      }
    }
    
    // Récupérer les détails de l'auteur avec une requête séparée
    let author: Author | null = null;
    if (articleData.author && typeof articleData.author === 'string') {
      const { data: authorData, error: authorError } = await supabase
        .from('authors')
        .select('id, name, bio, avatar_url, email, created_at, updated_at')
        .eq('id', articleData.author)
        .single();
      
      if (!authorError && authorData) {
        author = authorData as Author;
      }
    }
    
    // Construire l'objet final de l'article avec des propriétés explicites
    const article: Article = {
      id: articleData.id,
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt || '',
      image_url: articleData.image_url || '',
      category: categories.length > 0 ? categories[0].name : '', 
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

// Récupérer les articles liés
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
    
    // Transformer les données en type Article avec des valeurs par défaut
    const articles: Article[] = await Promise.all(
      relatedArticlesData.map(async (data) => {
        // Générer un slug à partir du titre
        const generatedSlug = data.title ? 
          data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 
          `article-${data.id}`;
        
        // Récupérer les catégories pour cet article
        const { data: categoryRelations } = await supabase
          .from('article_categories')
          .select('category_id')
          .eq('article_id', data.id);
        
        let categoryName = '';
        
        if (categoryRelations && categoryRelations.length > 0) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('name')
            .eq('id', categoryRelations[0].category_id)
            .single();
            
          if (categoryData) {
            categoryName = categoryData.name;
          }
        }
        
        return {
          id: data.id,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || '',
          image_url: data.image_url || '',
          category: categoryName,
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
      })
    );
    
    return { data: articles, error: null };
  } catch (error) {
    console.error('Unexpected error in getRelatedArticles:', error);
    return { data: null, error };
  }
}

// Récupérer toutes les catégories
export async function getAllCategories(): Promise<{ data: Category[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error };
    }
    
    return { data: data as Category[], error: null };
  } catch (error) {
    console.error('Unexpected error in getAllCategories:', error);
    return { data: null, error };
  }
}

// Ajouter ou mettre à jour une catégorie
export async function saveCategory(category: Partial<Category>): Promise<{ data: Category | null; error: any }> {
  try {
    let result;
    
    if (category.id) {
      // Mise à jour d'une catégorie existante
      result = await supabase
        .from('categories')
        .update({
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: category.parent_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id)
        .select();
    } else {
      // Création d'une nouvelle catégorie
      result = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug || category.name?.toLowerCase().replace(/\s+/g, '-'),
          description: category.description,
          parent_id: category.parent_id
        })
        .select();
    }
    
    const { data, error } = result;
    
    if (error) {
      throw error;
    }
    
    return { data: data[0] as Category, error: null };
  } catch (error) {
    console.error('Error in saveCategory:', error);
    return { data: null, error };
  }
}

// Supprimer une catégorie avec vérification
export async function deleteCategory(categoryId: string): Promise<{ success: boolean; error: Error | string | null }> {
  try {
    // Vérifier si la catégorie est utilisée par des articles
    const { data: usedByArticles, error: checkError } = await supabase
      .from('article_categories')
      .select('article_id')
      .eq('category_id', categoryId);
      
    if (checkError) {
      throw checkError;
    }
    
    if (usedByArticles && usedByArticles.length > 0) {
      return { 
        success: false, 
        error: new Error(`Cette catégorie est utilisée par ${usedByArticles.length} article(s) et ne peut pas être supprimée.`) 
      };
    }
    
    // Vérifier si la catégorie a des enfants
// @ts-ignore - Contournement temporaire de l'erreur TS2589 
    const { data: childCategories, error: childCheckError } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId);
      
    if (childCheckError) {
      throw childCheckError;
    }
    
    if (childCategories && childCategories.length > 0) {
      return {
        success: false,
        error: new Error(`Cette catégorie a ${childCategories.length} sous-catégorie(s) et ne peut pas être supprimée.`)
      };
    }
    
    // Supprimer la catégorie
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return { success: false, error };
  }
}

// Function to organize categories in a hierarchy
export function organizeCategoriesHierarchy(
  categories: CategoryBase[]
): CategoryNode[] {
  // Create a map to store all categories by their ID
  const categoryMap: Record<string, CategoryNode> = {};
  
  // Create an array to store root categories
  const rootCategories: CategoryNode[] = [];

  // First pass: populate the map with all categories, each with an empty children array
  categories.forEach(category => {
    categoryMap[category.id] = {
      ...category,
      children: [] // Initialize with empty array for all categories
    };
  });

  // Second pass: build the hierarchy
  categories.forEach(category => {
    const categoryNode = categoryMap[category.id];
    
    // If the category has a parent and the parent exists in our map
    if (category.parent_id && categoryMap[category.parent_id]) {
      // Add this category as a child of its parent
      categoryMap[category.parent_id].children.push(categoryNode);
    } else {
      // This is a root category
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
}

// Sauvegarder un article (création ou mise à jour)
export async function saveArticle(article: Partial<Article>): Promise<{ data: Article | null; error: any }> {
  try {
    let articleId = article.id;
    
    // Préparer les données pour Supabase
    const supabaseData = {
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || (article.content && article.content.substring(0, 150) + '...'),
      image_url: article.image_url,
      published: article.published || false,
      updated_at: new Date().toISOString(),
      slug: article.slug || article.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      tags: article.tags ? article.tags.map(tag => tag.name) : []
    };
    
    let result;
    
    if (articleId) {
      // Mise à jour d'un article existant
      result = await supabase
        .from('articles')
        .update(supabaseData)
        .eq('id', articleId)
        .select();
    } else {
      // Création d'un nouvel article
      result = await supabase
        .from('articles')
        .insert(supabaseData)
        .select();
    }
    
    const { data, error } = result;
    
    if (error) {
      throw error;
    }
    
    // Récupérer l'ID de l'article créé ou mis à jour
    articleId = data[0].id;
    
    // Gérer les catégories si spécifiées
    if (article.category) {
      // Chercher si la catégorie existe déjà
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', article.category)
        .single();
        
      if (categoryError && categoryError.code !== 'PGRST116') {  // PGRST116 signifie "no rows returned"
        console.error('Error finding category:', categoryError);
      }
      
      let categoryId;
      
      if (!categoryData) {
        // Créer la catégorie si elle n'existe pas
        const slug = article.category.toLowerCase().replace(/\s+/g, '-');
        const { data: newCategory, error: createError } = await supabase
          .from('categories')
          .insert({
            name: article.category,
            slug: slug
          })
          .select();
          
        if (createError) {
          console.error('Error creating category:', createError);
        } else {
          categoryId = newCategory[0].id;
        }
      } else {
        categoryId = categoryData.id;
      }
      
      if (categoryId) {
        // Supprimer les anciennes relations de catégorie
        await supabase
          .from('article_categories')
          .delete()
          .eq('article_id', articleId);
          
        // Ajouter la nouvelle relation
        await supabase
          .from('article_categories')
          .insert({
            article_id: articleId,
            category_id: categoryId
          });
      }
    }
    
    // Transformer l'article pour le retour
    return { data: transformArticleData(data[0]), error: null };
  } catch (error) {
    console.error('Error in saveArticle:', error);
    return { data: null, error };
  }
}

// Supprimer un article
export async function deleteArticle(articleId: string): Promise<{ success: boolean; error: any }> {
  try {
    // Supprimer les relations avec les catégories
    const { error: relError } = await supabase
      .from('article_categories')
      .delete()
      .eq('article_id', articleId);
      
    if (relError) {
      console.error('Error deleting article-category relations:', relError);
    }
    
    // Supprimer l'article
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteArticle:', error);
    return { success: false, error };
  }
}

// Récupérer tous les articles
export async function getAllArticles(): Promise<{ data: Article[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // Transformer les données pour correspondre au type Article
    const transformedArticles = data.map(transformArticleData);
    
    return { data: transformedArticles, error: null };
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return { data: null, error };
  }
}

// Vérifier si un slug d'article est déjà utilisé
export async function isSlugAvailable(slug: string, ignoreId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('articles')
      .select('id')
      .eq('slug', slug);
      
    if (ignoreId) {
      query = query.neq('id', ignoreId);
    }
    
    const { data } = await query;
    
    return !(data && data.length > 0);
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }
}

// Générer un slug unique basé sur un titre
export async function generateUniqueSlug(title: string, articleId?: string): Promise<string> {
  const baseSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  if (await isSlugAvailable(baseSlug, articleId)) {
    return baseSlug;
  }
  
  // Ajouter un nombre aléatoire si le slug est déjà pris
  let uniqueSlug = '';
  let counter = 1;
  
  do {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  } while (!(await isSlugAvailable(uniqueSlug, articleId)) && counter < 100);
  
  return uniqueSlug;
}
