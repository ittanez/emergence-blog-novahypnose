
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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #f8f9fa;">
        <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; font-size: 28px; margin-bottom: 10px; font-weight: 600;">Bienvenue sur le blog NovaHypnose ! 🌟</h1>
            <p style="color: #6c757d; font-size: 16px; margin: 0;">Votre voyage vers le bien-être commence ici</p>
          </div>
          
          <p style="font-size: 17px; line-height: 1.7; color: #495057; margin-bottom: 30px;">
            Bonjour,<br><br>
            Merci de vous être abonné(e) à mon blog sur l'hypnothérapie ! Vous recevrez désormais mes derniers articles directement dans votre boîte mail.
          </p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin: 30px 0;">
            <h2 style="color: white; font-size: 20px; margin-bottom: 25px; text-align: center;">🎯 Ressources exclusives pour vous</h2>
            
            <div style="background-color: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffd700;">
              <h3 style="color: white; font-size: 18px; margin-bottom: 10px;">🧠 Faites le test : Suis-je hypnotisable ?</h3>
              <p style="color: rgba(255,255,255,0.9); margin-bottom: 15px; line-height: 1.6;">
                C'est LA question que tout le monde se pose. Découvrez-le en 2 minutes avec notre test scientifique !
              </p>
              <a href="https://hypnokick.novahypnose.fr/" 
                 style="display: inline-block; background-color: #ffd700; color: #2c3e50; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: 600; transition: all 0.3s;">
                👉 Faire le test maintenant
              </a>
            </div>
            
            <div style="background-color: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
              <h3 style="color: white; font-size: 18px; margin-bottom: 10px;">👨‍⚕️ À propos de moi</h3>
              <p style="color: rgba(255,255,255,0.9); margin-bottom: 15px; line-height: 1.6;">
                Découvrez qui je suis et mon approche unique de l'hypnothérapie.
              </p>
              <a href="https://novahypnose.fr/#about" 
                 style="display: inline-block; background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: 600;">
                👉 En savoir plus
              </a>
            </div>
            
            <div style="background-color: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px; border-left: 4px solid #17a2b8;">
              <h3 style="color: white; font-size: 18px; margin-bottom: 10px;">📅 Prendre rendez-vous</h3>
              <p style="color: rgba(255,255,255,0.9); margin-bottom: 15px; line-height: 1.6;">
                Envie d'essayer une séance ? Prenez rendez-vous dès maintenant.
              </p>
              <a href="https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris" 
                 style="display: inline-block; background-color: #17a2b8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: 600;">
                👉 Réserver une séance
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 17px; line-height: 1.6; color: #495057;">
              À très bientôt,<br>
              <strong style="color: #2c3e50;">Alain Zenatti</strong><br>
              <span style="color: #6c757d;">Hypnothérapeute certifié</span>
            </p>
          </div>
          
          <hr style="border: none; border-top: 2px solid #e9ecef; margin: 30px 0;">
          
          <div style="text-align: center;">
            <p style="font-size: 14px; color: #6c757d; margin-bottom: 10px;">
              📖 <a href="https://novahypnose.fr/" style="color: #667eea; text-decoration: none;">Consulter tous mes articles</a>
            </p>
            <p style="font-size: 12px; color: #adb5bd;">
              ✉️ Vous ne souhaitez plus recevoir ces emails ? <a href="#" style="color: #adb5bd;">Se désabonner</a>
            </p>
          </div>
          
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
