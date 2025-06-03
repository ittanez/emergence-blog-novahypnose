 // src/lib/services/articleService.ts - VERSION COMPLÈTE

import { createClient } from '@supabase/supabase-js';
import { Article } from '@/lib/types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// ========================
// 📂 GESTION DES CATÉGORIES
// ========================

/**
 * 📂 RÉCUPÈRE TOUTES LES CATÉGORIES
 */
export const getAllCategories = async () => {
  try {
    console.log("📂 Récupération de toutes les catégories");
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("❌ Erreur Supabase catégories:", error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} catégories récupérées`);
    
    return {
      data: data || [],
      error: null
    };

  } catch (error: any) {
    console.error("💥 Erreur dans getAllCategories:", error);
    
    return {
      data: [],
      error: error.message || 'Erreur lors de la récupération des catégories'
    };
  }
};

/**
 * 📂 CRÉE UNE NOUVELLE CATÉGORIE
 */
export const createCategory = async (categoryData: {
  name: string;
  description?: string;
  slug?: string;
}) => {
  try {
    const slug = categoryData.slug || categoryData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryData.name,
        description: categoryData.description || '',
        slug,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Erreur lors de la création de la catégorie'
    };
  }
};

// ========================
// 📰 GESTION DES ARTICLES
// ========================

/**
 * 📰 RÉCUPÈRE TOUS LES ARTICLES AVEC PAGINATION
 */
export const getAllArticles = async (options?: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  includeDrafts?: boolean;
  publishedOnly?: boolean;
  orderBy?: 'created_at' | 'updated_at' | 'title';
  orderDirection?: 'asc' | 'desc';
}) => {
  try {
    console.log("📰 Récupération des articles avec pagination");
    
    const {
      search = '',
      category = '',
      page = 1,
      limit = 10,
      includeDrafts = false,
      publishedOnly = false,
      orderBy = 'created_at',
      orderDirection = 'desc'
    } = options || {};

    // Construction de la requête de base
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        excerpt,
        slug,
        author,
        image_url,
        published,
        featured,
        categories,
        tags,
        keywords,
        read_time,
        created_at,
        updated_at,
        scheduled_for,
        meta_description,
        seo_description
      `, { count: 'exact' });

    // 📝 FILTRES DE PUBLICATION
    if (publishedOnly) {
      query = query.eq('published', true);
    } else if (!includeDrafts) {
      query = query.eq('published', true);
    }

    // 🔍 FILTRE DE RECHERCHE TEXTUELLE
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // 📂 FILTRE PAR CATÉGORIE
    if (category.trim()) {
      query = query.contains('categories', [category]);
    }

    // 📊 TRI
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // 📄 PAGINATION
    const startRange = (page - 1) * limit;
    const endRange = startRange + limit - 1;
    query = query.range(startRange, endRange);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      throw error;
    }

    if (!data) {
      console.log("⚠️ Aucun article trouvé");
      return {
        data: [],
        error: null,
        totalCount: 0
      };
    }

    // 🔄 TRANSFORMATION DES DONNÉES
    const transformedArticles = data.map(article => ({
      ...article,
      meta_description: article.meta_description || article.seo_description || '',
      seo_description: article.seo_description || article.meta_description || '',
      excerpt: article.excerpt || '',
      tags: article.tags || [],
      keywords: article.keywords || [],
      categories: article.categories || [],
      read_time: article.read_time || 1
    }));

    console.log(`✅ ${transformedArticles.length} articles récupérés (page ${page})`);

    return {
      data: transformedArticles,
      error: null,
      totalCount: count || 0
    };

  } catch (error: any) {
    console.error("💥 Erreur dans getAllArticles:", error);
    
    return {
      data: [],
      error: error.message || 'Erreur lors de la récupération des articles',
      totalCount: 0
    };
  }
};

/**
 * 🔍 RÉCUPÈRE TOUS LES ARTICLES SANS PAGINATION
 */
