import { useEffect } from "react";

// Redirection automatique de la page d'accueil vers le blog principal
const Index = () => {
  useEffect(() => {
    // Redirection vers le blog principal
    window.location.href = "https://novahypnose.fr/blog";
  }, []);

  // Afficher un message de chargement pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-serif mb-4">Redirection en cours...</h1>
        <p className="text-gray-600">Vous êtes redirigé vers le blog.</p>
      </div>
    </div>
  );
};

export default Index;
