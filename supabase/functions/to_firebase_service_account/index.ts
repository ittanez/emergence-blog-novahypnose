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

// Fonction pour générer un JWT pour Firebase
async function generateFirebaseJWT(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600, // 1 heure
    scope: 'https://www.googleapis.com/auth/datastore'
  };

  // Import JWT library
  const jwt = await import('https://deno.land/x/djwt@v3.0.2/mod.ts');
  
  // Créer la clé privée
  const key = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  return await jwt.create({ alg: 'RS256', typ: 'JWT' }, payload, key);
}

// Fonction pour échanger le JWT contre un access token
async function getAccessToken(serviceAccount: any): Promise<string> {
  const jwtToken = await generateFirebaseJWT(serviceAccount);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtToken
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  console.log('🚀 to_firebase_service_account function called');
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Only POST method is allowed');
    }

    const requestData = await req.json();
    console.log('📥 Request data received:', JSON.stringify(requestData, null, 2));

    if (!requestData.article_id && (!requestData.title || !requestData.slug)) {
      throw new Error('article_id or (title and slug) required');
    }

    let article: Article;

    if (requestData.article_id) {
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
      article = requestData as Article;
    }

    console.log('📄 Article to sync:', {
      id: article.id,
      title: article.title,
      slug: article.slug
    });

    // Récupérer le service account depuis les variables d'environnement
    const firebaseServiceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    if (!firebaseServiceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
    }

    const serviceAccount = JSON.parse(firebaseServiceAccountJson);
    const firebaseProjectId = serviceAccount.project_id;

    // Générer un access token
    console.log('🔑 Generating access token...');
    const accessToken = await getAccessToken(serviceAccount);

    const cleanSlug = article.slug.replace(/[^a-zA-Z0-9-_]/g, '-');
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents/blog_articles/${cleanSlug}`;
    
    const cleanContent = article.content?.replace(/<[^>]*>/g, '') || '';
    const heroImage = article.storage_image_url || article.image_url || '';
    const websiteUrl = Deno.env.get('WEBSITE_URL') || 'https://emergences.novahypnose.fr';
    
    const firebaseData = {
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
    
    const response = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(firebaseData)
    });

    const responseText = await response.text();
    console.log('📡 Firebase response status:', response.status);
    console.log('📡 Firebase response body:', responseText);

    if (!response.ok) {
      throw new Error(`Firebase sync failed: ${response.status} - ${responseText}`);
    }

    console.log('✅ Article synchronized successfully to Firebase');

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