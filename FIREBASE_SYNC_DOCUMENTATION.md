# 🔥 Documentation - Synchronisation Firebase Automatique

## Vue d'ensemble

Système de synchronisation automatique des articles depuis Supabase vers Firebase Firestore, conçu pour alimenter l'application Android "Novarespire" en temps réel.

## 🏗️ Architecture

```
Site Web (React) → Supabase Edge Function → Firebase Firestore → App Android
     ↓                    ↓                        ↓
  Publication         to_firebase               blog_articles
   d'article            function               collection
```

## 🚀 Fonctionnalités

### ✅ Déclenchement Automatique
- **Publication d'article** : Synchronisation immédiate lors du passage au statut "publié"
- **Modification d'article** : Re-synchronisation automatique des articles déjà publiés
- **Interface admin** : Bouton de publication avec feedback temps réel
- **Gestion d'erreurs** : Notifications utilisateur en cas d'échec

### ✅ Données Synchronisées
Structure complète reproduisant la mise en page web :

- **Métadonnées** : ID, titre, slug, URL
- **Contenu** : Texte complet, résumé, temps de lecture
- **Media** : Image hero, URLs optimisées
- **SEO** : Description, mots-clés, catégories, tags
- **Publication** : Date, auteur, statut featured
- **Technique** : Version, source, timestamps

## 📁 Structure des Fichiers

### Edge Function
```
supabase/functions/to_firebase/index.ts
```
- Fonction Deno complète prête à déployer
- Gestion CORS, validation, logging
- Authentification Firebase automatique

### Services Frontend
```
src/lib/services/articleService.ts       # Synchronisation intégrée
src/lib/services/firebaseSyncService.ts  # Service dédié
src/hooks/useArticleEditor.tsx           # Interface éditeur
src/hooks/useAdminArticlesActions.tsx    # Actions administrateur
```

### Configuration
```
.env variables requises (voir section Configuration)
```

## ⚙️ Configuration

### 1. Variables d'Environnement Supabase

Ajouter dans le dashboard Supabase → Settings → Edge Functions :

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=novarespire
FIREBASE_API_KEY=your-firebase-api-key

# Application Configuration  
WEBSITE_URL=https://emergences.novahypnose.fr
SUPABASE_URL=https://akrlyzmfszumibwgocae.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Déploiement Edge Function

```bash
# Depuis le répertoire du projet
npx supabase functions deploy to_firebase

# Vérifier le déploiement
npx supabase functions list
```

### 3. Configuration Firebase

#### Créer un Service Account :
1. Firebase Console → Project Settings → Service accounts
2. Generate new private key → Download JSON
3. Utiliser Google Cloud CLI pour générer le token :

```bash
gcloud auth activate-service-account --key-file=service-account-key.json
gcloud auth print-access-token
```

#### Structure Firestore :
```
Collection: blog_articles
Document ID: {article-slug}
```

## 🔄 Flux de Données

### 1. Publication d'Article

```typescript
// 1. Utilisateur publie un article dans l'interface admin
handleSubmit() → saveArticle() 

// 2. saveArticle() déclenche automatiquement la synchronisation
syncArticleToFirebase(article)

// 3. Appel de l'edge function avec données complètes
POST /functions/v1/to_firebase
{
  article_id: "uuid",
  title: "Mon Article",
  slug: "mon-article",
  content: "<p>Contenu HTML...</p>",
  // ... autres champs
}

// 4. Edge function traite et envoie vers Firebase
PATCH /projects/novarespire/databases/(default)/documents/blog_articles/{slug}

// 5. Feedback utilisateur via événements personnalisés
window.dispatchEvent('firebase-sync-success')
```

### 2. Structure Firebase Générée

