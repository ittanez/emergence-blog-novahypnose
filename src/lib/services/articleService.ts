// articleService.ts - Version finale avec gestion des redirections

import { supabase } from '@/lib/supabase';

export async function getArticleBySlug(slug: string) {
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
