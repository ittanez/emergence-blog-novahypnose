
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction pour nettoyer le slug
function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Remplacer les tirets multiples par un seul
    .replace(/^-|-$/g, ''); // Supprimer les tirets en début et fin
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== DÉBUT NOTIFY-SUBSCRIBERS ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, articleTitle, articleSlug, articleExcerpt } = await req.json();
    console.log('Données reçues:', { articleId, articleTitle, articleSlug, articleExcerpt });

    // Récupérer tous les abonnés vérifiés
    console.log('Récupération des abonnés vérifiés...');
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email')
      .eq('verified', true);

    console.log('Requête abonnés exécutée. Error:', subscribersError, 'Data:', subscribers);

    if (subscribersError) {
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('Aucun abonné trouvé');
      return new Response(JSON.stringify({ message: 'Aucun abonné à notifier' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const subscriberEmails = subscribers.map(sub => sub.email);
    console.log(`${subscribers.length} abonnés trouvés:`, subscriberEmails);

    // Nettoyer le slug et construire l'URL correcte
    const cleanedSlug = cleanSlug(articleSlug);
    const articleUrl = `https://emergences.novahypnose.fr/article/${cleanedSlug}`;
    console.log('URL de l\'article:', articleUrl);

    // Template email enrichi pour les notifications
    const emailContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 10px; font-weight: 600;">📚 Nouvel article disponible</h1>
            <p style="color: #6c757d; font-size: 16px; margin: 0;">Blog NovaHypnose</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center;">
            <h2 style="color: white; font-size: 22px; margin-bottom: 15px; line-height: 1.4;">${articleTitle}</h2>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; line-height: 1.6; margin-bottom: 25px;">${articleExcerpt}</p>
            <a href="${articleUrl}" 
               style="display: inline-block; background-color: #ffd700; color: #2c3e50; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;">
              👉 Lire l'article complet
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 20px; text-align: center;">🎯 Ressources utiles</h3>
            
            <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
              <a href="https://hypnokick.novahypnose.fr/" 
                 style="display: inline-block; background-color: #ffd700; color: #2c3e50; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px;">
                🧠 Test d'hypnotisabilité
              </a>
              <a href="https://novahypnose.fr/#about" 
                 style="display: inline-block; background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px;">
                👨‍⚕️ À propos
              </a>
              <a href="https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris" 
                 style="display: inline-block; background-color: #17a2b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: 600; font-size: 14px;">
                📅 Prendre RDV
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; line-height: 1.6; color: #495057;">
              Bonne lecture !<br>
              <strong style="color: #2c3e50;">Alain Zenatti</strong><br>
              <span style="color: #6c757d;">Hypnothérapeute</span>
            </p>
          </div>
          
          <hr style="border: none; border-top: 2px solid #e9ecef; margin: 30px 0;">
          
          <div style="text-align: center;">
            <p style="font-size: 12px; color: #adb5bd;">
              ✉️ Vous ne souhaitez plus recevoir ces emails ? <a href="#" style="color: #adb5bd;">Se désabonner</a>
            </p>
          </div>
          
        </div>
      </div>
    `;

    // Envoyer les emails
    console.log('Début de l\'envoi des emails...');
    const emailPromises = subscriberEmails.map(async (email, index) => {
      console.log(`Envoi email ${index + 1}/${subscriberEmails.length} à: ${email}`);
      
      try {
        const result = await resend.emails.send({
          from: 'NovaHypnose <contact@updates.novahypnose.fr>',
          to: [email],
          subject: `Nouvel article : ${articleTitle}`,
          html: emailContent,
        });
        
        console.log(`Email envoyé avec succès à ${email}:`, result);
        return { email, success: true, result };
      } catch (error) {
        console.error(`Erreur envoi email à ${email}:`, error);
        return { email, success: false, error };
      }
    });

    console.log('Attente de tous les envois d\'emails...');
    const results = await Promise.all(emailPromises);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`Résultats des envois: ${successCount} réussis, ${failureCount} échoués`);
    console.log('=== FIN NOTIFY-SUBSCRIBERS ===');

    return new Response(JSON.stringify({
      message: `Notifications envoyées à ${successCount} abonnés`,
      successCount,
      failureCount,
      results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Erreur dans notify-subscribers:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
