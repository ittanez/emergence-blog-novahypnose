
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const menuItems = [
    { label: "NovaHypnose", href: "https://novahypnose.fr", external: true },
    { label: "Articles", href: "/", external: false },
    { label: "Catégories", href: "/categories", external: false },
    { label: "À propos", href: "https://novahypnose.fr/#about", external: true },
    { label: "Rendez-vous", href: "https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris", external: true },
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
            <Link to="/admin">
              <Button variant="outline" size="sm" className="ml-2">
                Admin
              </Button>
            </Link>
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
              <Link 
                to="/admin" 
                className="text-gray-600 hover:text-nova-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
