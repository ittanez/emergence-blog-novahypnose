
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/contexts/AuthContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAdmin } = useAuth();
  
  return (
    <footer className="bg-gray-50 border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-end">
              <h2 className="text-xl font-serif font-medium text-nova-800">Émergences</h2>
              <span className="ml-2 text-xs text-gray-500 mb-0.5">le blog de NovaHypnose</span>
            </Link>
            <p className="mt-2 text-sm text-gray-600 max-w-md">
              Regards sur l'hypnose, la transformation intérieure et le bien-être
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Explorer</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-nova-700 transition-colors text-sm">
                    Articles
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 hover:text-nova-700 transition-colors text-sm">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-600 hover:text-nova-700 transition-colors text-sm">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/sitemap" className="text-gray-600 hover:text-nova-700 transition-colors text-sm">
                    Plan du site
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">NovaHypnose</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a 
                    href="https://novahypnose.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-nova-700 transition-colors text-sm"
                  >
                    NovaHypnose
                  </a>
                </li>
                <li>
                  <a 
                    href="https://peur-de-parler-en-public.novahypnose.fr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-nova-700 transition-colors text-sm"
                  >
                    Peur de parler en public
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.resalib.fr/praticien/47325-alain-zenatti-hypnotherapeute-paris" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-nova-700 transition-colors text-sm"
                  >
                    Rendez-vous
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Ressources</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a 
                    href="https://fr.wikipedia.org/wiki/Hypnothérapie" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-nova-700 transition-colors text-sm"
                  >
                    Hypnothérapie - Wikipédia
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.cfhtb.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-nova-700 transition-colors text-sm"
                  >
                    CFHTB
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.hypnose-ericksonienne.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-nova-700 transition-colors text-sm"
                  >
                    Hypnose Ericksonienne
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-center text-xs text-gray-500 mb-4 md:mb-0">
            © {currentYear} NovaHypnose – Tous droits réservés
          </p>
          
          <div className="admin-link text-center">
            <Link 
              to="/admin" 
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors opacity-70"
              style={{ textDecoration: 'none' }}
            >
              Administration
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
