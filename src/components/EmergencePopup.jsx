import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EmergencePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher la popup après 8 secondes
    const popupTimer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    // Rediriger vers le site après 2 minutes (120 secondes)
    const redirectTimer = setTimeout(() => {
      window.location.href = 'https://novahypnose.fr/blog';
    }, 120000);

    return () => {
      clearTimeout(popupTimer);
      clearTimeout(redirectTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    window.open('https://novahypnose.fr/blog', '_blank');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative pointer-events-auto animate-scale-in">
          {/* Bouton fermer */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Image cliquable */}
          <div
            onClick={handleClick}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <img
              src="/EMERGENCES.webp"
              alt="Emergences - Nova Hypnose"
              className="max-w-[90vw] max-h-[80vh] w-auto h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </>
  );
}
