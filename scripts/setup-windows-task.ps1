# Script PowerShell pour configurer une tâche planifiée Windows
# Exécute les vérifications de sécurité toutes les heures

param(
    [string]$ProjectPath = $PSScriptRoot + "\..",
    [string]$TaskName = "EmergenceBlog-SecurityCheck"
)

Write-Host "🔧 Configuration tâche planifiée Windows..." -ForegroundColor Cyan
Write-Host "📁 Chemin projet: $ProjectPath" -ForegroundColor Gray
Write-Host "📋 Nom tâche: $TaskName" -ForegroundColor Gray

# Vérifier que Node.js est disponible
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js trouvé: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé. Installez Node.js d'abord." -ForegroundColor Red
    exit 1
}

# Créer le script batch pour la tâche
$batchScript = @"
@echo off
cd /d "$ProjectPath"
echo %date% %time% - Début vérification sécurité >> security-check.log
node scripts/periodic-security-check.js >> security-check.log 2>&1
echo %date% %time% - Fin vérification sécurité >> security-check.log
echo. >> security-check.log
"@

$batchPath = "$ProjectPath\scripts\security-check.bat"
$batchScript | Out-File -FilePath $batchPath -Encoding ASCII

Write-Host "📝 Script batch créé: $batchPath" -ForegroundColor Green

# Créer la tâche planifiée
try {
    # Supprimer la tâche existante si elle existe
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

    # Créer nouvelle tâche
    $action = New-ScheduledTaskAction -Execute $batchPath
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Vérification sécurité automatique pour Emergence Blog"

    Write-Host "✅ Tâche planifiée '$TaskName' créée avec succès!" -ForegroundColor Green
    Write-Host "⏰ Fréquence: Toutes les heures" -ForegroundColor Yellow
    Write-Host "📋 Logs: $ProjectPath\security-check.log" -ForegroundColor Yellow

} catch {
    Write-Host "❌ Erreur création tâche planifiée: $_" -ForegroundColor Red
    Write-Host "💡 Essayez d'exécuter PowerShell en tant qu'administrateur" -ForegroundColor Yellow
    exit 1
}

# Test immédiat
Write-Host "`n🧪 Test de la vérification sécurité..." -ForegroundColor Cyan
try {
    Set-Location $ProjectPath
    node scripts/periodic-security-check.js
    Write-Host "✅ Test réussi!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur test: $_" -ForegroundColor Red
}

Write-Host "`n📋 === CONFIGURATION TERMINÉE ===" -ForegroundColor Green
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "• Voir tâches: Get-ScheduledTask | Where-Object {`$_.TaskName -like '*$TaskName*'}" -ForegroundColor Gray
Write-Host "• Démarrer manuellement: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "• Supprimer tâche: Unregister-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "• Voir logs: Get-Content '$ProjectPath\security-check.log' -Tail 20" -ForegroundColor Gray

Write-Host "`n🔔 Pour configurer les notifications Discord/Slack:" -ForegroundColor Cyan
Write-Host "1. Créez un webhook Discord ou Slack" -ForegroundColor Gray
Write-Host "2. Ajoutez l'URL dans un fichier .env:" -ForegroundColor Gray
Write-Host "   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/..." -ForegroundColor Gray
Write-Host "3. Relancez la vérification" -ForegroundColor Gray