import { useEffect } from 'react';

interface ExternalRedirectProps {
  to: string;
}

/**
 * Composant pour rediriger vers une URL externe
 */
const ExternalRedirect = ({ to }: ExternalRedirectProps) => {
  useEffect(() => {
    // Redirection immédiate vers l'URL externe
    window.location.replace(to);
  }, [to]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg mb-4">Redirection vers le blog principal...</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default ExternalRedirect;
