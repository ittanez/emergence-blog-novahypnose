
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import AdminLogin from "./pages/AdminLogin";
import AdminSetup from "./pages/AdminSetup";
import AdminResetPassword from "./pages/AdminResetPassword";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./lib/contexts/AuthContext";
import AdminRoute from "./components/AdminRoute";

// Page provisoire pour le tableau de bord admin
const AdminDashboard = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-6">Tableau de bord administrateur</h1>
    <p>Bienvenue dans l'interface d'administration du blog.</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
