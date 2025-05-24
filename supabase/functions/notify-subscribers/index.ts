
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleExcerpt?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, articleTitle, articleSlug, articleExcerpt }: NotifyRequest = await req.json();
    
    console.log("Notification pour le nouvel article:", articleTitle);

    // Récupérer tous les abonnés
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email')
      .eq('verified', true);

    if (subscribersError) {
      throw new Error(`Erreur lors de la récupération des abonnés: ${subscribersError.message}`);
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("Aucun abonné trouvé");
      return new Response(JSON.stringify({ message: "Aucun abonné trouvé" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Envoi des notifications à ${subscribers.length} abonnés`);

    // Préparer l'URL de l'article
    const articleUrl = `https://akrlyzmfszumibwgocae.supabase.co/article/${articleSlug}`;

    // Envoyer l'email à tous les abonnés
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        return await resend.emails.send({
          from: "NovaHypnose <onboarding@resend.dev>",
          to: [subscriber.email],
          subject: `Nouvel article: ${articleTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #6b46c1; text-align: center;">Nouvel article publié !</h1>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #1e293b; margin-top: 0;">${articleTitle}</h2>
                ${articleExcerpt ? `
                  <p style="color: #475569; line-height: 1.6; font-style: italic;">
                    ${articleExcerpt}
                  </p>
                ` : ''}
                <p style="color: #475569; line-height: 1.6;">
                  Un nouvel article vient d'être publié sur notre blog <strong>Émergences</strong>. 
                  Découvrez-le dès maintenant !
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${articleUrl}" 
                   style="background-color: #6b46c1; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  Lire l'article
                </a>
              </div>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <p style="color: #64748b; font-size: 14px; text-align: center;">
                  Vous recevez cet email car vous êtes abonné(e) aux notifications du blog NovaHypnose.
                </p>
                <p style="color: #64748b; font-size: 14px; text-align: center;">
                  <strong>NovaHypnose</strong> - Regards sur l'hypnose et la transformation intérieure
                </p>
              </div>
            </div>
          `,
        });
      } catch (error) {
        console.error(`Erreur envoi email à ${subscriber.email}:`, error);
        return { error: error.message, email: subscriber.email };
      }
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Emails envoyés: ${successful} réussis, ${failed} échoués`);

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successful, 
      failed: failed,
      totalSubscribers: subscribers.length 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de la notification des abonnés:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
