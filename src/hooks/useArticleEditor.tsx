 // articleService.ts - Version finale avec gestion SEO complète

import { supabase } from './supabase';

// Interface pour le résultat avec redirection
interface ArticleResult {
  data: any;
  error: any;
  redirect?: {
    from: string;
    to: string;
    status: number;
  };
}

// Fonction principale avec gestion des redirections
export async function getArticleBySlug(slug: string): Promise<ArticleResult> {
  try {
    console.log("🔍 Recherche article avec slug:", slug);
    
    // Utiliser la fonction RPC qui gère automatiquement les redirections
    const { data, error } = await supabase
      .rpc('get_article_by_slug', { input_slug: slug });

    if (error) {
      console.error('❌ Erreur RPC get_article_by_slug:', error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      console.log("❌ Article non trouvé pour le slug:", slug);
      return { data: null, error: { message: 'Article non trouvé' } };
    }

    const article = data[0]; // RPC retourne un array

    // Gérer les redirections
    if (article.is_redirect) {
      console.log(`🔄 Redirection détectée: ${slug} → ${article.canonical_slug}`);
      
      return {
        data: article,
        error: null,
        redirect: {
          from: slug,
          to: article.canonical_slug,
          status: 301 // Redirection permanente
        }
      };
    }

    console.log("✅ Article trouvé directement:", article.title);
    return { data: article, error: null };

  } catch (error) {
    console.error('💥 Erreur inattendue dans getArticleBySlug:', error);
    return { data: null, error };
  }
}

// 🎯 FONCTION MISE À JOUR : Récupérer un article par ID avec tous les champs SEO
export async function getArticleById(id: string) {
  try {
    console.log("🔍 Recherche article par ID:", id);
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        slug,
        excerpt,
        seo_description,
        meta_description,
        image_url,
        storage_image_url,
        author,
        categories,
        tags,
        keywords,
        published,
        featured,
        created_at,
        updated_at,
        category,
        scheduled_for,
        read_time
      `)
      .eq('id', id)
      .single();

    return { data, error };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'article par ID:', error);
    return { data: null, error };
  }
}

// ✅ FONCTION CORRIGÉE : Récupérer tous les articles avec options complètes
export async function getAllArticles(options: {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  includeDrafts?: boolean;
  search?: string;
} = {}) {
  try {
    const { page = 1, limit = 10, category, featured, includeDrafts = false, search } = options;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        slug,
        excerpt,
        seo_description,
        meta_description,
        image_url,
        storage_image_url,
        author,
        categories,
        tags,
        keywords,
        published,
        featured,
        created_at,
        updated_at,
        category,
        read_time
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Filtrage par statut published
    if (!includeDrafts) {
      query = query.eq('published', true);
    }

    // Recherche par texte
    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    if (category) {
      query = query.contains('categories', [category]);
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }

    const { data, error, count } = await query;

    return {
      data,
      error,
      totalCount: count,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des articles:', error);
    return { data: null, error, totalCount: 0, pagination: null };
  }
}

// ✅ NOUVELLE FONCTION : Récupérer TOUS les articles publiés sans pagination
export async function getAllArticlesNoPagination() {
  try {
    console.log("🔍 Récupération de TOUS les articles publiés...");
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        slug,
        excerpt,
        seo_description,
        meta_description,
        image_url,
        storage_image_url,
        author,
        categories,
        tags,
        keywords,
        published,
        featured,
        created_at,
        updated_at,
        category,
        read_time
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    console.log(`✅ ${data?.length || 0} articles récupérés`);
    return { data, error };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de tous les articles:', error);
    return { data: null, error };
  }
}

// Fonction pour récupérer toutes les catégories
export async function getAllCategories() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('categories')
      .eq('published', true);

    if (error) {
      console.error('❌ Erreur lors de la récupération des catégories:', error);
      return { data: null, error };
    }

    // Extraire toutes les catégories uniques
    const allCategories = data
      .flatMap(article => article.categories || [])
      .filter((category, index, array) => array.indexOf(category) === index)
      .sort();

    return { data: allCategories, error: null };
  } catch (error) {
    console.error('❌ Erreur inattendue dans getAllCategories:', error);
    return { data: null, error };
  }
}

// Fonction
