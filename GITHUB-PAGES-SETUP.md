# 🚀 Guide de Déploiement MANUEL GitHub Pages

## 🌐 Qu'est-ce que GitHub Pages ?

GitHub Pages est un service gratuit qui transforme votre dépôt GitHub en site web accessible publiquement :

- **URL de votre site :** `https://ittanez.github.io/emergence-blog-novahypnose/`
- **Déploiement MANUEL uniquement** (vous contrôlez quand publier)
- **Hébergement gratuit** avec certificat SSL
- **CDN global** pour des performances optimales

## 🎯 Déploiement Contrôlé

**IMPORTANT :** Le déploiement ne se fait PAS automatiquement. Vous décidez quand publier votre site.

## 📋 Étapes de Configuration

### 1️⃣ Activer GitHub Pages

1. **Aller sur votre dépôt :** https://github.com/ittanez/emergence-blog-novahypnose
2. **Cliquer sur "Settings"** (onglet en haut de la page)
3. **Dans le menu de gauche, cliquer "Pages"**
4. **Dans "Source", sélectionner "GitHub Actions"**
5. **Cliquer "Save"**

### 2️⃣ Configurer les Secrets

**IMPORTANT :** Pour que votre site fonctionne avec Supabase, ajoutez vos clés :

1. **Aller dans Settings > Secrets and variables > Actions**
2. **Cliquer "New repository secret"**
3. **Ajouter le premier secret :**
   - **Name:** `VITE_SUPABASE_URL`
   - **Secret:** `https://akrlyzmfszumibwgocae.supabase.co`
   - Cliquer "Add secret"

4. **Ajouter le deuxième secret :**
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Secret:** `[VOTRE_CLE_ANON_SUPABASE_ICI]` (trouvable dans Settings > API de votre projet Supabase)
   - Cliquer "Add secret"

### 3️⃣ Déploiement MANUEL

**VOUS contrôlez quand publier !** Deux méthodes disponibles :

#### Option A: Script PowerShell (Recommandé)
```powershell
# Test sans déployer (simulation)
PowerShell -ExecutionPolicy Bypass -File scripts/deploy-manual.ps1 -Preview

# Déploiement réel
PowerShell -ExecutionPolicy Bypass -File scripts/deploy-manual.ps1
```

#### Option B: Interface GitHub
1. **Aller sur :** https://github.com/ittanez/emergence-blog-novahypnose/actions
2. **Cliquer sur :** "Deploy to GitHub Pages"
3. **Cliquer sur :** "Run workflow" (bouton bleu)
4. **Taper exactement :** `DEPLOY` dans le champ
5. **Cliquer :** "Run workflow"

**⚠️ IMPORTANT :** Sans cette action manuelle, RIEN ne sera publié !

## 🔍 Vérifier le Déploiement

### Suivre le Processus :
1. **Aller dans l'onglet "Actions"** de votre dépôt GitHub
2. **Voir le workflow "Deploy to GitHub Pages"** en cours
3. **Attendre que toutes les étapes soient vertes** ✅

### Accéder au Site :
- **URL finale :** `https://ittanez.github.io/emergence-blog-novahypnose/`
- **Peut prendre 5-10 minutes** pour la première activation

## 🎯 Avantages de GitHub Pages

### ✅ Gratuit et Fiable
- **Hébergement illimité** pour les projets publics
- **99.9% de disponibilité** garanti par GitHub
- **CDN mondial** pour des performances optimales

### ✅ Automatisé
- **Déploiement automatique** à chaque modification
- **Pas de serveur à gérer**
- **Mises à jour en temps réel**

### ✅ Sécurisé
- **HTTPS par défaut** (certificat SSL gratuit)
- **Protection DDoS** incluse
- **Sauvegarde automatique** par GitHub

## 🔧 Configuration Technique

### Variables d'Environnement
Le site utilise les secrets GitHub pour :
- `VITE_SUPABASE_URL` - Connexion à la base de données
- `VITE_SUPABASE_ANON_KEY` - Authentification Supabase

### Build Configuration
- **Framework :** Vite + React
- **Output :** Dossier `./dist`
- **Base URL :** `/emergence-blog-novahypnose/` (en production)
- **Assets :** Optimisés et minifiés

## 🚨 Troubleshooting

### Si le site ne fonctionne pas :

1. **Vérifier les secrets :**
   - Settings > Secrets > Actions
   - Confirmer que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont présents

2. **Vérifier le workflow :**
   - Onglet "Actions" > dernier workflow
   - Regarder les logs en cas d'erreur

3. **Vérifier les paramètres Pages :**
   - Settings > Pages
   - Source : "GitHub Actions" sélectionné

### Erreurs communes :
- **404 sur les routes :** Normal pour une SPA, Vite gère le routing côté client
- **Erreur Supabase :** Vérifier que les secrets sont corrects
- **CSS manquant :** Attendre quelques minutes pour la propagation CDN

## 🎉 Félicitations !

Une fois configuré, votre site sera accessible publiquement et se mettra à jour automatiquement à chaque modification de code !

**URL finale :** https://ittanez.github.io/emergence-blog-novahypnose/