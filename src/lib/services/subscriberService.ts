
import { supabase } from './supabase';
import { Subscriber } from '../types';

export async function addSubscriber(email: string): Promise<{ data: Subscriber | null; error: any }> {
  const { data, error } = await supabase
    .from('subscribers')
    .insert([{ email, verified: false }])
    .select('*')
    .single();
  
  if (error) {
    console.error('Error adding subscriber:', error);
    return { data: null, error };
  }
  
  return { data, error: null };
}

export async function getSubscribers(): Promise<{ data: Subscriber[] | null; error: any }> {
  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching subscribers:', error);
    return { data: null, error };
  }
  
  return { data, error: null };
}
