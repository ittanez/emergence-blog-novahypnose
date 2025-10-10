
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  console.log('=== DÉBUT PUBLISH-SCHEDULED ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Chercher les articles programmés dont l'heure de publication est passée
    const now = new Date().toISOString();
    
    const { data: scheduledArticles, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('published', false)
      .not('scheduled_for', 'is', null)
      .lte('scheduled_for', now);

    if (fetchError) {
      console.error('Erreur lors de la récupération des articles programmés:', fetchError);
      throw fetchError;
    }

    console.log(`Articles programmés trouvés: ${scheduledArticles?.length || 0}`);

    if (!scheduledArticles || scheduledArticles.length === 0) {
      console.log('Aucun article à publier');
      return new Response(JSON.stringify({ 
        message: 'Aucun article à publier',
        published: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Publier les articles
    const publishedArticles = [];
    const firebaseUrl = `${supabaseUrl}/functions/v1/to_firebase`;

    for (const article of scheduledArticles) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          published: true,
          published_at: now,
          scheduled_for: null
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`Erreur lors de la publication de l'article ${article.id}:`, updateError);
      } else {
        publishedArticles.push(article);
        console.log(`Article publié: ${article.title}`);

        // Synchroniser avec Firebase
        try {
          console.log(`🔥 Synchronisation Firebase pour article: ${article.slug}`);
          const firebaseResponse = await fetch(firebaseUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              article_id: article.id
            })
          });

          const firebaseResult = await firebaseResponse.json();

          if (firebaseResponse.ok && firebaseResult.success) {
            console.log(`✅ Synchronisation Firebase réussie pour: ${article.slug}`);
          } else {
            console.warn(`⚠️ Échec synchronisation Firebase pour ${article.slug}:`, firebaseResult.error);
          }
        } catch (firebaseError) {
          console.warn(`⚠️ Erreur synchronisation Firebase pour ${article.slug}:`, firebaseError);
          // Ne pas bloquer la publication si Firebase échoue
        }
      }
    }

    console.log(`Articles publiés avec succès: ${publishedArticles.length}`);
    console.log('=== FIN PUBLISH-SCHEDULED - SUCCÈS ===');

    return new Response(JSON.stringify({
      message: `${publishedArticles.length} article(s) publié(s) avec succès`,
      published: publishedArticles.length,
      articles: publishedArticles.map(a => ({ id: a.id, title: a.title }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Erreur lors de la publication programmée:', error);
    console.log('=== FIN PUBLISH-SCHEDULED - ÉCHEC ===');
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
