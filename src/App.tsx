
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import { AuthProvider } from "./lib/contexts/AuthContext";
import AdminRoute from "./components/AdminRoute";
import EmergencePopup from "./components/EmergencePopup";

// Lazy load des pages pour réduire le bundle initial
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const VEO3Generator = lazy(() => import("./pages/VEO3Generator"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminArticles = lazy(() => import("./pages/AdminArticles"));
const AdminArticleEditor = lazy(() => import("./pages/AdminArticleEditor"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminSetup = lazy(() => import("./pages/AdminSetup"));
const AdminResetPassword = lazy(() => import("./pages/AdminResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-lg">Chargement...</div>
  </div>
);

// Configuration du client de requête avec retry activé pour une meilleure stabilité
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1, // Permettre une tentative de retry pour les requêtes qui échouent
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  }
});

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <EmergencePopup />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/article/:slug" element={<ArticlePage />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/veo3-generator" element={<VEO3Generator />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route path="/admin/setup" element={<AdminSetup />} />
                  <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/articles" 
                    element={
                      <AdminRoute>
                        <AdminArticles />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/article/:id" 
                    element={
                      <AdminRoute>
                        <AdminArticleEditor />
                      </AdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
