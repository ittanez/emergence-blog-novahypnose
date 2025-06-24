#!/usr/bin/env python3
import json
import urllib.request
import urllib.parse
import base64
import time
from datetime import datetime, timedelta
import os

# Configuration
SERVICE_ACCOUNT_FILE = '/home/ittanez/.config/google-analytics/service-account-key.json'
PROPERTY_ID = '462297863'  # ID de la propriété GA4

def get_this_week_dates():
    """Récupère les dates de début et fin de cette semaine"""
    today = datetime.now()
    # Lundi de cette semaine
    start_of_week = today - timedelta(days=today.weekday())
    start_date = start_of_week.strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    return start_date, end_date

def create_jwt_token():
    """Crée un JWT token pour l'authentification Google"""
    try:
        with open(SERVICE_ACCOUNT_FILE, 'r') as f:
            service_account = json.load(f)
        
        # Headers JWT
        header = {
            "alg": "RS256",
            "typ": "JWT"
        }
        
        # Payload JWT
        now = int(time.time())
        payload = {
            "iss": service_account["client_email"],
            "scope": "https://www.googleapis.com/auth/analytics.readonly",
            "aud": "https://oauth2.googleapis.com/token",
            "exp": now + 3600,
            "iat": now
        }
        
        # Note: Pour une implémentation complète, il faudrait signer le JWT avec la clé privée
        # Ici on utilise une approche simplifiée pour le test
        print("🔑 Service Account trouvé:")
        print(f"   Email: {service_account['client_email']}")
        print(f"   Project: {service_account['project_id']}")
        return service_account
        
    except Exception as e:
        print(f"❌ Erreur lecture service account: {e}")
        return None

def get_ga_data_simple():
    """Version simplifiée pour vérifier la configuration"""
    print("🔍 VÉRIFICATION CONFIGURATION GOOGLE ANALYTICS")
    print("=" * 50)
    
    # Dates de cette semaine
    start_date, end_date = get_this_week_dates()
    print(f"📅 Période analysée: {start_date} → {end_date}")
    print()
    
    # Vérifier le service account
    service_account = create_jwt_token()
    if not service_account:
        return
    
    print("✅ Service Account configuré correctement")
    print(f"📊 Propriété GA4 cible: {PROPERTY_ID}")
    print()
    
    # Vérifier les données locales disponibles
    print("🔍 DONNÉES DISPONIBLES LOCALEMENT:")
    print("-" * 30)
    
    # Chercher des données dans Supabase
    try:
        # Lire les types de données disponibles
        types_file = '/home/ittanez/emergence-blog-novahypnose/src/integrations/supabase/types.ts'
        if os.path.exists(types_file):
            print("✅ Base de données Supabase configurée")
            with open(types_file, 'r') as f:
                content = f.read()
                if 'subscribers' in content:
                    print("   - Table abonnés newsletter")
                if 'articles' in content:
                    print("   - Table articles du blog")
                if 'email_logs' in content:
                    print("   - Logs d'emails")
        
        # Vérifier les autres sources de données
        if os.path.exists('/home/ittanez/emergence-blog-novahypnose/build.log'):
            print("✅ Logs de build disponibles")
        
        if os.path.exists('/home/ittanez/emergence-blog-novahypnose/dev.log'):
            print("✅ Logs de développement disponibles")
            
    except Exception as e:
        print(f"⚠️  Erreur vérification données: {e}")
    
    print()
    print("💡 PROCHAINES ÉTAPES:")
    print("1. Vérifier que la propriété GA4 est correctement liée")
    print("2. Installer les dépendances Python pour l'API GA4")
    print("3. Ou utiliser directement l'interface Google Analytics")

if __name__ == "__main__":
    get_ga_data_simple()