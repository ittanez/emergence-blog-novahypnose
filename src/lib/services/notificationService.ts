
import { supabase } from './supabase';

export async function notifySubscribersOfNewArticle(
  articleId: string, 
  articleTitle: string, 
  articleSlug: string, 
  articleExcerpt?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Notification des abonnés pour l\'article:', articleTitle);
    
    const { data, error } = await supabase.functions.invoke('notify-subscribers', {
      body: {
        articleId,
        articleTitle,
        articleSlug,
        articleExcerpt
      }
    });
    
    if (error) {
      console.error('Erreur lors de la notification des abonnés:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Notification des abonnés réussie:', data);
    return { success: true };
  } catch (err: any) {
    console.error('Exception lors de la notification des abonnés:', err);
    return { success: false, error: err.message };
  }
}
