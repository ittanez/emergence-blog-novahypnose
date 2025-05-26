
import { supabase } from '@/integrations/supabase/client';
import { Article, Author, Category, Tag, CategoryBase, CategoryNode } from '../types';

// Fonction utilitaire pour nettoyer le HTML
function stripHtml(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

// Fonction utilitaire pour calculer le temps de lecture
function calculateReadTime(content: string): number {
  const cleanText = stripHtml(content);
  const wordsPerMinute = 200;
  const wordCount = cleanText.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// Fonction pour générer un slug propre
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
    .replace(/^-|-$/g, ''); // Supprimer les tirets en début et fin
}

// Transformation des données d'un article récupéré de Supabase
export const transformArticleData = (data: any): Article => {
  const readTime = calculateReadTime(data.content || '');
  const cleanExcerpt = data.excerpt ? stripHtml(data.excerpt) : stripHtml(data.content || '').substring(0, 150) + '...';
  
  // Générer un slug propre si nécessaire
  const cleanSlug = data.slug ? generateSlugFromTitle(data.slug) : generateSlugFromTitle(data.title || '');
  
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    excerpt: cleanExcerpt,
    image_url: data.image_url || "",
    seo_description: "",
    keywords: [],
    category: data.category || "",
    author_id: data.author || "", // Using 'author' field from database
    slug: cleanSlug,
    read_time: readTime,
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

// Récupérer un article par son ID
export async function getArticleById(id: string): Promise<{ data: Article | null; error: any }> {
  try {
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (articleError) {
      console.error('Error fetching article details:', articleError);
      return { data: null, error: articleError };
    }
    
    if (!articleData) {
      return { data: null, error: new Error('Article not found') };
    }
    
    // Transformer les données en type Article
    const article = transformArticleData(articleData);
    
    return { data: article, error: null };
  } catch (error) {
    console.error('Unexpected error in getArticleById:', error);
    return { data: null, error };
  }
}

// Récupérer un article par son slug
export async function getArticleBySlug(slug: string): Promise<{ data: Article | null; error: any }> {
  try {
    console.log('=== getArticleBySlug START ===');
    console.log('Recherche article avec slug:', slug);
    console.log('Type du slug:', typeof slug);
    console.log('Longueur du slug:', slug.length);
    
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
    
    console.log('Requête Supabase terminée');
    console.log('Data reçue:', articleData);
    console.log('Erreur reçue:', articleError);
    
    if (articleError) {
      console.error('Error fetching article by slug:', articleError);
      console.error('Error code:', articleError.code);
      console.error('Error message:', articleError.message);
      return { data: null, error: articleError };
    }
    
    if (!articleData) {
      console.log('Aucun article trouvé avec ce slug');
      
      // Vérifier s'il y a des articles avec des slugs similaires
      const { data: similarArticles } = await supabase
        .from('articles')
        .select('slug, title')
        .eq('published', true)
        .limit(5);
      
      console.log('Articles similaires disponibles:', similarArticles);
      
      return { data: null, error: new Error('Article not found') };
    }
    
    console.log('Article trouvé:', articleData.title);
    console.log('Slug de l\'article trouvé:', articleData.slug);
    
    // Récupérer les tags pour cet article
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
    
    // Récupérer les détails de l'auteur
    let author: Author | null = null;
    if (articleData.author) { // Using 'author' field instead of 'author_id'
      const { data: authorData, error: authorError } = await supabase
        .from('authors')
        .select('id, name, bio, avatar_url, email, created_at, updated_at')
        .eq('id', articleData.author) // Using 'author' field
        .single();
      
      if (!authorError && authorData) {
        author = authorData as Author;
      }
    }
    
    // Transformer les données
    const article = transformArticleData({
      ...articleData,
      tags,
      author
    });
    
    console.log('Article final transformé:', article.title);
    console.log('=== getArticleBySlug END ===');
    
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
      .select('id, title, content, excerpt, image_url, author, published, created_at, updated_at, category')
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
    const articles: Article[] = relatedArticlesData.map((data) => {
      // Générer un slug à partir du titre
      const generatedSlug = data.title ? 
        data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 
        `article-${data.id}`;
      
      const readTime = calculateReadTime(data.content || '');
      const cleanExcerpt = data.excerpt ? stripHtml(data.excerpt) : stripHtml(data.content || '').substring(0, 150) + '...';
      
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        excerpt: cleanExcerpt,
        image_url: data.image_url || '',
        category: data.category || '',
        author_id: typeof data.author === 'string' ? data.author : '',
        slug: generatedSlug,
        read_time: readTime,
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
      .from('articles')
      .select('id')
      .eq('category', categoryId);
      
    if (checkError) {
      throw checkError;
    }
    
    if (usedByArticles && usedByArticles.length > 0) {
      return { 
        success: false, 
        error: new Error(`Cette catégorie est utilisée par ${usedByArticles.length} article(s) et ne peut pas être supprimée.`) 
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
    
    // Calculer le temps de lecture si le contenu est fourni
    const readTime = article.content ? calculateReadTime(article.content) : 0;
    const cleanExcerpt = article.excerpt ? stripHtml(article.excerpt) : (article.content ? stripHtml(article.content).substring(0, 150) + '...' : '');
    
    // Générer un slug propre
    const cleanSlug = article.slug ? generateSlugFromTitle(article.slug) : generateSlugFromTitle(article.title || '');
    
    // Préparer les données pour Supabase
    const supabaseData = {
      title: article.title,
      content: article.content,
      excerpt: cleanExcerpt,
      image_url: article.image_url,
      published: article.published || false,
      updated_at: new Date().toISOString(),
      slug: cleanSlug,
      tags: article.tags ? article.tags.map(tag => (typeof tag === 'string') ? tag : tag.name) : [],
      category: article.category || '', // Stocker directement le nom de la catégorie
      author: article.author_id || '' // Using 'author' field in database
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
    
    // Vérifier/créer la catégorie si spécifiée
    if (article.category) {
      console.log("Vérification de la catégorie:", article.category);
      
      // Chercher si la catégorie existe déjà
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', article.category)
        .single();
        
      if (categoryError && categoryError.code !== 'PGRST116') {  // PGRST116 signifie "no rows returned"
        console.error('Erreur lors de la recherche de la catégorie:', categoryError);
      }
      
      if (!categoryData) {
        console.log("La catégorie n'existe pas, création d'une nouvelle catégorie");
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
          console.error('Erreur lors de la création de la catégorie:', createError);
        } else if (newCategory && newCategory.length > 0) {
          console.log("Nouvelle catégorie créée avec l'ID:", newCategory[0].id);
        }
      } else {
        console.log("Catégorie existante trouvée avec l'ID:", categoryData.id);
      }
    }
    
    // Transformer l'article pour le retour avec le bon temps de lecture
    const transformedData = {
      ...data[0],
      read_time: readTime,
      excerpt: cleanExcerpt
    };
    
    return { data: transformArticleData(transformedData), error: null };
  } catch (error) {
    console.error('Error in saveArticle:', error);
    return { data: null, error };
  }
}

// Supprimer un article
export async function deleteArticle(articleId: string): Promise<{ success: boolean; error: any }> {
  try {
    // Supprimer les relations avec les tags
    const { error: relError } = await supabase
      .from('article_tags')
      .delete()
      .eq('article_id', articleId);
      
    if (relError) {
      console.error('Error deleting article-tag relations:', relError);
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

// Récupérer tous les articles avec filtres et recherche
export async function getAllArticles(filters?: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Article[] | null; error: any; totalCount?: number }> {
  try {
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' });
    
    // Appliquer les filtres
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    // Pagination
    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }
    
    // Tri par date de création (plus récent en premier)
    query = query.order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
      
    if (error) {
      throw error;
    }
    
    // Transformer les données pour correspondre au type Article
    const transformedArticles = data ? data.map(transformArticleData) : [];
    
    return { data: transformedArticles, error: null, totalCount: count || 0 };
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
  const baseSlug = generateSlugFromTitle(title);
  
  if (await isSlugAvailable(baseSlug, articleId)) {
    return baseSlug;
  }
  
  // Ajouter un nombre si le slug est déjà pris
  let uniqueSlug = '';
  let counter = 1;
  
  do {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  } while (!(await isSlugAvailable(uniqueSlug, articleId)) && counter < 100);
  
  return uniqueSlug;
}
