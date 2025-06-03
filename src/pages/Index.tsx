// src/pages/Index.tsx - CORRECTION RAPIDE

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Book, Users, MessageCircle, Star, Search, Filter, TrendingUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Hero from "@/components/Hero";
import Pagination from "@/components/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 🔧 IMPORT CORRIGÉ - utiliser getAllArticles au lieu de getAllArticlesNoPagination
import { getAllArticles, getAllCategories } from "@/lib/services/articleService";

import ArticleCard from "@/components/ArticleCard";
import { useStructuredData } from "@/hooks/useStructuredData";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  
  const articlesPerPage = 12;

  // 📊 Données structurées pour le SEO
  useStructuredData({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "NovaHypnose - Blog d'hypnothérapie",
    "description": "Découvrez nos articles sur l'hypnothérapie, la gestion du stress, et le développement personnel.",
    "url": "https://novahypnose.fr",
    "author": {
      "@type": "Organization",
      "name": "NovaHypnose"
    }
  });

  // Chargement des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getAllCategories();
        if (error) throw error;
        if (data) {
          setCategories(data.map(cat => ({ name: cat.name || cat })));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
      }
    };

    fetchCategories();
  }, []);

  // 🔧 CHARGEMENT DES ARTICLES AVEC PAGINATION
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        
        // 📝 Utiliser getAllArticles avec pagination et filtre pour articles publiés
        const { data, error, totalCount: count } = await getAllArticles({
          search: searchTerm,
          category: selectedCategory,
          page: currentPage,
          limit: articlesPerPage,
          includeDrafts: false, // ❌ Ne pas inclure les brouillons sur la page publique
          publishedOnly: true   // ✅ Seulement les articles publiés
        });
          
        if (error) {
          console.error("Erreur lors de la récupération des articles:", error);
          throw error;
        }

        if (data) {
          // 🔄 Tri selon l'option sélectionnée
          let sortedArticles = [...data];
          
          switch (sortBy) {
            case "oldest":
              sortedArticles.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              break;
            case "title":
              sortedArticles.sort((a, b) => a.title.localeCompare(b.title));
              break;
            case "featured":
              sortedArticles.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
              break;
            case "newest":
            default:
              sortedArticles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              break;
          }
          
          setArticles(sortedArticles);
          setTotalCount(count || 0);
          setTotalPages(Math.ceil((count || 0) / articlesPerPage));
        } else {
          setArticles([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des articles:", error);
        setArticles([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [searchTerm, selectedCategory, currentPage, sortBy]);

  // Reste du composant inchangé...
  // (gardez le reste de votre code Index.tsx tel quel)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Votre contenu existant... */}
    </div>
  );
};

export default Index;