```json
{
  "fields": {
    "id": { "stringValue": "article-uuid" },
    "title": { "stringValue": "Titre de l'article" },
    "slug": { "stringValue": "titre-de-l-article" },
    "content": { "stringValue": "Résumé (1000 chars)" },
    "full_content": { "stringValue": "Contenu HTML complet" },
    "excerpt": { "stringValue": "Résumé de l'article..." },
    "hero_image": { "stringValue": "https://..." },
    "image_url": { "stringValue": "https://..." },
    "url": { "stringValue": "https://emergences.novahypnose.fr/article/slug" },
    "published_at": { "timestampValue": "2024-01-01T00:00:00.000Z" },
    "read_time": { "integerValue": "5" },
    "category": { "stringValue": "hypnose" },
    "tags": { 
      "arrayValue": { 
        "values": [
          { "stringValue": "hypnose" },
          { "stringValue": "thérapie" }
        ]
      }
    },
    "author": { "stringValue": "Novahypnose" },
    "keywords": {
      "arrayValue": {
        "values": [
          { "stringValue": "hypnose" },
          { "stringValue": "anxiété" }
        ]
      }
    },
    "seo_description": { "stringValue": "Description SEO..." },
    "featured": { "booleanValue": false },
    "language": { "stringValue": "fr" },
    "synced_at": { "timestampValue": "2024-01-01T12:00:00.000Z" },
    "metadata": {
      "mapValue": {
        "fields": {
          "source": { "stringValue": "emergence-blog" },
          "version": { "stringValue": "1.0.0" }
        }
      }
    }
  }
}
```

## 🎯 Points d'Intégration

### Interface Utilisateur

#### 1. Éditeur d'Articles (`useArticleEditor.tsx`)
```typescript
// Feedback temps réel lors de la publication
toast.success("Article publié avec succès", {
  description: "L'article est maintenant visible et synchronisé avec Firebase."
});

// Écoute des événements de synchronisation
window.addEventListener('firebase-sync-success', handleFirebaseSuccess);
```

#### 2. Actions Administrateur (`useAdminArticlesActions.tsx`)
```typescript
// Nouvelle fonction de basculement publication/brouillon
const handleTogglePublishStatus = async (article) => {
  // Publie/dépublie + synchronise automatiquement
  // Feedback utilisateur immédiat
};
```

### Services Backend

#### 1. Service Article (`articleService.ts`)
```typescript
const syncArticleToFirebase = async (article) => {
  // Appel automatique de l'edge function
  // Gestion d'erreurs non-bloquante
  // Événements personnalisés pour l'UI
};
```

#### 2. Service Firebase (`firebaseSyncService.ts`)
```typescript
export class FirebaseSyncService {
  static async syncArticle(articleId) { /* ... */ }
  static async syncAllPublishedArticles() { /* ... */ }
  static async testFirebaseConnection() { /* ... */ }
}
```

## 🔍 Monitoring et Debugging

### Logs Disponibles

#### 1. Edge Function Logs
```bash
# Voir les logs en temps réel
npx supabase functions logs to_firebase --follow

# Logs détaillés dans la console Supabase
```

#### 2. Frontend Logs
```javascript
// Console du navigateur
console.log('🔥 Synchronisation Firebase pour:', article.slug);
console.log('✅ Synchronisation Firebase réussie:', result.message);
console.warn('⚠️ Échec synchronisation Firebase:', result.error);
```

#### 3. Base de Données de Logs (Optionnel)
```sql
-- Table sync_logs créée automatiquement si elle existe
CREATE TABLE sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID,
  sync_type TEXT,
  status TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,
  details JSONB
);
```

### Tests de Fonctionnement

#### 1. Test de Connectivité
```typescript
import { FirebaseSyncService } from '@/lib/services/firebaseSyncService';

// Test de la connexion Firebase
const isConnected = await FirebaseSyncService.testFirebaseConnection();
console.log('Firebase connecté:', isConnected);
```

#### 2. Test de Synchronisation Manuelle
```typescript
// Synchroniser un article spécifique
const result = await FirebaseSyncService.syncArticle('article-id');
console.log('Résultat sync:', result);
```

#### 3. Migration Complète
```typescript
// Synchroniser tous les articles publiés (une seule fois)
const migration = await FirebaseSyncService.syncAllPublishedArticles();
console.log(`${migration.totalSynced} articles synchronisés`);
```

