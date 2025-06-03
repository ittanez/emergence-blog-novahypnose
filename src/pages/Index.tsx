 // src/pages/Index.tsx - VERSION DE DEBUG TEMPORAIRE
// Remplacez temporairement votre Index.tsx par ceci pour identifier le problème

import React from 'react';

const Index = () => {
  console.log("🔍 RENDU DE LA PAGE INDEX");
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'white', 
      minHeight: '100vh',
      color: 'black',
      fontSize: '18px'
    }}>
      <h1>🔧 MODE DEBUG</h1>
      <p>Si vous voyez ce texte, le problème n'est PAS dans Index.tsx</p>
      
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h2>Informations de debug :</h2>
        <ul>
          <li>✅ React fonctionne</li>
          <li>✅ Le routeur fonctionne</li>
          <li>✅ Les styles de base fonctionnent</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '10px' }}>
        <h3>Prochaines étapes :</h3>
        <p>1. Si vous voyez cette page → Le problème est dans un sous-composant</p>
        <p>2. Si vous ne voyez pas cette page → Le problème est dans le routeur ou App.tsx</p>
      </div>
    </div>
  );
};

export default Index;
