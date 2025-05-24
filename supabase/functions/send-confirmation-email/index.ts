
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ConfirmationEmailRequest = await req.json();
    
    console.log("Envoi de l'email de confirmation à:", email);

    const emailResponse = await resend.emails.send({
      from: "NovaHypnose <onboarding@resend.dev>",
      to: [email],
      subject: "Bienvenue ! Votre inscription aux notifications NovaHypnose",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6b46c1; text-align: center;">Bienvenue chez NovaHypnose !</h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e293b; margin-top: 0;">Merci pour votre inscription !</h2>
            <p style="color: #475569; line-height: 1.6;">
              Vous êtes maintenant inscrit(e) aux notifications de notre blog <strong>Émergences</strong>.
            </p>
            <p style="color: #475569; line-height: 1.6;">
              Vous recevrez désormais un email à chaque fois qu'un nouvel article sur l'hypnose, 
              la transformation intérieure et le bien-être sera publié.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://akrlyzmfszumibwgocae.supabase.co" 
               style="background-color: #6b46c1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Découvrir le blog
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              Si vous souhaitez vous désabonner, vous pourrez le faire depuis n'importe quel email que nous vous enverrons.
            </p>
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              <strong>NovaHypnose</strong> - Regards sur l'hypnose et la transformation intérieure
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email de confirmation envoyé avec succès:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
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
