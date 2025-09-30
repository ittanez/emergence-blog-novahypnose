// Script pour mettre à jour automatiquement les URLs des images
// À utiliser APRÈS avoir uploadé les images dans Supabase Storage
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Charger les variables d'environnement
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ ERREUR: Variables d'environnement manquantes");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const baseStorageUrl = SUPABASE_URL.replace('/rest/v1', '');

// Fonction pour demander confirmation
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'o' || answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function updateArticleImages() {
  console.log("🔄 Mise à jour des URLs des images...\n");

  // Charger le mapping
  const mappingPath = path.join(process.cwd(), 'temp-base64-images', 'articles-mapping.json');

  if (!fs.existsSync(mappingPath)) {
    console.error("❌ Fichier articles-mapping.json introuvable!");
    console.error("   Exécutez d'abord: node scripts/fix-base64-images.js");
    process.exit(1);
  }

  const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

  console.log(`📋 ${mapping.length} article(s) à mettre à jour:\n`);

  mapping.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   Fichier: ${article.fileName}`);
    console.log(`   Taille actuelle: ${article.currentSize}\n`);
  });

  console.log("⚠️  IMPORTANT: Assurez-vous d'avoir uploadé toutes les images dans Supabase Storage");
  console.log("   Bucket: article-images");
  console.log("   Les fichiers doivent avoir les noms listés ci-dessus\n");

  const confirmed = await askConfirmation("Voulez-vous continuer? (o/n): ");

  if (!confirmed) {
    console.log("❌ Opération annulée");
    process.exit(0);
  }

  console.log("\n🚀 Mise à jour en cours...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const article of mapping) {
    const newImageUrl = `${baseStorageUrl}/storage/v1/object/public/article-images/${article.fileName}`;

    try {
      // Vérifier que l'image existe dans le storage
      const response = await fetch(newImageUrl, { method: 'HEAD' });

      if (!response.ok) {
        console.log(`⚠️  Image non trouvée dans Storage: ${article.fileName}`);
        console.log(`   Vérifiez que le fichier est uploadé et accessible\n`);
        errorCount++;
        continue;
      }

      // Mettre à jour l'article
      const { error } = await supabase
        .from('articles')
        .update({
          image_url: newImageUrl,
          storage_image_url: newImageUrl
        })
        .eq('id', article.id);

      if (error) {
        console.log(`❌ Erreur mise à jour: ${article.title}`);
        console.log(`   ${error.message}\n`);
        errorCount++;
      } else {
        console.log(`✅ ${article.title}`);
        console.log(`   Nouvelle URL: ${newImageUrl}\n`);
        successCount++;
      }

    } catch (err) {
      console.log(`❌ Erreur: ${article.title}`);
      console.log(`   ${err.message}\n`);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("\n📊 RÉSULTATS:\n");
  console.log(`   ✅ Succès: ${successCount}`);
  console.log(`   ❌ Échecs: ${errorCount}`);
  console.log(`   📝 Total: ${mapping.length}\n`);

  if (successCount > 0) {
    console.log("🎉 Articles mis à jour avec succès!");
    console.log("   Vous pouvez maintenant supprimer le dossier temp-base64-images/\n");

    // Vérifier la nouvelle taille
    console.log("🔍 Vérification de l'amélioration...");
    const { execSync } = await import('child_process');
    try {
      execSync('node scripts/check-articles-size.js', { stdio: 'inherit' });
    } catch (err) {
      console.log("   Exécutez: node scripts/check-articles-size.js pour voir l'amélioration");
    }
  }

  console.log("\n" + "=".repeat(80));
}

updateArticleImages();