## 🚨 Gestion d'Erreurs

### Erreurs Courantes

| Erreur | Cause | Solution |
|--------|--------|----------|
| `FIREBASE_API_KEY manquant` | API Key Firebase non configurée | Ajouter FIREBASE_API_KEY dans Supabase |
| `Article not found` | Article supprimé entre temps | Vérifier l'existence avant sync |
| `Firebase sync failed: 403` | Permissions Firestore | Vérifier les règles Firestore |
| `Network error` | Connectivité | Retry automatique intégré |

### Stratégie de Récupération
1. **Non-bloquant** : L'échec Firebase n'empêche pas la publication
2. **Retry automatique** : Nouvelle tentative en cas d'erreur réseau
3. **Feedback utilisateur** : Notification claire des succès/échecs
4. **Logging** : Traçabilité complète des synchronisations

## 🔐 Sécurité

### Authentification
- **Edge Function** : Utilise la clé de service Supabase
- **Firebase** : Token de service account avec permissions limitées
- **Frontend** : Clé anonyme Supabase (lecture seule)

### Validation
- **Données d'entrée** : Validation complète dans l'edge function  
- **Permissions** : Seuls les articles publiés sont synchronisés
- **Rate limiting** : Délai entre synchronisations multiples

## 📱 Application Android

### Lecture des Données
```kotlin
// Kotlin - Lecture collection Firestore
db.collection("blog_articles")
  .orderBy("published_at", Query.Direction.DESCENDING)  
  .limit(5)
  .get()
```

### Structure d'Article pour Android
```json
{
  "title": "Titre affiché",
  "excerpt": "Résumé pour liste", 
  "hero_image": "URL image principale",
  "url": "Lien vers article web",
  "read_time": 5,
  "category": "Catégorie affichée",
  "published_at": "Date formatée"
}
```

## 🚀 Déploiement

### Checklist de Déploiement

#### ✅ 1. Variables d'Environnement
- [ ] `FIREBASE_PROJECT_ID` configuré
- [ ] `FIREBASE_API_KEY` configurée  
- [ ] `WEBSITE_URL` correct
- [ ] Clés Supabase valides

#### ✅ 2. Edge Function
- [ ] Code copié dans `supabase/functions/to_firebase/index.ts`
- [ ] Fonction déployée : `npx supabase functions deploy to_firebase`
- [ ] Test manuel : appel POST réussi

#### ✅ 3. Frontend
- [ ] Services modifiés et déployés
- [ ] Interface utilisateur testée
- [ ] Notifications fonctionnelles

#### ✅ 4. Firebase  
- [ ] Projet "novarespire" créé
- [ ] Collection `blog_articles` accessible
- [ ] Règles Firestore configurées
- [ ] Service account créé

#### ✅ 5. Tests
- [ ] Publication d'article → Synchronisation automatique
- [ ] Interface admin → Basculement statut
- [ ] Application Android → Réception données
- [ ] Gestion d'erreurs → Feedback utilisateur

## 🔄 Maintenance

### Tâches Régulières
1. **Vérification FIREBASE_API_KEY** (si nécessaire)
2. **Monitoring des logs** d'edge function
3. **Vérification synchronisation** articles récents  
4. **Nettoyage logs** de synchronisation anciens

### Évolutions Possibles
- **Synchronisation bidirectionnelle** (Firebase → Supabase)
- **Synchronisation des commentaires** d'articles
- **Webhook Firebase** pour notifications push
- **Cache Redis** pour optimiser les performances

---

## 📞 Support

Pour toute question ou problème :
1. **Vérifier les logs** Edge Function dans Supabase
2. **Tester la connectivité** Firebase avec `testFirebaseConnection()`  
3. **Consulter la documentation** Firebase et Supabase officielle
4. **Contacter l'équipe** de développement pour assistance

---

*Documentation générée automatiquement - Version 1.0.0*