
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  created_at?: string;
  role?: string;
}

// Récupérer tous les administrateurs
export async function getAllAdmins(): Promise<{ data: AdminUser[] | null; error: any }> {
  try {
    // Récupérer les IDs des admins depuis la table admin_users
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id, created_at');
      
    if (adminError) {
      throw adminError;
    }
    
    if (!adminData || adminData.length === 0) {
      return { data: [], error: null };
    }
    
    // Récupérer les informations des utilisateurs depuis auth.users
    // Note: Nous ne pouvons pas requêter directement auth.users, donc nous utilisons une fonction RPC
    // Cette fonction doit être créée dans votre base de données Supabase
    
    // Pour l'instant, nous retournons les données que nous avons
    const admins: AdminUser[] = adminData.map(admin => ({
      id: admin.user_id,
      email: '', // Nous ne pouvons pas facilement accéder à l'email sans une fonction RPC
      created_at: admin.created_at,
      role: 'admin'
    }));
    
    return { data: admins, error: null };
  } catch (error) {
    console.error('Error fetching admins:', error);
    return { data: null, error };
  }
}

// Ajouter un administrateur
export async function addAdmin(userId: string): Promise<{ success: boolean; error: any }> {
  try {
    // Vérifier si l'utilisateur est déjà admin
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    
    if (existingAdmin) {
      return { success: false, error: new Error('Cet utilisateur est déjà administrateur.') };
    }
    
    // Ajouter l'utilisateur comme admin
    const { error } = await supabase
      .from('admin_users')
      .insert({ user_id: userId });
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding admin:', error);
    return { success: false, error };
  }
}

// Supprimer un administrateur
export async function removeAdmin(userId: string): Promise<{ success: boolean; error: any }> {
  try {
    // Vérifier s'il y a plus d'un admin
    const { data: admins, error: countError } = await supabase
      .from('admin_users')
      .select('user_id');
      
    if (countError) {
      throw countError;
    }
    
    if (admins && admins.length <= 1) {
      return { 
        success: false, 
        error: new Error('Impossible de supprimer le dernier administrateur.') 
      };
    }
    
    // Supprimer l'admin
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);
      
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing admin:', error);
    return { success: false, error };
  }
}

// Vérifier une demande d'administration
export async function reviewAdminRequest(
  requestId: string, 
  status: 'approved' | 'rejected', 
  reviewerId: string
): Promise<{ success: boolean; error: any }> {
  try {
    // Mettre à jour le statut de la demande
    const { error: updateError } = await supabase
      .from('admin_requests')
      .update({
        status: status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId
      })
      .eq('id', requestId);
      
    if (updateError) {
      throw updateError;
    }
    
    if (status === 'approved') {
      // Récupérer l'ID de l'utilisateur qui a fait la demande
      const { data: requestData, error: requestError } = await supabase
        .from('admin_requests')
        .select('user_id')
        .eq('id', requestId)
        .single();
        
      if (requestError) {
        throw requestError;
      }
      
      if (requestData) {
        // Ajouter l'utilisateur comme admin
        const { error: addError } = await supabase
          .from('admin_users')
          .insert({ user_id: requestData.user_id });
          
        if (addError) {
          throw addError;
        }
      }
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error reviewing admin request:', error);
    return { success: false, error };
  }
}

// Récupérer toutes les demandes d'administration
export async function getAdminRequests(): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('admin_requests')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching admin requests:', error);
    return { data: null, error };
  }
}
