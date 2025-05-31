 import React from "react";
// Commenté temporairement pour résoudre les erreurs de build
// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticles from "./pages/AdminArticles";
import AdminArticleEditor from "./pages/AdminArticleEditor";
import AdminUsers from "./pages/AdminUsers";
import AdminSetup from "./pages/AdminSetup";
import AdminResetPassword from "./pages/AdminResetPassword";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./lib/contexts/AuthContext";
import AdminRoute from "./components/AdminRoute";

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
            {/* Temporairement commenté pour résoudre les erreurs de build */}
            {/* <Toaster /> */}
            {/* <Sonner /> */}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
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
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
