
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import TagInput from "@/components/TagInput";
import { Article } from "@/lib/types";

interface ArticleSEOSectionProps {
  article: Partial<Article>;
  onFieldChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeywordsChange: (keywords: string[]) => void;
}

const ArticleSEOSection = ({
  article,
  onFieldChange,
  onKeywordsChange,
}: ArticleSEOSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Référencement (SEO)</h3>
      
      <div className="space-y-2">
        <Label htmlFor="seo_description">Méta-description</Label>
        <Textarea
          id="seo_description"
          name="seo_description"
          value={article.seo_description || ''}
          onChange={onFieldChange}
          placeholder="Description pour les moteurs de recherche"
          className="min-h-[80px]"
        />
        <p className="text-xs text-gray-500">
          Recommandation: 150-160 caractères maximum
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Mots-clés SEO</Label>
        <TagInput
          tags={article.keywords || []}
          onChange={onKeywordsChange}
          placeholder="Ajouter un mot-clé..."
        />
        <p className="text-xs text-gray-500">
          5-10 mots-clés pertinents pour votre article
        </p>
      </div>
    </div>
  );
};

export default ArticleSEOSection;
