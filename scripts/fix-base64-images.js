// Script pour identifier et corriger les articles avec images base64
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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

async function identifyBase64Articles() {
  console.log("🔍 Recherche des articles avec images base64...\n");

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, image_url, storage_image_url')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ Erreur:", error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log("⚠️ Aucun article trouvé");
    return;
  }

  console.log(`📊 Total: ${articles.length} articles analysés\n`);

  // Identifier les articles avec base64
  const base64Articles = articles.filter(article =>
    article.image_url && article.image_url.startsWith('data:image')
  );

  if (base64Articles.length === 0) {
    console.log("✅ Aucun article avec image base64 trouvé!");
    return;
  }

  console.log(`🚨 ${base64Articles.length} article(s) avec images base64 détecté(s):\n`);

  // Créer un dossier pour sauvegarder les images
  const outputDir = path.join(process.cwd(), 'temp-base64-images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  base64Articles.forEach((article, index) => {
    const imageSize = (article.image_url.length / 1024).toFixed(2);
    console.log(`\n${index + 1}. 📄 "${article.title}"`);
    console.log(`   ID: ${article.id}`);
    console.log(`   Slug: ${article.slug}`);
    console.log(`   Taille image: ${imageSize} KB`);

    // Extraire le type d'image
    const match = article.image_url.match(/data:image\/(\w+);base64,/);
    const imageType = match ? match[1] : 'png';

    // Extraire les données base64
    const base64Data = article.image_url.split(',')[1];

    // Sauvegarder l'image dans un fichier
    const fileName = `${article.slug}.${imageType}`;
    const filePath = path.join(outputDir, fileName);

    try {
      fs.writeFileSync(filePath, base64Data, 'base64');
      console.log(`   ✅ Image extraite: ${filePath}`);
    } catch (err) {
      console.log(`   ❌ Erreur extraction: ${err.message}`);
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("\n📋 INSTRUCTIONS POUR CORRIGER:\n");

  console.log("1️⃣  Les images ont été extraites dans: temp-base64-images/");
  console.log("    Vous pouvez les trouver là pour les uploader.\n");

  console.log("2️⃣  Connectez-vous à Supabase Dashboard:");
  console.log(`    ${SUPABASE_URL.replace('/rest/v1', '')}\n`);

  console.log("3️⃣  Allez dans Storage > Créez un bucket 'article-images' (s'il n'existe pas)");
  console.log("    - Configurez-le en PUBLIC\n");

  console.log("4️⃣  Uploadez chaque image depuis temp-base64-images/\n");

  console.log("5️⃣  Pour chaque article, copiez l'URL publique de l'image uploadée\n");

  console.log("6️⃣  Exécutez ces commandes SQL dans Supabase SQL Editor:\n");

  base64Articles.forEach((article, index) => {
    const match = article.image_url.match(/data:image\/(\w+);base64,/);
    const imageType = match ? match[1] : 'png';
    const fileName = `${article.slug}.${imageType}`;

    console.log(`   -- Article ${index + 1}: "${article.title}"`);
    console.log(`   UPDATE articles`);
    console.log(`   SET image_url = '${SUPABASE_URL.replace('/rest/v1', '')}/storage/v1/object/public/article-images/${fileName}'`);
    console.log(`   WHERE id = '${article.id}';\n`);
  });

  console.log("\n7️⃣  OU utilisez ce script pour mettre à jour automatiquement:");
  console.log("    node scripts/update-article-images.js\n");

  // Créer un fichier de mapping pour faciliter la mise à jour
  const mapping = base64Articles.map(article => {
    const match = article.image_url.match(/data:image\/(\w+);base64,/);
    const imageType = match ? match[1] : 'png';
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      fileName: `${article.slug}.${imageType}`,
      currentSize: (article.image_url.length / 1024).toFixed(2) + ' KB'
    };
  });

  fs.writeFileSync(
    path.join(outputDir, 'articles-mapping.json'),
    JSON.stringify(mapping, null, 2)
  );

  console.log(`📝 Mapping sauvegardé: temp-base64-images/articles-mapping.json`);
  console.log("\n" + "=".repeat(80));
}

identifyBase64Articles();