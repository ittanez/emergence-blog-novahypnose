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
    console.log('=== DÉBUT SYNC-TO-FIREBASE ===')
    console.log('Article reçu:', JSON.stringify(article, null, 2))
    
    // Configuration Firebase (remplacez par vos vraies clés)
    const firebaseConfig = {
      apiKey: "votre-api-key",
      authDomain: "novarespire.firebaseapp.com",
      projectId: "novarespire",
      storageBucket: "novarespire.appspot.com"
    }

    // Vérifier le token Firebase
    const firebaseToken = Deno.env.get('FIREBASE_TOKEN')
    console.log('Firebase token présent:', !!firebaseToken)
    if (!firebaseToken) {
      throw new Error('FIREBASE_TOKEN manquant dans les variables d\'environnement')
    }

    // Envoyer vers Firebase Firestore via REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/novarespire/databases/(default)/documents/blog_articles/${article.slug}`
    console.log('URL Firestore:', firestoreUrl)
    
    const firebaseData = {
      fields: {
        title: { stringValue: article.title },
        excerpt: { stringValue: article.excerpt },
        url: { stringValue: `https://emergences.novahypnose.fr/${article.slug}` },
        published_at: { timestampValue: article.published_at },
        read_time: { integerValue: article.read_time.toString() },
        category: { stringValue: article.category },
        image: { stringValue: article.image || "" },
        hero_image: { stringValue: article.hero_image || "" },
        language: { stringValue: "fr" },
        synced_at: { timestampValue: new Date().toISOString() }
      }
    }

    console.log('Données à envoyer:', JSON.stringify(firebaseData, null, 2))

    const response = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firebaseToken}`
      },
      body: JSON.stringify(firebaseData)
    })

    console.log('Réponse Firebase status:', response.status)
    const responseText = await response.text()
    console.log('Réponse Firebase body:', responseText)

    if (response.ok) {
      console.log('=== SYNC-TO-FIREBASE SUCCÈS ===')
      return new Response(
        JSON.stringify({ success: true, message: 'Article synchronisé', firebaseResponse: responseText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(`Erreur Firebase ${response.status}: ${responseText}`)
    }

  } catch (error) {
    console.error('=== ERREUR SYNC-TO-FIREBASE ===')
    console.error('Erreur détaillée:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})