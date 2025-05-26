
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CategoryMultiSelect from "@/components/CategoryMultiSelect";
import TagInput from "@/components/TagInput";
import { Article } from "@/lib/types";

interface ArticleMetaSectionProps {
  article: Partial<Article>;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoriesChange: (categories: string[]) => void;
  onTagsChange: (tags: string[]) => void;
}

const ArticleMetaSection = ({
  article,
  onFieldChange,
  onCategoriesChange,
  onTagsChange,
}: ArticleMetaSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <CategoryMultiSelect
            selectedCategories={article.categories || []}
            onChange={onCategoriesChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="slug">URL personnalisée (slug)</Label>
          <Input
            id="slug"
            name="slug"
            value={article.slug || ''}
            onChange={onFieldChange}
            placeholder="titre-de-larticle"
          />
          <p className="text-xs text-gray-500">
            Identifiant unique dans l'URL de l'article
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <TagInput
          label="Tags"
          tags={article.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || []}
          onChange={onTagsChange}
          placeholder="Ajouter un tag..."
        />
      </div>
    </div>
  );
};

export default ArticleMetaSection;
