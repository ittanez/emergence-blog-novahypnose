import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const article = await req.json()
    
    // Configuration Firebase (remplacez par vos vraies clés)
    const firebaseConfig = {
      apiKey: "votre-api-key",
      authDomain: "novarespire.firebaseapp.com",
      projectId: "novarespire",
      storageBucket: "novarespire.appspot.com"
    }

    // Envoyer vers Firebase Firestore via REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/novarespire/databases/(default)/documents/blog_articles/${article.slug}`
    
    const firebaseData = {
      fields: {
        title: { stringValue: article.title },
        excerpt: { stringValue: article.excerpt },
        url: { stringValue: `https://emergences.novahypnose.fr/${article.slug}` },
        published_at: { timestampValue: article.published_at },
        read_time: { integerValue: article.read_time.toString() },
        category: { stringValue: article.category },
        language: { stringValue: "fr" },
        synced_at: { timestampValue: new Date().toISOString() }
      }
    }

    const response = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('FIREBASE_TOKEN')}`
      },
      body: JSON.stringify(firebaseData)
    })

    if (response.ok) {
      return new Response(
        JSON.stringify({ success: true, message: 'Article synchronisé' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error('Erreur Firebase')
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})