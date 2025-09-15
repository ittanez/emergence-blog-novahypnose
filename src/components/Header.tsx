 import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const menuItems = [
    { label: "Articles", href: "/", external: false },
    { label: "À propos", href: "/about", external: false },
    { label: "FAQ", href: "/faq", external: false },
    { label: "NovaHypnose", href: "https://novahypnose.fr", external: true },
    { label: "Rendez-vous", href: "https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris", external: true },
  ];

  return (
    <header
      className="border-b sticky top-0"
      style={{
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: 'white',
        position: 'sticky',
        top: '0',
        zIndex: 100,
        width: '100%'
      }}
    >
      <div className="container mx-auto px-4" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
        <div className="flex justify-between items-center h-16" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
          <Link to="/" className="flex items-end" style={{ display: 'flex', alignItems: 'flex-end', textDecoration: 'none' }}>
            <h1 className="text-2xl md:text-3xl font-serif font-medium text-nova-800" style={{ 
              fontSize: typeof window !== 'undefined' && window.innerWidth >= 768 ? '1.875rem' : '1.5rem', 
              fontFamily: '"Playfair Display", "Times New Roman", Times, serif', 
              fontWeight: '500', 
              color: '#5f1dc3',
              margin: '0',
              lineHeight: '1.2'
            }}>
              Émergences
            </h1>
            <span className="ml-2 text-sm text-gray-500 mb-1" style={{ 
              marginLeft: '0.5rem', 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              marginBottom: '0.25rem' 
            }}>
              le blog de NovaHypnose
            </span>
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
                  className={item.label === "Rendez-vous" 
                    ? "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors" 
                    : "text-gray-600 hover:text-nova-700 transition-colors"
                  }
                  style={item.label === "Rendez-vous" 
                    ? { 
                        backgroundColor: '#16a34a', 
                        color: 'white', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '0.25rem', 
                        textDecoration: 'none',
                        transition: 'all 0.2s' 
                      } 
                    : { 
                        color: '#4b5563', 
                        textDecoration: 'none', 
                        transition: 'all 0.2s' 
                      }
                  }
                >
                  {item.label}
                </a>
              ) : (
                <Link 
                  key={item.label} 
                  to={item.href} 
                  className="text-gray-600 hover:text-nova-700 transition-colors"
                  style={{ 
                    color: '#4b5563', 
                    textDecoration: 'none', 
                    transition: 'all 0.2s' 
                  }}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-nova-700"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            className="md:hidden pb-4" 
            style={{ 
              paddingBottom: '1rem',
              backgroundColor: 'white',
              borderTop: '1px solid #e5e7eb',
              position: 'relative',
              zIndex: 50
            }}
          >
            <nav className="flex flex-col space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {menuItems.map((item) => (
                item.external ? (
                  <a 
                    key={item.label} 
                    href={item.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={item.label === "Rendez-vous" 
                      ? "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-center" 
                      : "text-gray-600 hover:text-nova-700 transition-colors"
                    }
                    style={item.label === "Rendez-vous" 
                      ? { 
                          backgroundColor: '#16a34a', 
                          color: 'white', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '0.25rem', 
                          textAlign: 'center', 
                          textDecoration: 'none',
                          transition: 'all 0.2s' 
                        } 
                      : { 
                          color: '#4b5563', 
                          textDecoration: 'none', 
                          transition: 'all 0.2s' 
                        }
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link 
                    key={item.label} 
                    to={item.href} 
                    className="text-gray-600 hover:text-nova-700 transition-colors"
                    style={{ 
                      color: '#4b5563', 
                      textDecoration: 'none', 
                      transition: 'all 0.2s' 
                    }}
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
