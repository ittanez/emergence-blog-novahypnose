import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url?: string;
  storage_image_url?: string;
  published: boolean;
  created_at: string;
  read_time: number;
  categories: string[];
  tags: any[];
  author: string;
  keywords: string[];
  seo_description: string;
  featured: boolean;
}

interface FirebaseArticleData {
  fields: {
    id: { stringValue: string };
    title: { stringValue: string };
    slug: { stringValue: string };
    content: { stringValue: string };
    excerpt: { stringValue: string };
    hero_image: { stringValue: string };
    image_url: { stringValue: string };
    url: { stringValue: string };
    published_at: { timestampValue: string };
    read_time: { integerValue: string };
    category: { stringValue: string };
    tags: { arrayValue: { values: { stringValue: string }[] } };
    author: { stringValue: string };
    keywords: { arrayValue: { values: { stringValue: string }[] } };
    seo_description: { stringValue: string };
    featured: { booleanValue: boolean };
    language: { stringValue: string };
    synced_at: { timestampValue: string };
    full_content: { stringValue: string };
    metadata: { 
      mapValue: { 
        fields: {
          source: { stringValue: string };
          version: { stringValue: string };
        }
      }
    };
  };
}

serve(async (req) => {
  console.log('🚀 to_firebase function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verification de la methode HTTP
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed');
    }

    // Recuperation et validation des donnees
    const requestData = await req.json();
    console.log('📥 Request data received:', JSON.stringify(requestData, null, 2));

    // Validation des donnees requises
    if (!requestData.article_id && (!requestData.title || !requestData.slug)) {
      throw new Error('article_id or (title and slug) required');
    }

    let article: Article;

    if (requestData.article_id) {
      // Recuperation de l'article complet depuis Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', requestData.article_id)
        .eq('published', true)
        .single();

      if (error || !data) {
        throw new Error(`Article not found or not published: ${error?.message}`);
      }

      article = data as Article;
    } else {
      // Utiliser les donnees fournies directement
      article = requestData as Article;
    }

    console.log('📄 Article to sync:', {
      id: article.id,
      title: article.title,
      slug: article.slug,
      published: article.published
    });

    // Configuration Firebase - nettoyage agressif des espaces
    const rawProjectId = Deno.env.get('FIREBASE_PROJECT_ID') || 'novarespire';
    const rawApiKey = Deno.env.get('FIREBASE_API_KEY');
    
    // Nettoyage complet : suppression de TOUS les espaces
    const firebaseProjectId = rawProjectId.replace(/\s/g, '').trim();
    const firebaseApiKey = rawApiKey ? rawApiKey.replace(/\s/g, '').trim() : '';
    
    if (!firebaseApiKey) {
      throw new Error('FIREBASE_API_KEY environment variable is required');
    }

    console.log('🔧 Raw Project ID:', JSON.stringify(rawProjectId));
    console.log('🔧 Clean Project ID:', JSON.stringify(firebaseProjectId));
    console.log('🔧 API Key length:', firebaseApiKey.length);

    // Construction de l'URL Firestore REST API avec API Key
    // Nettoyer le slug pour eviter les caracteres problematiques
    const cleanSlug = article.slug.replace(/[^a-zA-Z0-9-_]/g, '-');
    // URL pour mettre a jour un document dans la collection blog_articles
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/blog_articles/${cleanSlug}?key=${firebaseApiKey}`;
    
    console.log('🔗 Final URL:', firestoreUrl);
    
    // Nettoyer et preparer le contenu
    const cleanContent = article.content?.replace(/<[^>]*>/g, '') || '';
    const heroImage = article.storage_image_url || article.image_url || '';
    const websiteUrl = Deno.env.get('WEBSITE_URL') || 'https://emergences.novahypnose.fr';
    
    // Construction des donnees Firebase avec structure complete
    const firebaseData: FirebaseArticleData = {
      fields: {
        id: { stringValue: article.id },
        title: { stringValue: article.title },
        slug: { stringValue: article.slug },
        content: { stringValue: cleanContent.substring(0, 1000) + (cleanContent.length > 1000 ? '...' : '') },
        full_content: { stringValue: article.content || '' },
        excerpt: { stringValue: article.excerpt || cleanContent.substring(0, 200) + '...' },
        hero_image: { stringValue: heroImage },
        image_url: { stringValue: heroImage },
        url: { stringValue: `${websiteUrl}/article/${article.slug}` },
        published_at: { timestampValue: article.created_at },
        read_time: { integerValue: (article.read_time || 5).toString() },
        category: { stringValue: article.categories?.[0] || 'general' },
        tags: { 
          arrayValue: { 
            values: (article.tags || []).map((tag: any) => ({ 
              stringValue: typeof tag === 'string' ? tag : tag.name || ''
            }))
          }
        },
        author: { stringValue: article.author || 'Novahypnose' },
        keywords: {
          arrayValue: {
            values: (article.keywords || []).map(keyword => ({ stringValue: keyword }))
          }
        },
        seo_description: { stringValue: article.seo_description || article.excerpt || '' },
        featured: { booleanValue: article.featured || false },
        language: { stringValue: 'fr' },
        synced_at: { timestampValue: new Date().toISOString() },
        metadata: {
          mapValue: {
            fields: {
              source: { stringValue: 'emergence-blog' },
              version: { stringValue: '1.0.0' }
            }
          }
        }
      }
    };

    console.log('🔥 Syncing to Firebase:', firestoreUrl);
    
    // Envoi vers Firebase Firestore (PATCH pour créer ou mettre à jour le document)
    const response = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(firebaseData)
    });

    const responseText = await response.text();
    console.log('📡 Firebase response status:', response.status);
    console.log('📡 Firebase response body:', responseText);

    if (!response.ok) {
      throw new Error(`Firebase sync failed: ${response.status} - ${responseText}`);
    }

    // Log de succes
    console.log('✅ Article synchronized successfully to Firebase');
    
    // Optionnel: Log dans Supabase pour tracabilite
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('sync_logs')
          .insert({
            article_id: article.id,
            sync_type: 'firebase',
            status: 'success',
            synced_at: new Date().toISOString(),
            details: { firebase_document_id: cleanSlug }
          });
      }
    } catch (logError) {
      console.warn('⚠️ Could not log sync to database:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Article "${article.title}" synchronized to Firebase successfully`,
        firebase_document_id: cleanSlug,
        synced_at: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Firebase sync error:', error);
    
    // Log de l'erreur dans Supabase si possible
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('sync_logs')
          .insert({
            article_id: 'unknown',
            sync_type: 'firebase',
            status: 'error',
            synced_at: new Date().toISOString(),
            error_message: error.message
          });
      }
    } catch (logError) {
      console.warn('⚠️ Could not log error to database:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});