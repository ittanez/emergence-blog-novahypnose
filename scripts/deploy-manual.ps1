# Script de déploiement MANUEL sur GitHub Pages
# Usage: PowerShell -ExecutionPolicy Bypass -File scripts/deploy-manual.ps1

param(
    [switch]$Force,
    [switch]$Preview
)

Write-Host "🚀 === DÉPLOIEMENT MANUEL GITHUB PAGES ===" -ForegroundColor Cyan
Write-Host "📁 Projet: emergence-blog-novahypnose" -ForegroundColor Gray
Write-Host "⏰ Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Vérification du répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Exécutez ce script depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Vérification Git
try {
    $gitStatus = git status --porcelain
    if ($gitStatus -and -not $Force) {
        Write-Host "⚠️  Attention: Des fichiers non commitées détectés" -ForegroundColor Yellow
        Write-Host "Fichiers modifiés:" -ForegroundColor Yellow
        git status --short
        Write-Host ""
        Write-Host "Options:" -ForegroundColor White
        Write-Host "1. Commiter vos changements d'abord" -ForegroundColor Gray
        Write-Host "2. Utiliser -Force pour déployer quand même" -ForegroundColor Gray

        if (-not $Force) {
            $response = Read-Host "Continuer quand même ? (y/N)"
            if ($response -ne "y" -and $response -ne "Y") {
                Write-Host "❌ Déploiement annulé" -ForegroundColor Red
                exit 1
            }
        }
    }
} catch {
    Write-Host "❌ Erreur Git: $_" -ForegroundColor Red
    exit 1
}

# Vérification branche
try {
    $currentBranch = git branch --show-current
    Write-Host "📋 Branche actuelle: $currentBranch" -ForegroundColor White

    if ($currentBranch -ne "main") {
        Write-Host "⚠️  Attention: Vous n'êtes pas sur la branche 'main'" -ForegroundColor Yellow
        $response = Read-Host "Continuer quand même ? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "❌ Déploiement annulé" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Erreur vérification branche: $_" -ForegroundColor Red
    exit 1
}

# Mode Preview
if ($Preview) {
    Write-Host "👁️  === MODE PREVIEW ===" -ForegroundColor Yellow
    Write-Host "Simulation du déploiement (aucune action réelle)" -ForegroundColor Yellow
    Write-Host ""

    Write-Host "Étapes qui seraient exécutées:" -ForegroundColor White
    Write-Host "1. ✅ Build local du projet" -ForegroundColor Green
    Write-Host "2. ✅ Push des changements sur GitHub" -ForegroundColor Green
    Write-Host "3. ✅ Déclenchement manuel GitHub Actions" -ForegroundColor Green
    Write-Host "4. ✅ Déploiement sur GitHub Pages" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour un déploiement réel, relancez sans -Preview" -ForegroundColor White
    exit 0
}

# Test build local
Write-Host "🔧 Test du build local..." -ForegroundColor Cyan
try {
    npm run build | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build local réussi" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec du build local" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur build: $_" -ForegroundColor Red
    exit 1
}

# Confirmation finale
Write-Host ""
Write-Host "🎯 === CONFIRMATION DÉPLOIEMENT ===" -ForegroundColor Yellow
Write-Host "Cette action va:" -ForegroundColor White
Write-Host "• Pousser le code sur GitHub" -ForegroundColor Gray
Write-Host "• Déclencher le déploiement sur GitHub Pages" -ForegroundColor Gray
Write-Host "• Rendre le site public sur: https://ittanez.github.io/emergence-blog-novahypnose/" -ForegroundColor Gray
Write-Host ""

$confirmation = Read-Host "Confirmer le déploiement ? Tapez 'DEPLOY' pour continuer"
if ($confirmation -ne "DEPLOY") {
    Write-Host "❌ Déploiement annulé (confirmation incorrecte)" -ForegroundColor Red
    exit 1
}

# Push sur GitHub
Write-Host ""
Write-Host "📤 Push sur GitHub..." -ForegroundColor Cyan
try {
    git push origin $currentBranch
    Write-Host "✅ Code poussé sur GitHub" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur push GitHub: $_" -ForegroundColor Red
    exit 1
}

# Instructions pour déclenchement manuel
Write-Host ""
Write-Host "🎯 === DÉCLENCHEMENT MANUEL REQUIS ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Étapes suivantes à faire sur GitHub.com:" -ForegroundColor White
Write-Host ""
Write-Host "1. Aller sur: https://github.com/ittanez/emergence-blog-novahypnose/actions" -ForegroundColor Cyan
Write-Host "2. Cliquer sur 'Deploy to GitHub Pages' (workflow)" -ForegroundColor Cyan
Write-Host "3. Cliquer sur 'Run workflow' (bouton bleu)" -ForegroundColor Cyan
Write-Host "4. Dans le champ, taper exactement: DEPLOY" -ForegroundColor Cyan
Write-Host "5. Cliquer 'Run workflow'" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏰ Le déploiement prendra 2-5 minutes" -ForegroundColor Yellow
Write-Host "🌐 Site final: https://ittanez.github.io/emergence-blog-novahypnose/" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Script terminé avec succès!" -ForegroundColor Green

# Optionnel: Ouvrir GitHub dans le navigateur
$openGitHub = Read-Host "Ouvrir GitHub Actions dans le navigateur ? (y/N)"
if ($openGitHub -eq "y" -or $openGitHub -eq "Y") {
    Start-Process "https://github.com/ittanez/emergence-blog-novahypnose/actions"
}