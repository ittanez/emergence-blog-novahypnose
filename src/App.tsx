import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

import Index from "@/pages/Index";
import ArticlePage from "@/pages/ArticlePage";
import CategoryPage from "@/pages/CategoryPage";
import MentionsLegales from "@/pages/MentionsLegales";
import Custom404 from "@/pages/Custom404";
import AdminLogin from "@/pages/admin/AdminLogin";

// Composant pour forcer HTTPS en production et faire les redirections
function AppRedirects() {
  const location = useLocation();
  
  useEffect(() => {
    // En production seulement, rediriger HTTP vers HTTPS
    if (
      window.location.protocol === "http:" &&
      !window.location.href.includes("localhost") &&
      !window.location.href.includes("127.0.0.1")
    ) {
      window.location.replace(
        `https://${window.location.hostname}${window.location.pathname}${window.location.search}`
      );
    }
  }, [location]);
  
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AppRedirects />
      
      <Routes>
        {/* Route principale */}
        <Route path="/" element={<Index />} />
        
        {/* Routes essentielles du blog */}
        <Route path="/article/:slug" element={<ArticlePage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        
        {/* Page d'erreur 404 personnalisée */}
        <Route path="/404" element={<Custom404 />} />
        
        {/* Route de connexion admin simple */}
        <Route path="/admin-blog" element={<AdminLogin />} />
        
        {/* Redirection 404 pour tout le reste */}
        <Route path="*" element={<Custom404 />} />
      </Routes>
      
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
