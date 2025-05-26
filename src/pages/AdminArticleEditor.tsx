
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticlePreview from "@/components/ArticlePreview";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useArticleEditor } from "@/hooks/useArticleEditor";
import ArticleContentSection from "@/components/admin/ArticleContentSection";
import ArticleMetaSection from "@/components/admin/ArticleMetaSection";
import ArticlePublishingSection from "@/components/admin/ArticlePublishingSection";
import ArticleSEOSection from "@/components/admin/ArticleSEOSection";

const AdminArticleEditor = () => {
  const navigate = useNavigate();
  const {
    isEditing,
    isLoading,
    isSaving,
    showPreview,
    setShowPreview,
    scheduledDate,
    article,
    publishMode,
    handleChange,
    handleContentChange,
    handleTagsChange,
    handleKeywordsChange,
    handlePublishModeChange,
    handleTitleChange,
    handleCategoriesChange,
    handleImageUpload,
    handleScheduledDateChange,
    handleSubmit,
    getTagsForPreview,
  } = useArticleEditor();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          Chargement de l'article...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {isEditing ? "Modifier l'article" : "Nouvel article"}
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              Aperçu
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/articles')}
            >
              Retour à la liste
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Section principale - Contenu */}
              <ArticleContentSection
                article={article}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
                onFieldChange={handleChange}
                onImageUpload={handleImageUpload}
              />

              <Separator className="my-6" />
              
              {/* Section Tags et Métadonnées */}
              <ArticleMetaSection
                article={article}
                onFieldChange={handleChange}
                onCategoriesChange={handleCategoriesChange}
                onTagsChange={handleTagsChange}
              />
              
              <Separator className="my-6" />
              
              {/* Section Publication */}
              <ArticlePublishingSection
                publishMode={publishMode}
                scheduledDate={scheduledDate}
                onPublishModeChange={handlePublishModeChange}
                onScheduledDateChange={handleScheduledDateChange}
              />
              
              <Separator className="my-6" />
              
              {/* Section SEO */}
              <ArticleSEOSection
                article={article}
                onFieldChange={handleChange}
                onKeywordsChange={handleKeywordsChange}
              />
            </CardContent>
          </Card>
          
          <div className="pt-6">
            <Button
              type="submit"
              className="brand-gradient"
              disabled={isSaving}
            >
              {isSaving 
                ? "Enregistrement..." 
                : publishMode === "draft" 
                ? "Enregistrer comme brouillon" 
                : publishMode === "schedule" 
                ? "Programmer la publication" 
                : "Publier"}
            </Button>
          </div>
        </form>
      </main>
      
      {/* Aperçu de l'article */}
      <ArticlePreview
        article={{
          ...article,
          tags: getTagsForPreview(),
          created_at: article.created_at || new Date().toISOString()
        }}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      />
      
      <Footer />
    </div>
  );
};

export default AdminArticleEditor;