export const getAllArticlesNoPagination = async (options?: {
  search?: string;
  category?: string;
  publishedOnly?: boolean;
  featured?: boolean;
  orderBy?: 'created_at' | 'updated_at' | 'title';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
}) => {
  try {
    console.log("🔍 Récupération de tous les articles sans pagination");
    
    const {
      search = '',
      category = '',
      publishedOnly = true,
      featured,
      orderBy = 'created_at',
      orderDirection = 'desc',
      limit
    } = options || {};

    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        excerpt,
        slug,
        author,
        image_url,
        published,
        featured,
        categories,
        tags,
        keywords,
        read_time,
        created_at,
        updated_at,
        scheduled_for,
        meta_description,
        seo_description
      `);

    // 📝 FILTRES DE PUBLICATION
    if (publishedOnly) {
      query = query.eq('published', true);
    }

    // ⭐ FILTRE ARTICLES EN VEDETTE
    if (typeof featured === 'boolean') {
      query = query.eq('featured', featured);
    }

    // 🔍 FILTRE DE RECHERCHE
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // 📂 FILTRE PAR CATÉGORIE
    if (category.trim()) {
      query = query.contains('categories', [category]);
    }

    // 📊 TRI
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // 🔢 LIMITE OPTIONNELLE
    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      throw error;
    }

    const transformedArticles = (data || []).map(article => ({
      ...article,
      meta_description: article.meta_description || article.seo_description || '',
      seo_description: article.seo_description || article.meta_description || '',
      excerpt: article.excerpt || '',
      tags: article.tags || [],
      keywords: article.keywords || [],
      categories: article.categories || [],
      read_time: article.read_time || 1
    }));

    console.log(`✅ ${transformedArticles.length} articles récupérés sans pagination`);

    return {
      data: transformedArticles,
      error: null,
      totalCount: transformedArticles.length
    };

  } catch (error: any) {
    console.error("💥 Erreur dans getAllArticlesNoPagination:", error);
    
    return {
      data: [],
      error: error.message || 'Erreur lors de la récupération des articles',
      totalCount: 0
    };
  }
};

/**
 * 🔍 RÉCUPÈRE UN ARTICLE PAR ID
 */
export const getArticleById = async (id: string) => {
  try {
    console.log("🔍 Recherche article par ID:", id);
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        article_tags (
          tag:tags (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Article non trouvé');
      }
      throw error;
    }
    
    if (!data) {
      throw new Error('Article non trouvé');
    }
    
    // 🔄 TRANSFORMATION DES TAGS
    const tags = data.article_tags?.map((at: any) => at.tag) || [];
    
    const article = {
      ...data,
      tags: tags,
      meta_description: data.meta_description || data.seo_description || '',
      seo_description: data.seo_description || data.meta_description || '',
      keywords: data.keywords || [],
      categories: data.categories || []
    };
    
    console.log("✅ Article récupéré:", article.title);
    
    return { data: article, error: null };
    
  } catch (error: any) {
    console.error("Erreur récupération article:", error);
    return {
      data: null,
      error: error.message || 'Erreur lors de la récupération de l\'article'
    };
  }
};

/**
 * 💾 SAUVEGARDE UN ARTICLE
 */
export const saveArticle = async (article: Partial<Article>) => {
  try {
    console.log("🔄 Début sauvegarde article:", article.title);
    
    // 🎯 NETTOYAGE ET VALIDATION DES DONNÉES
    const cleanArticle = {
      title: article.title?.trim() || '',
      content: article.content || '',
      slug: article.slug?.trim() || '',
      author: article.author || 'Administrateur',
      
      // === CHAMPS SEO NETTOYÉS ===
      excerpt: article.excerpt?.trim() || '',
      seo_description: article.seo_description?.trim() || article.meta_description?.trim() || '',
      meta_description: article.meta_description?.trim() || '',
      
      // === TABLEAUX NETTOYÉS ===
      categories: Array.isArray(article.categories) ? article.categories.filter(Boolean) : [],
      
      // 🏷️ CONVERSION TAGS EN STRINGS
      tags: Array.isArray(article.tags) 
        ? article.tags.map(tag => typeof tag === 'string' ? tag : tag.name).filter(Boolean)
        : [],
      
      // 🎯 KEYWORDS EN ARRAY DE STRINGS
      keywords: Array.isArray(article.keywords) ? article.keywords.filter(Boolean) : [],
      
      // === MÉTADONNÉES ===
      image_url: article.image_url || null,
      read_time: article.read_time || 1,
      
      // === PUBLICATION ===
      published: Boolean(article.published),
      featured: Boolean(article.featured),
      scheduled_for: article.scheduled_for || null,
      
      // === TIMESTAMPS ===
      updated_at: new Date().toISOString()
    };

    // 🔍 VALIDATION OBLIGATOIRE
    if (!cleanArticle.title) {
      throw new Error('Le titre est obligatoire');
    }
    
    if (!cleanArticle.content) {
      throw new Error('Le contenu est obligatoire');
    }
    
    if (!cleanArticle.slug) {
      // Auto-génération du slug si manquant
      cleanArticle.slug = cleanArticle.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    let result;
    
    if (article.id) {
      // 🔄 MISE À JOUR ARTICLE EXISTANT
      console.log("✏️ Mise à jour article:", article.id);
      
      result = await supabase
        .from('articles')
        .update(cleanArticle)
        .eq('id', article.id)
        .select('*')
        .single();
        
    } else {
      // ➕ CRÉATION NOUVEL ARTICLE
      console.log("➕ Création nouvel article");
      
      const newArticle = {
        ...cleanArticle,
        created_at: new Date().toISOString(),
        author_id: null
      };
      
      result = await supabase
        .from('articles')
        .insert(newArticle)
        .select('*')
        .single();
    }

    if (result.error) {
      console.error("❌ Erreur Supabase:", result.error);
      
      if (result.error.code === '23505') {
        throw new Error(`Un article avec ce slug existe déjà: ${cleanArticle.slug}`);
      }
      
      if (result.error.code === '23502') {
        throw new Error(`Champ obligatoire manquant: ${result.error.message}`);
      }
      
      if (result.error.code === '22001') {
        throw new Error('Un des champs dépasse la longueur maximale autorisée');
      }
      
      throw new Error(`Erreur base de données: ${result.error.message}`);
    }

    if (!result.data) {
      throw new Error('Aucune donnée retournée après la sauvegarde');
    }

    console.log("✅ Article sauvegardé avec succès:", result.data.id);
    
    return {
      data: result.data,
      error: null
    };

  } catch (error: any) {
    console.error("💥 Erreur dans saveArticle:", error);
    
    return {
      data: null,
      error: error.message || 'Erreur inconnue lors de la sauvegarde'
    };
  }
};

/**
 * 🗑️ SUPPRIME UN ARTICLE
 */
export const deleteArticle = async (id: string) => {
  try {
    console.log("🗑️ Suppression article:", id);
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    console.log("✅ Article supprimé avec succès");
    
    return { success: true, error: null };

  } catch (error: any) {
    console.error("💥 Erreur suppression article:", error);
    
    return {
      success: false,
      error: error.message || 'Erreur lors de la suppression'
    };
  }
};

/**
 * 🔧 GÉNÈRE UN SLUG UNIQUE
 */
export const generateUniqueSlug = async (title: string, excludeId?: string) => {
  try {
    let baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    if (!baseSlug) {
      baseSlug = 'article-' + Date.now();
    }
    
    // Vérifier l'unicité
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      let query = supabase
        .from('articles')
        .select('id')
        .eq('slug', slug);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Erreur vérification slug:", error);
        break;
      }
      
      if (!data) {
        break;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }
    
    return { slug, error: null };
    
  } catch (error: any) {
    console.error("Erreur génération slug:", error);
    return {
      slug: `article-${Date.now()}`,
      error: error.message
    };
  }
};

// ========================
// 🏠 FONCTIONS UTILITAIRES
// ========================

/**
 * 🏠 ARTICLES POUR LA PAGE D'ACCUEIL
 */
export const getHomePageArticles = async (limit: number = 6) => {
  return getAllArticlesNoPagination({
    publishedOnly: true,
    orderBy: 'created_at',
    orderDirection: 'desc',
    limit
  });
};

/**
 * ⭐ ARTICLES EN VEDETTE
 */
export const getFeaturedArticles = async (limit: number = 3) => {
  return getAllArticlesNoPagination({
    publishedOnly: true,
    featured: true,
    orderBy: 'created_at',
    orderDirection: 'desc',
    limit
  });
};

/**
 * 📂 ARTICLES PAR CATÉGORIE
 */
export const getArticlesByCategory = async (category: string, limit?: number) => {
  return getAllArticlesNoPagination({
    category,
    publishedOnly: true,
    orderBy: 'created_at',
    orderDirection: 'desc',
    limit
  });
};

/**
 * 🔍 RECHERCHE D'ARTICLES
 */
export const searchArticles = async (searchTerm: string, limit?: number) => {
  return getAllArticlesNoPagination({
    search: searchTerm,
    publishedOnly: true,
    orderBy: 'created_at',
    orderDirection: 'desc',
    limit
  });
};
