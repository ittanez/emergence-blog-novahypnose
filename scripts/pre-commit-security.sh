#!/bin/bash
#
# Pre-commit hook pour empêcher l'exposition de secrets
# Place ce fichier dans .git/hooks/pre-commit et rends-le exécutable
#

echo "🔒 Vérification sécurité pre-commit..."

# Vérifier les fichiers à commiter
FILES=$(git diff --cached --name-only)

# Patterns de secrets à détecter
SECRET_PATTERNS=(
    "-----BEGIN.*PRIVATE KEY-----"
    "eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*"  # JWT tokens
    "AKIA[0-9A-Z]{16}"  # AWS Access Key
    "AIza[0-9A-Za-z\\-_]{35}"  # Google API Key
    "sk_live_[0-9a-zA-Z]{24}"  # Stripe Live Key
    "rk_live_[0-9a-zA-Z]{24}"  # Stripe Restricted Key
    "xoxb-[0-9]{11,13}-[0-9]{11,13}-[0-9a-zA-Z]{24}"  # Slack Bot Token
)

# Extensions de fichiers à ignorer
IGNORE_EXTENSIONS=("jpg" "jpeg" "png" "gif" "svg" "ico" "woff" "woff2" "ttf" "otf")

# Fonction pour vérifier si l'extension doit être ignorée
should_ignore_file() {
    local file="$1"
    local ext="${file##*.}"
    for ignore_ext in "${IGNORE_EXTENSIONS[@]}"; do
        if [[ "$ext" == "$ignore_ext" ]]; then
            return 0
        fi
    done
    return 1
}

SECRETS_FOUND=false

for file in $FILES; do
    # Ignorer les fichiers binaires et certaines extensions
    if should_ignore_file "$file" || [[ "$file" == *"node_modules"* ]]; then
        continue
    fi

    # Vérifier si le fichier existe (il pourrait avoir été supprimé)
    if [[ ! -f "$file" ]]; then
        continue
    fi

    # Chercher les patterns de secrets
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -qE "$pattern" "$file"; then
            echo "❌ SECRET DÉTECTÉ dans $file"
            echo "   Pattern: $pattern"
            SECRETS_FOUND=true
        fi
    done

    # Vérifications spécifiques
    if [[ "$file" == *.env* ]]; then
        echo "❌ Fichier .env détecté: $file"
        echo "   Les fichiers .env ne doivent jamais être commitées"
        SECRETS_FOUND=true
    fi

    if [[ "$file" == *"service-account"* ]] || [[ "$file" == *"-key.json" ]]; then
        echo "❌ Fichier de clé détecté: $file"
        SECRETS_FOUND=true
    fi
done

# Vérifier les messages de commit suspects
COMMIT_MSG=$(git log --format=%B -n 1 HEAD 2>/dev/null || echo "")
SUSPECT_WORDS=("password" "secret" "key" "token" "credential")

for word in "${SUSPECT_WORDS[@]}"; do
    if echo "$COMMIT_MSG" | grep -iq "$word"; then
        echo "⚠️  Message de commit suspect détecté (contient '$word')"
        echo "   Vérifiez que vous ne décrivez pas l'exposition d'un secret"
    fi
done

if [[ "$SECRETS_FOUND" == true ]]; then
    echo ""
    echo "🚨 COMMIT BLOQUÉ - Secrets détectés!"
    echo ""
    echo "Actions recommandées:"
    echo "1. Supprimer les secrets des fichiers"
    echo "2. Ajouter les patterns au .gitignore"
    echo "3. Utiliser des variables d'environnement"
    echo "4. Si les secrets sont déjà commitées, nettoyer l'historique"
    echo ""
    exit 1
fi

echo "✅ Aucun secret détecté - Commit autorisé"
exit 0