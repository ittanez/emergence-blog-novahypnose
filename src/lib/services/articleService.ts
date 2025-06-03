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
        tags,
        keywords
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

// 🎯 FONCTION PRINCIPALE MISE À JOUR : Sauvegarder un article avec gestion SEO complète
export async function saveArticle(articleData: any) {
  try {
    console.log("💾 Sauvegarde article avec données SEO:", {
      title: articleData.title,
      excerpt_length: articleData.excerpt?.length || 0,
      meta_description_length: articleData.meta_description?.length || 0,
      keywords_count: articleData.keywords?.length || 0,
      tags_count: articleData.tags?.length || 0
    });

    if (articleData.id) {
      // Update existant
      console.log("✏️ Mise à jour article:", articleData.id);
      return await updateArticle(articleData.id, articleData);
    } else {
      // Création nouveau
      console.log("📝 Création nouvel article:", articleData.title);
      return await createArticle(articleData);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de l\'article:', error);
    return { data: null, error };
  }
}

// Fonction pour générer un slug unique
export async function generateUniqueSlug(title: string, excludeId?: string) {
  try {
    const baseSlug = await generateSlugPreview(title);
    if (baseSlug.error) {
      return baseSlug;
    }

    let finalSlug = baseSlug.slug;
    let counter = 1;

    // Vérifier l'unicité
    while (true) {
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', finalSlug)
        .neq('id', excludeId || '')
        .single();

      if (!existing) {
        // Slug disponible
        break;
      }

      // Slug déjà pris, essayer avec un suffixe
      finalSlug = `${baseSlug.slug}-${counter}`;
      counter++;
    }

    return { slug: finalSlug, error: null };
  } catch (error) {
    console.error('❌ Erreur génération slug unique:', error);
    return { slug: null, error };
  }
}

// 🎯 FONCTION MISE À JOUR : Créer un nouvel article avec gestion SEO
export async function createArticle(articleData: any) {
  try {
    console.log("📝 Création nouvel article:", articleData.title);
    
    // 🧹 Nettoyer et valider les données avant insertion
    const cleanedData = {
      title: articleData.title,
      content: articleData.content,
      slug: articleData.slug,
      author: articleData.author || 'Administrateur',
      
      // === CHAMPS SEO ===
      excerpt: articleData.excerpt || '',
      seo_description: articleData.seo_description || articleData.meta_description || '',
      meta_description: articleData.meta_description || '',
      
      // === ORGANISATION ===
      categories: articleData.categories || [],
      tags: articleData.tags || [],
      keywords: articleData.keywords || [],
      
      // === IMAGES ===
      image_url: articleData.image_url,
      storage_image_url: articleData.storage_image_url,
      
      // === PUBLICATION ===
      published: articleData.published || false,
      featured: articleData.featured || false,
      scheduled_for: articleData.scheduled_for,
      
      // === MÉTADONNÉES ===
      read_time: articleData.read_time || 1,
      category: articleData.category
    };
    
    console.log("📊 Données nettoyées pour insertion:", {
      excerpt_length: cleanedData.excerpt.length,
      meta_description_length: cleanedData.meta_description?.length || 0,
      keywords_count: cleanedData.keywords.length,
      tags_count: cleanedData.tags.length
    });
    
    const { data, error } = await supabase
      .from('articles')
      .insert([cleanedData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la création:', error);
      
      // 🚨 Gestion des erreurs de colonnes manquantes
      if (error.message.includes('meta_description') || error.message.includes('keywords')) {
        console.log('⚠️ Colonnes SEO manquantes, tentative avec données de base...');
        
        // Retirer les nouveaux champs et réessayer
        const { meta_description, keywords, ...basicData } = cleanedData;
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('articles')
          .insert([basicData])
          .select()
          .single();
          
        if (fallbackError) throw fallbackError;
        
        console.log('⚠️ Article créé sans les champs SEO avancés');
        return { data: fallbackData, error: null };
      }
      
      throw error;
    }

    if (data) {
      console.log("✅ Article créé avec slug:", data.slug);
    }

    return { data, error };
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'article:', error);
    return { data: null, error };
  }
}

// 🎯 FONCTION MISE À JOUR : Mettre à jour un article avec gestion SEO
export async function updateArticle(id: string, updates: any) {
  try {
    console.log("✏️ Mise à jour article:", id);
    
    // 🧹 Nettoyer et valider les données avant mise à jour
    const cleanedUpdates = {
      title: updates.title,
      content: updates.content,
      slug: updates.slug,
      author: updates.author,
      
      // === CHAMPS SEO ===
      excerpt: updates.excerpt || '',
      seo_description: updates.seo_description || updates.meta_description || '',
      meta_description: updates.meta_description || '',
      
      // === ORGANISATION ===
      categories: updates.categories || [],
      tags: updates.tags || [],
      keywords: updates.keywords || [],
      
      // === IMAGES ===
      image_url: updates.image_url,
      storage_image_url: updates.storage_image_url,
      
      // === PUBLICATION ===
      published: updates.published,
      featured: updates.featured,
      scheduled_for: updates.scheduled_for,
      
      // === MÉTADONNÉES ===
      read_time: updates.read_time,
      category: updates.category,
      updated_at: new Date().toISOString()
    };
    
    // Supprimer les valeurs undefined
    Object.keys(cleanedUpdates).forEach(key => {
      if (cleanedUpdates[key] === undefined) {
        delete cleanedUpdates[key];
      }
    });
    
    console.log("📊 Données de mise à jour:", {
      excerpt_length: cleanedUpdates.excerpt?.length || 0,
      meta_description_length: cleanedUpdates.meta_description?.length || 0,
      keywords_count: cleanedUpdates.keywords?.length || 0,
      tags_count: cleanedUpdates.tags?.length || 0
    });
    
    const { data, error } = await supabase
      .from('articles')
      .update(cleanedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      
      // 🚨 Gestion des erreurs de colonnes manquantes
      if (error.message.includes('meta_description') || error.message.includes('keywords')) {
        console.log('⚠️ Colonnes SEO manquantes, mise à jour avec données de base...');
        
        // Retirer les nouveaux champs et réessayer
        const { meta_description, keywords, ...basicUpdates } = cleanedUpdates;
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('articles')
          .update(basicUpdates)
          .eq('id', id)
          .select()
          .single();
          
        if (fallbackError) throw fallbackError;
        
        console.log('⚠️ Article mis à jour sans les champs SEO avancés');
        return { data: fallbackData, error: null };
      }
      
      throw error;
    }

    if (data && updates.title) {
      console.log("✅ Article mis à jour avec slug:", data.slug);
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
      return { success: true, error: null };
    }

    return { success: false, error };
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'article:', error);
    return { success: false, error };
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
