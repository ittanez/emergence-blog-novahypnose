 // articleService.ts - Version complète avec toutes les fonctions

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

// Fonction pour récupérer tous les articles
export async function getAllArticles(options: {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
} = {}) {
  try {
    const { page = 1, limit = 10, category, featured } = options;
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
        image_url,
        author,
        categories,
        tags,
        published,
        featured,
        created_at,
        updated_at,
        category,
        storage_image_url
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to);

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
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des articles:', error);
    return { data: null, error, pagination: null };
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

// Fonction pour récupérer les articles liés
export async function getRelatedArticles(articleId: string, limit: number = 3) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        image_url,
        created_at,
        categories,
        tags
      `)
      .eq('published', true)
      .neq('id', articleId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des articles liés:', error);
    return { data: null, error };
  }
}

// Fonction pour créer un nouvel article (slug auto-généré par le trigger)
export async function createArticle(articleData: any) {
  try {
    console.log("📝 Création nouvel article:", articleData.title);
    
    const { data, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single();

    if (data) {
      console.log("✅ Article créé avec slug:", data.slug);
    }

    return { data, error };
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'article:', error);
    return { data: null, error };
  }
}

// Fonction pour mettre à jour un article (slug regénéré si titre change)
export async function updateArticle(id: string, updates: any) {
  try {
    console.log("✏️ Mise à jour article:", id);
    
    const { data, error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (data && updates.title) {
      console.log("✅ Article mis à jour avec nouveau slug:", data.slug);
    }

    return { data, error };
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'article:', error);
    return { data: null, error };
  }
}

// Fonction pour supprimer un article
export async function deleteArticle(id: string) {
  try {
    console.log("🗑️ Suppression article:", id);
    
    const { data, error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (data) {
      console.log("✅ Article supprimé:", data.title);
    }

    return { data, error };
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'article:', error);
    return { data: null, error };
  }
}

// Fonction utilitaire pour tester la génération de slug
export async function generateSlugPreview(title: string) {
  try {
    const { data, error } = await supabase
      .rpc('generate_clean_slug', { title });

    return { slug: data, error };
  } catch (error) {
    console.error('❌ Erreur génération slug:', error);
    return { slug: null, error };
  }
}
