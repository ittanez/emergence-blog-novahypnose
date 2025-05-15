
import { supabase } from './supabase';

export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Connecte un utilisateur avec son email et mot de passe
 */
export async function signIn({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
}

/**
 * Déconnecte l'utilisateur actuel
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Vérifie si l'utilisateur connecté est un administrateur
 */
export async function checkIsAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return { isAdmin: false };
  }

  try {
    const { data, error } = await supabase.rpc('is_admin', {
      user_id: session.user.id
    });

    if (error) {
      console.error('Erreur lors de la vérification des droits admin:', error);
      return { isAdmin: false, error };
    }

    return { isAdmin: !!data, error: null };
  } catch (error) {
    console.error('Exception lors de la vérification des droits admin:', error);
    return { isAdmin: false, error };
  }
}

/**
 * Récupère la session utilisateur actuelle
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

/**
 * Crée un nouvel administrateur (à utiliser uniquement par un admin existant)
 */
export async function createAdmin({ email, password }: AuthCredentials) {
  // Étape 1: Créer un nouvel utilisateur
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/admin/dashboard`
    }
  });
  
  if (authError || !authData.user) {
    return { success: false, error: authError };
  }
  
  // Étape 2: Ajouter l'utilisateur à la table admin_users
  const { error: adminError } = await supabase
    .from('admin_users')
    .insert({ user_id: authData.user.id });
  
  if (adminError) {
    return { success: false, error: adminError };
  }
  
  return { success: true, data: authData };
}
