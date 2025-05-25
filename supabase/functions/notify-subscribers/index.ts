
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

    // URL complète de l'article
    const articleUrl = `${supabaseUrl}/article/${articleSlug}`;
    console.log('URL de l\'article:', articleUrl);

    // Template email enrichi pour les notifications
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 20px;">Nouvel article : ${articleTitle} ✨</h1>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Un nouvel article vient d'être publié sur mon blog :
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 10px;">${articleTitle}</h2>
          <p style="font-size: 14px; color: #555; line-height: 1.5; margin-bottom: 15px;">${articleExcerpt}</p>
          <a href="${articleUrl}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">👉 Lire l'article complet</a>
        </div>
        
        <div style="background-color: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c3e50; font-size: 16px; margin-bottom: 10px;">Ressources utiles :</h3>
          
          <p style="font-size: 14px; margin-bottom: 8px;">
            🧠 <strong>Faites le test : Suis-je hypnotisable ?</strong><br>
            Découvrez-le en 2 minutes ! <a href="https://hypnokick.novahypnose.fr/" style="color: #3498db;">https://hypnokick.novahypnose.fr/</a>
          </p>
          
          <p style="font-size: 14px; margin-bottom: 8px;">
            👨‍⚕️ <strong>À propos de moi</strong> - Mon approche de l'hypnothérapie<br>
            <a href="https://novahypnose.fr/#about" style="color: #3498db;">https://novahypnose.fr/#about</a>
          </p>
          
          <p style="font-size: 14px;">
            📅 <strong>Prendre rendez-vous</strong> pour une séance<br>
            <a href="https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris" style="color: #3498db;">https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris</a>
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Bonne lecture !<br>
          <strong>Alain Zenatti - Hypnothérapeute</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="font-size: 12px; color: #888; text-align: center;">
          <p>📖 <a href="${supabaseUrl}" style="color: #888;">Tous mes articles</a></p>
          <p>⚙️ Gérer mon abonnement | ✉️ <a href="#" style="color: #888;">Se désabonner</a></p>
        </div>
      </div>
    `;

    // Envoyer les emails
    console.log('Début de l\'envoi des emails...');
    const emailPromises = subscriberEmails.map(async (email, index) => {
      console.log(`Envoi email ${index + 1}/${subscriberEmails.length} à: ${email}`);
      
      try {
        const result = await resend.emails.send({
          from: 'NovaHypnose <onboarding@resend.dev>',
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
