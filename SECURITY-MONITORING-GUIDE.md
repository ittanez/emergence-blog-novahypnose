# 🚨 Guide de Monitoring Sécurité - Emergence Blog

## 📋 Vue d'ensemble

Système de surveillance automatique pour détecter les activités suspectes sur votre projet Supabase.

## 🔧 Installation Rapide

### 1️⃣ **Test Immédiat**
```bash
# Vérification manuelle (à faire maintenant)
node scripts/periodic-security-check.js

# Monitoring en temps réel (optionnel)
node scripts/security-monitor.js
```

### 2️⃣ **Configuration Automatique Windows**
```powershell
# Exécuter en tant qu'administrateur
PowerShell -ExecutionPolicy Bypass -File scripts/setup-windows-task.ps1
```

Cette commande va :
- ✅ Créer une tâche planifiée Windows
- ⏰ Exécuter les vérifications toutes les heures
- 📝 Enregistrer les logs dans `security-check.log`

## 🔔 Configuration Notifications (Optionnel)

### Discord
1. Créer un webhook Discord :
   - Paramètres serveur > Intégrations > Webhooks
   - Copier l'URL du webhook

2. Ajouter dans `.env` :
   ```
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/VOTRE_WEBHOOK
   ```

### Slack
1. Créer une app Slack avec webhook
2. Ajouter dans `.env` :
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/VOTRE_WEBHOOK
   ```

## 🚨 Types d'Alertes

### 🔴 Critiques
- **Nouvel utilisateur admin** créé
- **Modifications des permissions** RLS
- **Accès depuis IPs suspectes**

### 🟠 Importantes
- **Pics d'inscriptions** anormaux (>50/heure)
- **Taux de confirmation** faible (<20%)
- **Usage API** excessif (>1000/heure)

### 🟡 Informatives
- **Modifications d'articles** publiés
- **Nouveaux abonnés** newsletter
- **Activité administrative** normale

## 📊 Dashboard de Monitoring

### Supabase Dashboard
```
URL: https://supabase.com/dashboard/project/akrlyzmfszumibwgocae

Zones à surveiller :
📈 Analytics > Usage
🔐 Authentication > Users & Logs
💾 Database > Tables & Logs
⚙️ Settings > API Usage
```

### Logs Locaux
```bash
# Voir les derniers logs
Get-Content security-check.log -Tail 20

# Surveiller en temps réel
Get-Content security-check.log -Wait
```

## 🎯 Actions en Cas d'Alerte

### 🚨 Alerte Critique
1. **Vérifier immédiatement** le Dashboard Supabase
2. **Révoquer sessions** suspectes si nécessaire
3. **Changer clés API** si compromission suspectée
4. **Contacter équipe** si besoin

### ⚠️ Alerte Importante
1. **Analyser patterns** d'activité
2. **Vérifier logs** détaillés
3. **Ajuster règles** si faux positif
4. **Surveiller évolution**

## 🔧 Commandes Utiles

### Gestion Tâche Windows
```powershell
# Voir tâches actives
Get-ScheduledTask | Where-Object {$_.TaskName -like "*EmergenceBlog*"}

# Démarrer manuellement
Start-ScheduledTask -TaskName "EmergenceBlog-SecurityCheck"

# Supprimer tâche
Unregister-ScheduledTask -TaskName "EmergenceBlog-SecurityCheck"
```

### Tests Manuels
```bash
# Test complet
node scripts/periodic-security-check.js

# Mode démon (surveillance continue)
node scripts/periodic-security-check.js --daemon

# Test alerte (si webhook configuré)
curl -X POST https://akrlyzmfszumibwgocae.supabase.co/functions/v1/security-alerts/test-alert
```

## 📈 Personnalisation

### Modifier Seuils d'Alerte
Éditez `scripts/periodic-security-check.js` :

```javascript
// Exemples de seuils personnalisables
const THRESHOLDS = {
  maxNewSubscribers: 50,        // Par heure
  suspiciousRatio: 0.8,         // 80% non confirmés
  maxAPIcalls: 1000,            // Par heure
  maxFailedLogins: 5            // En 5 minutes
};
```

### Ajouter Nouvelles Vérifications
```javascript
async checkCustomMetric() {
  // Votre logique de vérification
  const { data } = await supabase.from('your_table').select('*');

  if (/* condition suspecte */) {
    await this.sendAlert({
      type: 'medium',
      title: 'VOTRE ALERTE',
      message: 'Description du problème',
      action: 'Action recommandée'
    });
  }
}
```

## 🛡️ Bonnes Pratiques

### Sécurité
- ✅ **Vérifiez quotidiennement** les rapports
- ✅ **Gardez logs** pendant 30 jours minimum
- ✅ **Testez alertes** mensuellement
- ✅ **Mettez à jour seuils** selon votre usage

### Performance
- ⚡ **Limitez fréquence** vérifications (max 1/heure)
- 📊 **Archivez anciens logs** régulièrement
- 🔧 **Optimisez requêtes** si base grandit

## 📞 Support

### En cas de problème :
1. **Vérifiez logs** : `security-check.log`
2. **Testez connexion** Supabase
3. **Validez configuration** webhooks
4. **Consultez Dashboard** Supabase

### Contacts Utiles :
- **Supabase Support** : https://supabase.com/support
- **Documentation** : https://supabase.com/docs

---

**✅ Votre système de monitoring est maintenant opérationnel !**

Pour toute question, consultez les logs ou testez manuellement les scripts.