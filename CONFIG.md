# 🔧 Configuration du Projet

## 📋 Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```bash
# Configuration Supabase (OBLIGATOIRE)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Alertes Sécurité (OPTIONNEL)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK
ADMIN_EMAIL=your-email@example.com

# Configuration Avancée (OPTIONNEL)
SECURITY_WEBHOOK_URL=https://your-project-id.supabase.co/functions/v1/security-alerts
EMAIL_SERVICE_URL=https://api.emailjs.com/api/v1.0/email/send
```

## 🚀 Démarrage Rapide

1. **Cloner le projet :**
   ```bash
   git clone https://github.com/YOUR_USERNAME/emergence-blog-novahypnose.git
   cd emergence-blog-novahypnose
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer l'environnement :**
   ```bash
   # Créer le fichier .env avec vos vraies valeurs Supabase
   echo "VITE_SUPABASE_URL=https://your-project-id.supabase.co" > .env
   echo "VITE_SUPABASE_ANON_KEY=your-anon-key-here" >> .env
   ```

4. **Démarrer le serveur de développement :**
   ```bash
   npm run dev
   ```

## 🔐 Configuration Supabase

### Obtenir vos clés Supabase :
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **Settings > API**
4. Copier :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon key** → `VITE_SUPABASE_ANON_KEY`

### Base de données :
Le projet utilise les tables suivantes :
- `articles` - Articles du blog
- `categories` - Catégories d'articles
- `subscribers` - Abonnés newsletter
- `admin_users` - Utilisateurs administrateurs

## 🚨 Monitoring Sécurité

Pour activer la surveillance automatique :

1. **Test manuel :**
   ```bash
   node scripts/periodic-security-check.js
   ```

2. **Surveillance continue :**
   ```bash
   # Windows PowerShell (en tant qu'administrateur)
   PowerShell -ExecutionPolicy Bypass -File scripts/setup-windows-task.ps1
   ```

3. **Notifications Discord/Slack :**
   - Ajouter les webhooks dans `.env`
   - Les alertes seront envoyées automatiquement

## 📦 Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run lint         # Vérification ESLint
npm run preview      # Aperçu du build
```

## 🛡️ Sécurité

Le projet inclut :
- ✅ Row Level Security (RLS) activé
- ✅ Pre-commit hooks anti-secrets
- ✅ Monitoring automatique des accès
- ✅ Alertes en temps réel
- ✅ Protection contre l'exposition de clés

## 📚 Documentation

- `SECURITY-MONITORING-GUIDE.md` - Guide complet de sécurité
- `AUDIT-SEO-COMPLET.md` - Audit SEO détaillé
- `scripts/` - Outils de monitoring et sécurité