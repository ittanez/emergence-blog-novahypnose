import { supabase } from './supabase';
import { Subscriber } from '../types';

export async function addSubscriber(email: string): Promise<{ data: Subscriber | null; error: any }> {
  console.log('Tentative d\'ajout d\'un abonné:', email);
  
  const { data, error } = await supabase
    .from('subscribers')
    .insert([{ email, verified: false }])
    .select('*')
    .single();
  
  if (error) {
    console.error('Erreur lors de l\'ajout de l\'abonné:', error);
    return { data: null, error };
  }
  
  console.log('Abonné ajouté avec succès:', data);
  
  // Envoyer l'email de confirmation
  try {
    console.log('Envoi de l\'email de confirmation...');
    const emailResponse = await supabase.functions.invoke('send-confirmation-email', {
      body: { email: data.email }
    });
    
    if (emailResponse.error) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailResponse.error);
    } else {
      console.log('Email de confirmation envoyé avec succès');
    }
  } catch (emailError) {
    console.error('Exception lors de l\'envoi de l\'email de confirmation:', emailError);
    // On ne fait pas échouer l'inscription si l'email ne peut pas être envoyé
  }
  
  return { data, error: null };
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
