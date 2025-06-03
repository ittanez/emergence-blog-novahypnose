 // src/pages/Index.tsx - TEST PROGRESSIF DES COMPOSANTS

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// 🧪 IMPORTS UN PAR UN POUR TESTER
// import Hero from "@/components/Hero";  // ❌ Commenté pour test
// import ArticleCard from "@/components/ArticleCard";  // ❌ Commenté pour test
// import Pagination from "@/components/Pagination";  // ❌ Commenté pour test

import { getAllArticles, getAllCategories } from "@/lib/services/articleService";

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

  console.log("🔍 INDEX: Début du rendu, état:", {
    isLoading,
    articlesCount: articles.length,
    categoriesCount: categories.length
  });

  // Chargement des catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("📂 INDEX: Début chargement catégories");
        const { data, error } = await getAllCategories();
        if (error) throw error;
        if (data) {
          setCategories(data.map(cat => ({ name: cat.name || cat })));
          console.log("✅ INDEX: Catégories chargées:", data.length);
        }
      } catch (error) {
        console.error("❌ INDEX: Erreur catégories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Chargement des articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        console.log("📰 INDEX: Début chargement articles");
        
        const { data, error, totalCount: count } = await getAllArticles({
          search: searchTerm,
          category: selectedCategory,
          page: currentPage,
          limit: articlesPerPage,
          includeDrafts: false,
          publishedOnly: true
        });
          
        if (error) {
          console.error("❌ INDEX: Erreur articles:", error);
          throw error;
        }

        if (data) {
          console.log("✅ INDEX: Articles chargés:", data.length);
          setArticles(data);
          setTotalCount(count || 0);
          setTotalPages(Math.ceil((count || 0) / articlesPerPage));
        } else {
          setArticles([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("❌ INDEX: Erreur chargement articles:", error);
        setArticles([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
        console.log("🏁 INDEX: Chargement terminé");
      }
    };

    fetchArticles();
  }, [searchTerm, selectedCategory, currentPage, sortBy]);

  console.log("🎨 INDEX: Avant rendu JSX, état final:", {
    isLoading,
    articlesCount: articles.length,
    totalCount
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      
      {/* ✅ SECTION 1: HEADER SIMPLE */}
      <div style={{ padding: '20px', backgroundColor: 'white', marginBottom: '20px' }}>
        <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '10px' }}>
          🏠 Blog NovaHypnose
        </h1>
        <p style={{ color: '#666' }}>
          {isLoading ? "⏳ Chargement..." : `📚 ${totalCount} articles disponibles`}
        </p>
      </div>

      {/* ✅ SECTION 2: HERO REMPLACÉ PAR UNE DIV SIMPLE */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '40px 20px', 
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#333' }}>
          Bienvenue sur notre blog
        </h2>
        <p style={{ fontSize: '18px', color: '#666' }}>
          Découvrez nos articles sur l'hypnothérapie et le développement personnel
        </p>
      </div>

      {/* ✅ SECTION 3: FILTRES SIMPLES */}
      <div style={{ padding: '20px', backgroundColor: 'white', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px', color: '#333' }}>🔍 Filtres</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          
          <input 
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              minWidth: '200px'
            }}
          />
          
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              border: '1px solid #ccc', 
              borderRadius: '4px'
            }}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          
        </div>
      </div>

      {/* ✅ SECTION 4: LISTE ARTICLES SIMPLE */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          📰 Articles {isLoading && "(Chargement...)"}
        </h3>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>⏳ Chargement des articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>📭 Aucun article trouvé</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {articles.map((article, index) => (
              <div 
                key={article.id || index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white'
                }}
              >
                <h4 style={{ color: '#333', marginBottom: '10px' }}>
                  {article.title || `Article ${index + 1}`}
                </h4>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                  {article.excerpt || "Pas d'extrait disponible"}
                </p>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  📅 {article.created_at ? new Date(article.created_at).toLocaleDateString() : 'Date inconnue'}
                  {article.read_time && ` • ⏱️ ${article.read_time} min`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ SECTION 5: PAGINATION SIMPLE */}
      {totalPages > 1 && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: 'white',
          margin: '20px 0'
        }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {currentPage > 1 && (
              <button 
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                ← Précédent
              </button>
            )}
            
            <span style={{ padding: '8px 16px', color: '#333' }}>
              Page {currentPage} / {totalPages}
            </span>
            
            {currentPage < totalPages && (
              <button 
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{ 
                  padding: '8px 16px', 
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Suivant →
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Index;
