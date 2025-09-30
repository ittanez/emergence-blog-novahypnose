// Script pour vérifier la taille des données articles dans Supabase
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ERREUR: Variables d'environnement manquantes");
  console.error("Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définis dans .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkArticlesSize() {
  console.log("🔍 Vérification de la taille des articles...\n");

  const startTime = Date.now();

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  const endTime = Date.now();
  const duration = endTime - startTime;

  if (error) {
    console.error("❌ Erreur:", error);
    return;
  }

  if (!data) {
    console.log("⚠️ Aucune donnée retournée");
    return;
  }

  // Calculer la taille des données
  const dataString = JSON.stringify(data);
  const sizeInBytes = new Blob([dataString]).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

  console.log("📊 Résultats:");
  console.log(`   Nombre d'articles: ${data.length}`);
  console.log(`   Temps de requête: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
  console.log(`   Taille totale: ${sizeInKB} KB (${sizeInMB} MB)`);
  console.log(`   Taille moyenne par article: ${(sizeInBytes / data.length / 1024).toFixed(2)} KB\n`);

  // Analyser les articles les plus lourds
  const articleSizes = data.map(article => ({
    title: article.title,
    size: new Blob([JSON.stringify(article)]).size,
    contentLength: article.content?.length || 0,
    imageUrl: article.image_url || article.storage_image_url || 'none'
  })).sort((a, b) => b.size - a.size);

  console.log("📦 Top 5 des articles les plus lourds:");
  articleSizes.slice(0, 5).forEach((article, i) => {
    console.log(`   ${i + 1}. ${article.title}`);
    console.log(`      Taille: ${(article.size / 1024).toFixed(2)} KB`);
    console.log(`      Contenu: ${article.contentLength} caractères`);
    console.log(`      Image: ${article.imageUrl.substring(0, 50)}...`);
  });

  // Vérifier si le problème vient du contenu
  const avgContentLength = data.reduce((sum, a) => sum + (a.content?.length || 0), 0) / data.length;
  console.log(`\n📝 Longueur moyenne du contenu: ${avgContentLength.toFixed(0)} caractères`);

  if (avgContentLength > 10000) {
    console.log("⚠️ Articles très longs détectés - Envisager de charger seulement title, excerpt, image_url");
  }

  if (duration > 5000) {
    console.log("\n⚠️ PROBLÈME: La requête prend plus de 5 secondes!");
    console.log("   Causes possibles:");
    console.log("   - Latence réseau vers Supabase");
    console.log("   - Pas d'index sur la colonne 'published'");
    console.log("   - Trop de données transférées");
  }
}

checkArticlesSize();