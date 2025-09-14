import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/lib/types';

export interface FirebaseSyncResult {
  success: boolean;
  message?: string;
  error?: string;
  articleId?: string;
  slug?: string;
}

/**
 * Service dédié à la synchronisation avec Firebase
 * Centralise toute la logique de synchronisation
 */
export class FirebaseSyncService {
  private static readonly FIREBASE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/to_firebase`;
  
  /**
   * Synchronise un article spécifique avec Firebase
   */
  static async syncArticle(articleId: string): Promise<FirebaseSyncResult> {
    try {
      console.log('🚀 FirebaseSyncService: Synchronisation article ID:', articleId);
      
      const response = await fetch(this.FIREBASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          article_id: articleId
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ FirebaseSyncService: Synchronisation réussie');
        return {
          success: true,
          message: result.message,
          articleId,
          slug: result.firebase_document_id
        };
      } else {
        console.warn('⚠️ FirebaseSyncService: Échec synchronisation:', result.error);
        return {
          success: false,
          error: result.error || 'Erreur inconnue',
          articleId
        };
      }
    } catch (error: any) {
      console.error('❌ FirebaseSyncService: Erreur réseau:', error);
      return {
        success: false,
        error: error.message || 'Erreur réseau',
        articleId
      };
    }
  }

  /**
   * Synchronise un article avec données complètes (sans requête DB)
   */
  static async syncArticleWithData(article: Partial<Article>): Promise<FirebaseSyncResult> {
    try {
      console.log('🚀 FirebaseSyncService: Synchronisation avec données complètes:', article.slug);
      
      const response = await fetch(this.FIREBASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: article.id,
          title: article.title,
          slug: article.slug,
          content: article.content || '',
          excerpt: article.excerpt || '',
          image_url: article.image_url || article.storage_image_url || '',
          published: article.published,
          created_at: article.created_at || new Date().toISOString(),
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
        console.log('✅ FirebaseSyncService: Synchronisation avec données réussie');
        return {
          success: true,
          message: result.message,
          articleId: article.id,
          slug: article.slug
        };
      } else {
        console.warn('⚠️ FirebaseSyncService: Échec synchronisation avec données:', result.error);
        return {
          success: false,
          error: result.error || 'Erreur inconnue',
          articleId: article.id
        };
      }
    } catch (error: any) {
      console.error('❌ FirebaseSyncService: Erreur réseau avec données:', error);
      return {
        success: false,
        error: error.message || 'Erreur réseau',
        articleId: article.id
      };
    }
  }

  /**
   * Synchronise tous les articles publiés avec Firebase (utile pour migration)
   */
  static async syncAllPublishedArticles(): Promise<{
    totalSynced: number;
    totalErrors: number;
    results: FirebaseSyncResult[];
  }> {
    try {
      console.log('🔄 FirebaseSyncService: Début synchronisation globale');
      
      // Récupérer tous les articles publiés
      const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, slug, published')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur récupération articles: ${error.message}`);
      }

      if (!articles || articles.length === 0) {
        console.log('ℹ️ FirebaseSyncService: Aucun article publié trouvé');
        return { totalSynced: 0, totalErrors: 0, results: [] };
      }

      console.log(`📊 FirebaseSyncService: ${articles.length} articles à synchroniser`);
      
      const results: FirebaseSyncResult[] = [];
      let totalSynced = 0;
      let totalErrors = 0;

      // Synchroniser chaque article avec délai pour éviter le rate limiting
      for (const article of articles) {
        const result = await this.syncArticle(article.id);
        results.push(result);
        
        if (result.success) {
          totalSynced++;
        } else {
          totalErrors++;
        }
        
        // Délai de 500ms entre chaque synchronisation
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`✅ FirebaseSyncService: Synchronisation globale terminée - ${totalSynced} succès, ${totalErrors} erreurs`);
      
      return { totalSynced, totalErrors, results };
    } catch (error: any) {
      console.error('❌ FirebaseSyncService: Erreur synchronisation globale:', error);
      throw error;
    }
  }

  /**
   * Émet des événements personnalisés pour les composants React
   */
  static emitSyncEvent(type: 'success' | 'error', data: any) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent(`firebase-sync-${type}`, { detail: data }));
    }
  }

  /**
   * Test de connectivité avec Firebase
   */
  static async testFirebaseConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.FIREBASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test: true,
          title: 'Test Connection',
          slug: 'test-connection-' + Date.now()
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Hook React pour utiliser le service de synchronisation
 */
export const useFirebaseSync = () => {
  return {
    syncArticle: FirebaseSyncService.syncArticle,
    syncArticleWithData: FirebaseSyncService.syncArticleWithData,
    syncAllPublishedArticles: FirebaseSyncService.syncAllPublishedArticles,
    testConnection: FirebaseSyncService.testFirebaseConnection
  };
};

// Export par défaut du service
export default FirebaseSyncService;