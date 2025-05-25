
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  console.log('=== DÉBUT SEND-CONFIRMATION-EMAIL ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    console.log('Email de bienvenue à envoyer à:', email);

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; font-size: 24px; margin-bottom: 20px;">Bienvenue sur le blog NovaHypnose ! 🌟</h1>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Merci de vous être abonné(e) à mon blog sur l'hypnothérapie ! Vous recevrez désormais mes derniers articles directement dans votre boîte mail.
        </p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">Ressources utiles :</h2>
          
          <div style="margin-bottom: 15px;">
            <strong>🧠 Faites le test : Suis-je hypnotisable ?</strong><br>
            C'est LA question que tout le monde se pose. Découvrez-le en 2 minutes !<br>
            <a href="https://hypnokick.novahypnose.fr/" style="color: #3498db; text-decoration: none;">👉 Faire le test maintenant</a>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>👨‍⚕️ À propos de moi</strong><br>
            Découvrez qui je suis et mon approche unique de l'hypnothérapie.<br>
            <a href="https://novahypnose.fr/#about" style="color: #3498db; text-decoration: none;">👉 En savoir plus</a>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>📅 Prendre rendez-vous</strong><br>
            Envie d'essayer une séance ? Prenez rendez-vous dès maintenant<br>
            <a href="https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris" style="color: #3498db; text-decoration: none;">👉 Réserver une séance</a>
          </div>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          À très bientôt,<br>
          <strong>Alain Zenatti - Hypnothérapeute</strong>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="font-size: 12px; color: #888; text-align: center;">
          <p>📖 <a href="https://akrlyzmfszumibwgocae.supabase.co/" style="color: #888;">Consulter tous mes articles</a></p>
          <p>✉️ Vous ne souhaitez plus recevoir ces emails ? <a href="#" style="color: #888;">Se désabonner</a></p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: 'NovaHypnose <onboarding@resend.dev>',
      to: [email],
      subject: 'Bienvenue sur le blog NovaHypnose ! 🌟',
      html: emailContent,
    });

    console.log('Email de bienvenue envoyé avec succès:', emailResponse);
    console.log('=== FIN SEND-CONFIRMATION-EMAIL - SUCCÈS ===');

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    console.log('=== FIN SEND-CONFIRMATION-EMAIL - ÉCHEC ===');
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
