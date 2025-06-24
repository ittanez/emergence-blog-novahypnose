#!/bin/bash

# Script pour récupérer les données de trafic NOVAHYPNOSE.FR via l'API Google Analytics

echo "🔍 Récupération des données de trafic cette semaine..."
echo "=================================================="

# Dates pour cette semaine
START_DATE=$(date -d "monday this week" +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)

echo "📅 Période: $START_DATE → $END_DATE"
echo ""

# Obtenir le token d'accès OAuth2
ACCESS_TOKEN=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_email": "nova-hypnose-ga4@claude-448014.iam.gserviceaccount.com",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNLFnzx0EPH+Ex\noHhGucKII8Bn8TDTi6dzkRUJ/ZUn24IQy+LNw2iKgV0Ysyuhe4l+2b4BVNRCoE7e\nSBPFg7C9gRfMmgoeRxd4yr9c0NO0yIzMOVAHjM+JMDWDa1WJlp2wqAuw1vuwX5eW\nqbvBKDd0iRpezj4TgWkOqi4LMjbbOywUOlAZ6es/tCgYce+nCeV/WbXosU69hVrw\nlNGYth7nMQl3jZoCFsoF23BksYDUIcKab5B59AxEE5y+o9AuDUwYbbfE7vzjyqBp\nTYyHIA2rbeaYmQ7NrUdjXMRMcgBygPlHarRyKbeGfWQUO/y1m4j9HuKeNnmWNlvf\nCKHP16vXAgMBAAECggEAMCg9Us1NdXXXnxTZtkwKn3a4xgzkF3s7ihIfHJGzLUBG\nBpg8e2xmwL+9cLs5PfVnn+kOwnQ9QAgtitnjHiSbWteOlP0A6/tmxHjeMrRnRJMg\nDR1Urfj8i2hP3zFVye4axCilWdQUDmFZjMj5I0zDu2wkzuTcyCpDVOhX11PpcUpF\n9IK5Tb/yZBBI4+fRTZvQUuR/UN5C858YhYQ/twfaaFqBA7yLAm6DMrCrMbdkdcxH\nu9nBM/whanQLNxBoJQLdemn9hPW0c5Z+teJpFi3xJjN5n3+iu9XRCpYgajybSL/j\nu5pml/bP1SzUypbmr6t1cQGcx3Wv1kYSLojaVJV8WQKBgQDzl0uKN7wAv6bVC7Ym\nE1ZW3dolGfPVYDh19Jzvs4tR1KBz5X4EbveUdzhFd5628zmMQ2TBIMlza2VFXaBb\no2UCLC6f3qL0sDcIWLjyYFmpoqNJ3xq3wToN9XZ9hYysEKpz/n6sTlvhpEpmS4qm\nnmLgV3QwLH3UiKXl88oZN6fQnwKBgQDXoAuCTLPVjCGlOefT55wgPTcAdoJ/LtFS\ntptn2kYP6a85k4hi9SUGBf+CZDsRfLVLbpMZ4HZwB6EsqivEiL5MYZmexQAYQaPh\nwCEwOMgMrTT1mEeO3grQCyqVsElzA8O5NXtJDApZqE5m2RlLy9iSmuG2MiPVMQOP\nNqQ+wxPByQKBgQDrxkN9s1iruNV4XO+fhxQI3I+rXaVfoNTFh1DnyndNa2srArSp\nAedtsr+qrY/YMTBAjXLWZC/ZIdhR/b+bM1ovcihm4Y4FHRMHZykMoSnoQd2fQO2R\nctwIatCXyk5QtYjm4SwnB2lzzBufS/sWLzQxRTTW9BmPP/yjyQaSxgYOrQKBgGWv\nSf4moeAg93Ttu9AIt23UsG19dcj4kSpKhzsQil3SvBmQ446XQOB4T6h0EA8NGon6\nGVDos7HdRzrC/WTvf56RoFppWMQXoGtDqeMNw/mGbSUsrQJI4ByAR5LT0a91pQVg\nnUUzcmYZou+Jjg5akUWB2NONDazqMl2FTStz34tRAoGBAOEgetmHd56HTMfPrM0y\nN9+1RCuSSqF5Xi0+PabaEMeVVJPixUvetr+6jaPHDln++0yxxUlXFGn0Fu0f6mXF\n0hJsHQ0cYDmJLc39YFUfDCOZypI/fD3EzXS7fdnlsu7jQ61cafBpusQiiuKSPXyu\nJ3FI/MEzCjTmB8rHrCfn3bxT\n-----END PRIVATE KEY-----\n",
    "scope": "https://www.googleapis.com/auth/analytics.readonly",
    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer"
  }' | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Impossible d'obtenir le token d'accès"
  echo "💡 Vérification des credentials Google Analytics..."
  
  # Vérifier les informations du service account
  echo ""
  echo "🔑 Service Account configuré:"
  cat /home/ittanez/.config/google-analytics/service-account-key.json | jq -r '{
    client_email: .client_email,
    project_id: .project_id,
    client_id: .client_id
  }'
  
  exit 1
fi

echo "✅ Token d'accès obtenu"
echo "🔗 Connexion à Google Analytics..."
echo ""

# ID de propriété GA4 (à ajuster selon votre propriété)
PROPERTY_ID="462297863"

# Requête pour obtenir les données de trafic
curl -s -X POST \
  "https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"dateRanges\": [{
      \"startDate\": \"$START_DATE\",
      \"endDate\": \"$END_DATE\"
    }],
    \"dimensions\": [
      {\"name\": \"date\"},
      {\"name\": \"country\"},
      {\"name\": \"deviceCategory\"}
    ],
    \"metrics\": [
      {\"name\": \"sessions\"},
      {\"name\": \"users\"},
      {\"name\": \"pageviews\"},
      {\"name\": \"bounceRate\"}
    ]
  }" | jq '
    if .error then
      "❌ Erreur API: " + .error.message
    else
      "📊 DONNÉES DE TRAFIC - CETTE SEMAINE",
      "=" * 40,
      "",
      if (.rows | length) > 0 then
        (
          (.rows | map(.metricValues[0].value | tonumber) | add) as $total_sessions |
          (.rows | map(.metricValues[1].value | tonumber) | add) as $total_users |
          (.rows | map(.metricValues[2].value | tonumber) | add) as $total_pageviews |
          
          "🎯 RÉSUMÉ GLOBAL:",
          "   Sessions totales: \($total_sessions)",
          "   Utilisateurs uniques: \($total_users)", 
          "   Pages vues: \($total_pageviews)",
          "",
          "📅 DÉTAIL PAR JOUR:",
          (.rows | group_by(.dimensionValues[0].value) | 
           map({
             date: .[0].dimensionValues[0].value,
             sessions: (map(.metricValues[0].value | tonumber) | add),
             users: (map(.metricValues[1].value | tonumber) | add)
           }) |
           sort_by(.date) |
           map("   \(.date): \(.sessions) sessions, \(.users) users")[]
          ),
          "",
          "🌍 TOP PAYS:",
          (.rows | group_by(.dimensionValues[1].value) | 
           map({
             country: .[0].dimensionValues[1].value,
             sessions: (map(.metricValues[0].value | tonumber) | add)
           }) |
           sort_by(.sessions) | reverse | .[0:5] |
           map("   \(.country): \(.sessions) sessions")[]
          )
        )
      else
        "⚠️  Aucune donnée trouvée pour cette période"
      end
    end
  ' -r

echo ""
echo "✅ Récupération terminée"