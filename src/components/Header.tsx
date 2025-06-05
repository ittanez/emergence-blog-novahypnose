 import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const menuItems = [
    { label: "NovaHypnose", href: "https://novahypnose.fr", external: true },
    { label: "Articles", href: "/", external: false },
    { label: "L'auteur", href: "https://novahypnose.fr/#about", external: true }, // ✅ CHANGÉ
    { label: "Rendez-vous", href: "https://novahypnose.fr/", external: true }, // ✅ CHANGÉ
  ];

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-end">
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-nova-800">Émergences</h1>
            <span className="ml-2 text-sm text-gray-500 mb-1">le blog de NovaHypnose</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              item.external ? (
                <a 
                  key={item.label} 
                  href={item.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-nova-700 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link 
                  key={item.label} 
                  to={item.href} 
                  className="text-gray-600 hover:text-nova-700 transition-colors"
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                item.external ? (
                  <a 
                    key={item.label} 
                    href={item.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-nova-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link 
                    key={item.label} 
                    to={item.href} 
                    className="text-gray-600 hover:text-nova-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
