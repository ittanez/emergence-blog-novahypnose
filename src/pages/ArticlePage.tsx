// Dans votre ArticlePage.tsx, remplacez la logique de récupération par :

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const { 
    data: articleResult, 
    error: articleError,
    isLoading: articleLoading 
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      console.log("🔍 Chargement article:", slug);
      const result = await getArticleBySlug(slug!);
      
      // Gérer la redirection côté client
      if (result.redirect && typeof window !== 'undefined') {
        console.log(`🔄 Redirection: ${result.redirect.from} → ${result.redirect.to}`);
        
        // Mettre à jour l'URL sans créer d'entrée dans l'historique
        navigate(`/article/${result.redirect.to}`, { replace: true });
        
        // Optionnel: Toast informatif
        toast.info("Lien mis à jour", {
          description: `Redirection vers l'URL actualisée`,
          duration: 3000
        });
      }
      
      return result;
    },
    enabled: !!slug,
  });

  // Extraire l'article
  const article = articleResult?.data;
  
  // Gestion des erreurs et loading states (reste identique)
  if (articleLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p>Chargement de l'article...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (articleError || !article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-gray-600 mb-4">
              L'article que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link to="/" className="text-nova-700 hover:underline">
              Retour à l'accueil
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Reste de votre composant identique...
  const formattedDate = format(new Date(article.created_at), "d MMMM yyyy", { locale: fr });
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* ... reste de votre JSX inchangé */}
    </div>
  );
};
