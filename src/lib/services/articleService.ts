// src/lib/services/articleService.tsx - VERSION CORRIGÉE

import { createClient } from '@supabase/supabase-js';
import { Article } from '@/lib/types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

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
    
    // 📊 LOG DE DEBUG
    console.log("📊 Article nettoyé:", {
      title_length: cleanArticle.title.length,
      content_length: cleanArticle.content.length,
      excerpt_length: cleanArticle.excerpt.length,
      meta_description_length: cleanArticle.meta_description.length,
      tags_count: cleanArticle.tags.length,
      keywords_count: cleanArticle.keywords.length,
      categories_count: cleanArticle.categories.length,
      published: cleanArticle.published,
      scheduled_for: cleanArticle.scheduled_for
    });

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
        author_id: null // ou récupérer l'ID utilisateur connecté
      };
      
      result = await supabase
        .from('articles')
        .insert(newArticle)
        .select('*')
        .single();
    }

    if (result.error) {
      console.error("❌ Erreur Supabase:", result.error);
      
      // 🔍 ANALYSE DÉTAILLÉE DE L'ERREUR
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

// 🔧 FONCTION UTILITAIRE POUR GÉNÉRER UN SLUG UNIQUE
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
        // Slug disponible
        break;
      }
      
      // Slug déjà pris, essayer avec un suffixe
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      if (counter > 100) {
        // Sécurité : éviter les boucles infinies
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

// 🔍 FONCTION POUR RÉCUPÉRER UN ARTICLE PAR ID
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
      // Assurer la compatibilité des champs SEO
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
