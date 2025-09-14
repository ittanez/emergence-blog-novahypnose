import { createClient } from '@supabase/supabase-js';
import { Article, Category } from '@/lib/types';
import { sanitizeData } from '@/lib/utils/textUtils';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Fonction pour synchroniser un article avec Firebase
const syncArticleToFirebase = async (article: any) => {
  try {
    console.log('🔥 Déclenchement synchronisation Firebase pour article:', article.slug);
    
    // Appel de la nouvelle edge function to_firebase
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/to_firebase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        article_id: article.id,
        // Données de fallback au cas où l'article ne serait pas trouvé
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content || '',
        image_url: article.image_url || article.storage_image_url || '',
        published_at: article.created_at || new Date().toISOString(),
        read_time: article.read_time || 5,
        categories: article.categories || ['general'],
        tags: article.tags || [],
        author: article.author || 'Novahypnose',
        keywords: article.keywords || [],
        seo_description: article.seo_description || article.excerpt || '',
        featured: article.featured || false
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Synchronisation Firebase réussie:', result.message);
      
      // Optionnel: Notification de succès
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('firebase-sync-success', {
          detail: { articleId: article.id, slug: article.slug, message: result.message }
        }));
      }
    } else {
      console.warn('⚠️ Échec synchronisation Firebase:', result.error || 'Erreur inconnue');
      
      // Optionnel: Notification d'erreur
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('firebase-sync-error', {
          detail: { articleId: article.id, error: result.error }
        }));
      }
    }
  } catch (error) {
    console.warn('⚠️ Erreur synchronisation Firebase:', error);
    
    // Ne pas faire échouer la sauvegarde si Firebase échoue
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('firebase-sync-error', {
        detail: { articleId: article.id, error: error.message }
      }));
    }
  }
};

// Fonction pour récupérer tous les articles avec pagination
export const getAllArticles = async (page: number = 1, pageSize: number = 10) => {
  const startIndex = (page - 1) * pageSize;

  try {
    const { data, error, count } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + pageSize - 1);

    if (error) {
      throw error;
    }

    // Nettoyer les données avant de les retourner
    const sanitizedData = data ? data.map(article => sanitizeData(article)) : null;
    return { data: sanitizedData, error: null, count };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des articles:", error);
    return { data: null, error, count: 0 };
  }
};

// Fonction pour récupérer tous les articles sans pagination
export const getAllArticlesNoPagination = async () => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des articles:", error);
    return { data: null, error };
  }
};

// Fonction pour récupérer un article par son ID
export const getArticleById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Erreur lors de la récupération de l'article:", error);
    return { data: null, error };
  }
};

// Fonction pour récupérer un article par son slug
export const getArticleBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      // Vérifier si l'erreur est due à une redirection
      if (error.message.includes('redirect')) {
        const redirectSlug = error.message.split('redirect:')[1].trim();
        return { data: null, error: null, redirect: { from: slug, to: redirectSlug } };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Erreur lors de la récupération de l'article:", error);
    return { data: null, error };
  }
};

// Fonction pour récupérer les articles populaires (par exemple, les plus récents)
export const getPopularArticles = async (limit: number = 3) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des articles populaires:", error);
    return { data: null, error };
  }
};

// Fonction pour récupérer les articles similaires (basé sur les tags ou catégories)
export const getRelatedArticles = async (articleId: string, limit: number = 3) => {
  try {
    // Récupérer l'article actuel pour obtenir ses tags ou catégories
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('tags, categories')
      .eq('id', articleId)
      .single();

    if (articleError) {
      throw articleError;
    }

    if (!article) {
      return { data: [], error: null }; // Retourner un tableau vide si l'article n'est pas trouvé
    }

    // Utiliser les tags ou catégories de l'article actuel pour trouver des articles similaires
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .neq('id', articleId) // Exclure l'article actuel
      .overlaps('tags', article.tags) // Filtrer par tags similaires
      .limit(limit);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des articles similaires:", error);
    return { data: null, error };
  }
};

// Fonction pour sauvegarder un article (création ou mise à jour)
export const saveArticle = async (article: Partial<Article>) => {
  try {
    if (article.id) {
      // Mise à jour d'un article existant
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          image_url: article.image_url,
          published: article.published,
          tags: article.tags,
          keywords: article.keywords,
          seo_description: article.seo_description,
          meta_description: article.meta_description,
          read_time: article.read_time,
          author: article.author,
          featured: article.featured,
          storage_image_url: article.storage_image_url,
          categories: article.categories,
          scheduled_for: article.scheduled_for,
        })
        .eq('id', article.id)
        .select()
        .single();

      if (error) throw error;
      
      // Synchroniser avec Firebase si l'article est publié
      if (data && article.published) {
        await syncArticleToFirebase(data);
      }
      
      return { data, error: null };
    } else {
      // Création d'un nouvel article
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          image_url: article.image_url,
          published: article.published,
          tags: article.tags,
          keywords: article.keywords,
          seo_description: article.seo_description,
          meta_description: article.meta_description,
          read_time: article.read_time,
          author: article.author,
          featured: article.featured,
          storage_image_url: article.storage_image_url,
          categories: article.categories,
          scheduled_for: article.scheduled_for,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Synchroniser avec Firebase si l'article est publié
      if (data && article.published) {
        await syncArticleToFirebase(data);
      }
      
      return { data, error: null };
    }
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde de l\'article:', error);
    return { data: null, error };
  }
};

// Fonction pour supprimer un article
export const deleteArticle = async (articleId: string) => {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    return { success: false, error };
  }
};

// Fonction pour générer un slug unique
export const generateUniqueSlug = async (title: string, existingId?: string): Promise<{ slug: string | null, error: any | null }> => {
  let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  let count = 0;
  let originalSlug = slug;

  try {
    while (true) {
      const { data, error, count: resultCount } = await supabase
        .from('articles')
        .select('id', { count: 'exact' })
        .eq('slug', slug);

      if (error) {
        console.error("Erreur lors de la vérification du slug:", error);
        return { slug: null, error };
      }

      if (data && data.length === 0) {
        return { slug, error: null };
      }

      if (existingId && data && data.length === 1 && data[0].id === existingId) {
        return { slug, error: null };
      }

      count++;
      slug = `${originalSlug}-${count}`;
    }
  } catch (error: any) {
    console.error("Erreur lors de la génération du slug unique:", error);
    return { slug: null, error };
  }
};

// Fonction pour récupérer toutes les catégories
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return { data: null, error };
  }
};

// ✅ AJOUTÉ : Fonction saveCategory manquante
export const saveCategory = async (category: Partial<Category>) => {
  try {
    if (category.id) {
      // Mise à jour d'une catégorie existante
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: category.parent_id
        })
        .eq('id', category.id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } else {
      // Création d'une nouvelle catégorie
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent_id: category.parent_id
        })
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    }
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde de la catégorie:', error);
    return { data: null, error };
  }
};

// ✅ AJOUTÉ : Fonction deleteCategory manquante
export const deleteCategory = async (categoryId: string) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return { success: false, error };
  }
};
