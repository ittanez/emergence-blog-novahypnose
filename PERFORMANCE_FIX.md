# 🚀 Correctif de Performance - Chargement Articles

## 🔴 Problèmes Identifiés

### 1. Chargement du contenu complet inutilement
**Avant :** La requête chargeait TOUS les champs (`SELECT *`), incluant le contenu complet de chaque article (moyenne 11 418 caractères).

**Impact :** 1.14 MB de données transférées pour 51 articles, temps de requête : 5.5 secondes.

**Solution :** Ne charger que les champs nécessaires pour la page d'accueil :
- `id, title, slug, excerpt, image_url, storage_image_url, published_at, created_at, read_time, categories, tags, author, featured, published`
- Exclure `content, keywords, seo_description, meta_description`

**Gain attendu :** Réduction de ~90% de la taille des données (de 1.14 MB à ~115 KB)

### 2. Images encodées en base64 dans la base de données
**Articles concernés :**
1. "L'hypnose, votre alliée secrète pour réussir examens et compétitions" (306 KB)
2. "La cartographie de ses 'moi parallèles'" (230 KB)

**Problème :** Ces deux articles stockent l'image complète en base64 dans le champ `image_url` au lieu d'une URL.

**Solution MANUELLE REQUISE :**
Vous devez aller dans Supabase et :
1. Uploader ces images dans le Storage Supabase
2. Remplacer le champ `image_url` par l'URL du Storage

### 3. Pas d'index sur la colonne `published`
**Solution :** Migration SQL créée dans `supabase/migrations/20250930_add_performance_indexes.sql`

## 📊 Résultats Attendus

**Avant :**
- Temps de chargement : 60+ secondes
- Taille des données : 1.14 MB
- Requête Supabase : 5.5 secondes

**Après :**
- Temps de chargement : 2-3 secondes
- Taille des données : ~115 KB (réduction de 90%)
- Requête Supabase : <1 seconde (avec index)

## ✅ Actions Effectuées

1. ✅ Optimisation de `getAllArticlesNoPagination()` - ne charge que les champs nécessaires
2. ✅ Filtrage côté serveur avec `.eq('published', true)`
3. ✅ Unification du client Supabase
4. ✅ Création des index de performance
5. ✅ Suppression du filtrage client redondant

## ⚠️ Actions Manuelles Requises

### Corriger les images base64

Connectez-vous à votre dashboard Supabase et exécutez ce SQL pour identifier les articles problématiques :

```sql
SELECT id, title, length(image_url) as image_size
FROM articles
WHERE image_url LIKE 'data:image%'
ORDER BY length(image_url) DESC;
```

Pour chaque article :
1. Téléchargez l'image (copiez le base64, convertissez en fichier)
2. Uploadez dans Supabase Storage (bucket `article-images`)
3. Mettez à jour l'article avec la nouvelle URL :

```sql
UPDATE articles
SET image_url = 'https://akrlyzmfszumibwgocae.supabase.co/storage/v1/object/public/article-images/nom-fichier.webp'
WHERE id = 'ID_ARTICLE';
```

## 🧪 Test

Exécutez le script de vérification :
```bash
node scripts/check-articles-size.js
```

Le temps de requête devrait passer de 5.5s à <1s après les corrections.