 import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";

import Index from "@/pages/Index";
import ArticlePage from "@/pages/ArticlePage"; // ✅ AJOUTÉ
import CategoryPage from "@/pages/CategoryPage"; // ✅ AJOUTÉ
import MentionsLegales from "@/pages/MentionsLegales";
import Custom404 from "@/pages/Custom404";
import ContentLayout from "./components/layout/ContentLayout";
import PrivateRoute from "./components/auth/PrivateRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDirect from "./pages/admin/AdminDirect";
import AdminLogin from "./pages/admin/AdminLogin";

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
    <AuthProvider>
      <BrowserRouter>
        <AppRedirects />
        
        <Routes>
          {/* Route principale */}
          <Route path="/" element={<Index />} />
          
          {/* ✅ ROUTES ESSENTIELLES AJOUTÉES */}
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          
          {/* Page d'erreur 404 personnalisée */}
          <Route path="/404" element={<Custom404 />} />
          
          {/* Route de connexion admin */}
          <Route path="/admin-blog" element={<AdminLogin />} />
          
          {/* Routes admin */}
          <Route
            path="/admin-blog/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-blog/direct"
            element={
              <PrivateRoute>
                <AdminDirect />
              </PrivateRoute>
            }
          />
          
          {/* Au lieu d'une route * vague, rediriger spécifiquement vers la page 404 */}
          <Route path="*" element={<Custom404 />} />
        </Routes>
        
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
