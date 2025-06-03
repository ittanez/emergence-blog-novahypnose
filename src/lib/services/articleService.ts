 // src/lib/services/articleService.ts - VERSION FINALE ADAPTÉE À VOTRE BASE

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

    // 🎯 REQUÊTE EXACTE SELON VOTRE STRUCTURE DB
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
        storage_image_url,
        published,
        featured,
        categories,
        category,
        tags,
        keywords,
        meta_description,
        created_at,
        updated_at,
        scheduled_for
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

    // 📂 FILTRE PAR CATÉGORIE (utilise le array categories)
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
    const transformedArticles = data.map(article => {
      // ⏱️ CALCUL AUTOMATIQUE DU TEMPS DE LECTURE
      const wordCount = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
      const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

      return {
        ...article,
        // 🔍 SEO: Utilise meta_description comme source unique
        meta_description: article.meta_description || '',
        seo_description: article.meta_description || '', // Alias pour compatibilité
        
        // 📋 ASSURER LES VALEURS PAR DÉFAUT
        excerpt: article.excerpt || '',
        tags: Array.isArray(article.tags) ? article.tags : [],
        keywords: Array.isArray(article.keywords) ? article.keywords : [],
        categories: Array.isArray(article.categories) ? article.categories : [],
        
        // ⏱️ TEMPS DE LECTURE CALCULÉ
        read_time: calculatedReadTime,
        
        // 🖼️ IMAGE: Priorise storage_image_url puis image_url
        image_url: article.storage_image_url || article.image_url || null
      };
    });

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
        storage_image_url,
        published,
        featured,
        categories,
        tags,
        keywords,
        meta_description,
        created_at,
        updated_at,
        scheduled_for
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

    const transformedArticles = (data || []).map(article => {
      // ⏱️ CALCUL AUTOMATIQUE DU TEMPS DE LECTURE
      const wordCount = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
      const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

      return {
        ...article,
        meta_description: article.meta_description || '',
        seo_description: article.meta_description || '',
        excerpt: article.excerpt || '',
        tags: Array.isArray(article.tags) ? article.tags : [],
        keywords: Array.isArray(article.keywords) ? article.keywords : [],
        categories: Array.isArray(article.categories) ? article.categories : [],
        read_time: calculatedReadTime,
        image_url: article.storage_image_url || article.image_url || null
      };
    });

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
      .select('*')
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
    
    // ⏱️ CALCUL AUTOMATIQUE DU TEMPS DE LECTURE
    const wordCount = (data.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
    const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
    
    const article = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : [],
      meta_description: data.meta_description || '',
      seo_description: data.meta_description || '',
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      read_time: calculatedReadTime,
      image_url: data.storage_image_url || data.image_url || null
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
 * 🔗 RÉCUPÈRE UN ARTICLE PAR SLUG
 */
export const getArticleBySlug = async (slug: string) => {
  try {
    console.log("🔗 Recherche article par slug:", slug);
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
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
    
    // ⏱️ CALCUL AUTOMATIQUE DU TEMPS DE LECTURE
    const wordCount = (data.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
    const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
    
    const article = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags : [],
      meta_description: data.meta_description || '',
      seo_description: data.meta_description || '',
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      categories: Array.isArray(data.categories) ? data.categories : [],
      excerpt: data.excerpt || '',
      read_time: calculatedReadTime,
      image_url: data.storage_image_url || data.image_url || null
    };
    
    console.log("✅ Article récupéré par slug:", article.title);
    
    return { data: article, error: null };
    
  } catch (error: any) {
    console.error("Erreur récupération article par slug:", error);
    return {
      data: null,
      error: error.message || 'Erreur lors de la récupération de l\'article'
    };
  }
};

/**
 * 🔗 RÉCUPÈRE LES ARTICLES LIÉS/SIMILAIRES
 */
export const getRelatedArticles = async (articleId: string, categories: string[] = [], limit: number = 3) => {
  try {
    console.log("🔗 Recherche articles liés pour:", articleId);
    
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        slug,
        author,
        image_url,
        storage_image_url,
        categories,
        tags,
        created_at,
        featured,
        content
      `)
      .eq('published', true)
      .neq('id', articleId)
      .order('created_at', { ascending: false })
      .limit(limit * 2);

    const { data, error } = await query;

    if (error) {
      console.error("❌ Erreur récupération articles liés:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("⚠️ Aucun article lié trouvé");
      return {
        data: [],
        error: null
      };
    }

    // 🎯 SCORING ET TRI PAR PERTINENCE
    const articlesWithScore = data.map(article => {
      let score = 0;
      
      // Score basé sur les catégories communes
      if (categories.length > 0 && Array.isArray(article.categories)) {
        const commonCategories = article.categories.filter(cat => categories.includes(cat));
        score += commonCategories.length * 10;
      }
      
      // Bonus pour les articles en vedette
      if (article.featured) {
        score += 5;
      }
      
      // Score basé sur la récence
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(article.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      score += Math.max(0, 30 - daysSinceCreation);

      // ⏱️ CALCUL AUTOMATIQUE DU TEMPS DE LECTURE
      const wordCount = (article.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
      const calculatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
      
      return {
        ...article,
        score,
        categories: Array.isArray(article.categories) ? article.categories : [],
        tags: Array.isArray(article.tags) ? article.tags : [],
        excerpt: article.excerpt || '',
        read_time: calculatedReadTime,
        image_url: article.storage_image_url || article.image_url || null
      };
    });

    // Trier par score décroissant
    const relatedArticles = articlesWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, content, ...article }) => article);

    console.log(`✅ ${relatedArticles.length} articles liés trouvés`);

    return {
      data: relatedArticles,
      error: null
    };

  } catch (error: any) {
    console.error("💥 Erreur dans getRelatedArticles:", error);
    
    return {
      data: [],
      error: error.message || 'Erreur lors de la récupération des articles liés'
    };
  }
};

/**
 * 💾 SAUVEGARDE UN ARTICLE
 */
export const saveArticle = async (article: Partial<Article>) => {
  try {
    console.log("🔄 Début sauvegarde article:", article.title);
    
    // 🎯 NETTOYAGE DES DONNÉES SELON VOTRE STRUCTURE
    const cleanArticle = {
      title: article.title?.trim() || '',
      content: article.content || '',
      slug: article.slug?.trim() || '',
      author: article.author || 'Administrateur',
      
      // === CHAMPS SEO ===
      excerpt: article.excerpt?.trim() || '',
      meta_description: article.meta_description?.trim() || '',
      
      // === ARRAYS PostgreSQL ===
      categories: Array.isArray(article.categories) ? article.categories.filter(Boolean) : [],
      tags: Array.isArray(article.tags) 
        ? article.tags.map(tag => typeof tag === 'string' ? tag : tag.name).filter(Boolean)
        : [],
      keywords: Array.isArray(article.keywords) ? article.keywords.filter(Boolean) : [],
      
      // === IMAGES ===
      image_url: article.image_url || null,
      storage_image_url: article.storage_image_url || null,
      
      // === PUBLICATION ===
      published: Boolean(article.published),
      featured: Boolean(article.featured),
      scheduled_for: article.scheduled_for || null,
      
      // === CATÉGORIE SIMPLE (pour compatibilité) ===
      category: Array.isArray(article.categories) && article.categories.length > 0 
        ? article.categories[0] 
        : null,
      
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
        created_at: new Date().toISOString()
      };
      
      result = await supabase
        .from('articles')
        .insert(newArticle)
        .select('*')
        .single();
    }

    if (result.error) {
      console.error("❌ Erreur Supabase:", result.error);
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
