import { createClient } from '@supabase/supabase-js';
import { Subscriber } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export async function addSubscriber(email: string): Promise<{ data: Subscriber | null; error: any }> {
  console.log('=== DÉBUT INSCRIPTION ABONNÉ ===');
  console.log('Email à inscrire:', email);
  
  try {
    // 1. Insérer l'abonné dans la base de données
    console.log('Étape 1: Insertion en base de données...');
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email, verified: true }])
      .select('*')
      .single();
    
    if (error) {
      console.error('Erreur lors de l\'insertion en base:', error);
      return { data: null, error };
    }
    
    console.log('Abonné ajouté en base avec succès:', data);
    
    // 2. Envoyer l'email de confirmation
    console.log('Étape 2: Envoi de l\'email de confirmation...');
    try {
      console.log('Appel de la fonction send-confirmation-email...');
      const emailResponse = await supabase.functions.invoke('send-confirmation-email', {
        body: { email: data.email }
      });
      
      console.log('Réponse complète de la fonction email:', emailResponse);
      
      if (emailResponse.error) {
        console.error('Erreur de la fonction edge:', emailResponse.error);
        // On ne fait pas échouer l'inscription si l'email échoue
        console.warn('L\'email de confirmation n\'a pas pu être envoyé, mais l\'inscription est réussie');
      } else {
        console.log('Email de confirmation envoyé avec succès!');
        console.log('Données de l\'email:', emailResponse.data);
      }
    } catch (emailError) {
      console.error('Exception lors de l\'envoi de l\'email:', emailError);
      // On ne fait pas échouer l'inscription si l'email échoue
      console.warn('Exception email, mais inscription réussie');
    }
    
    console.log('=== FIN INSCRIPTION ABONNÉ - SUCCÈS ===');
    return { data, error: null };
    
  } catch (globalError) {
    console.error('Exception globale lors de l\'inscription:', globalError);
    console.log('=== FIN INSCRIPTION ABONNÉ - ÉCHEC ===');
    return { data: null, error: globalError };
  }
}

export async function getSubscribers(): Promise<{ data: Subscriber[] | null; error: any }> {
  console.log('Récupération de la liste des abonnés');
  
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Erreur lors de la récupération des abonnés:', error);
    return { data: null, error };
  }
  
  console.log('Abonnés récupérés:', data?.length || 0);
  return { data, error: null };
}
