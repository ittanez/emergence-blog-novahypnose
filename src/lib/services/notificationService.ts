
import { supabase } from './supabase';

export async function notifySubscribersOfNewArticle(
  articleId: string, 
  articleTitle: string, 
  articleSlug: string, 
  articleExcerpt?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('=== DÉBUT NOTIFICATION ABONNÉS ===');
    console.log('Article:', { articleId, articleTitle, articleSlug, articleExcerpt });
    
    console.log('Appel de la fonction notify-subscribers...');
    const { data, error } = await supabase.functions.invoke('notify-subscribers', {
      body: {
        articleId,
        articleTitle,
        articleSlug,
        articleExcerpt
      }
    });
    
    console.log('Réponse complète de notify-subscribers:', { data, error });
    
    if (error) {
      console.error('Erreur de la fonction notify-subscribers:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Notification des abonnés réussie');
    console.log('=== FIN NOTIFICATION ABONNÉS - SUCCÈS ===');
    return { success: true };
  } catch (err: any) {
    console.error('Exception lors de la notification des abonnés:', err);
    console.log('=== FIN NOTIFICATION ABONNÉS - ÉCHEC ===');
    return { success: false, error: err.message };
  }
}
