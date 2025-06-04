 // Corrections à apporter dans useArticleEditor.tsx

// 1. Modifier l'état initial pour inclure toutes les colonnes
const [article, setArticle] = useState<Partial<Article>>({
  title: "",
  content: "",
  excerpt: "",
  image_url: "",
  published: false,
  categories: [],
  slug: "",
  tags: [],
  keywords: [],
  seo_description: "", // ✅ Garder cohérent avec le code
  meta_description: "", // ✅ Ajouter pour la compatibilité DB
  read_time: 1, // ✅ Ajouter pour la DB
  author: "", // ✅ Ajouter pour la DB
  featured: false, // ✅ Ajouter pour la DB
  storage_image_url: "", // ✅ Ajouter pour la DB
});

// 2. Dans handleContentChange, s'assurer que read_time est sauvegardé
const handleContentChange = (content: string) => {
  setArticle(prev => ({ ...prev, content }));
  
  // ... existing code ...
  
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  setArticle(prev => ({ 
    ...prev, 
    read_time: readTime // ✅ S'assurer que c'est bien read_time
  }));
  
  // ... rest of existing code ...
};

// 3. Dans handleSubmit, s'assurer que toutes les colonnes sont envoyées
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  
  if (!article.title || !article.content) {
    toast.error("Veuillez remplir tous les champs obligatoires");
    return;
  }
  
  try {
    setIsSaving(true);
    
    // Préparer l'article avec TOUTES les colonnes nécessaires
    const articleToSave = { 
      ...article,
      // ✅ S'assurer que meta_description est synchronisé avec seo_description
      meta_description: article.seo_description || article.meta_description,
      // ✅ S'assurer qu'author est défini (utiliser user actuel si nécessaire)
      author: article.author || user?.email || 'Admin',
      // ✅ Valeurs par défaut pour les champs obligatoires
      featured: article.featured || false,
      read_time: article.read_time || 1,
    };
    
    if (publishMode === "schedule" && scheduledDate) {
      articleToSave.scheduled_for = scheduledDate.toISOString();
      articleToSave.published = false;
    } else if (publishMode === "publish") {
      articleToSave.published = true;
      articleToSave.scheduled_for = undefined;
    } else { // draft
      articleToSave.published = false;
      articleToSave.scheduled_for = undefined;
    }
    
    console.log("Article à sauvegarder:", articleToSave);
    
    const { data, error } = await saveArticle(articleToSave);
    
    // ... rest of existing code ...
  } catch (error: any) {
    // ... existing error handling ...
  } finally {
    setIsSaving(false);
  }
};
