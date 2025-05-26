
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/RichTextEditor";
import { Article } from "@/lib/types";

interface ArticleContentSectionProps {
  article: Partial<Article>;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (content: string) => void;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ArticleContentSection = ({
  article,
  onTitleChange,
  onContentChange,
  onFieldChange,
  onImageUpload,
}: ArticleContentSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          name="title"
          value={article.title}
          onChange={onTitleChange}
          placeholder="Titre de l'article"
          required
          className="text-xl font-medium"
        />
      </div>
    
      <div className="space-y-2">
        <RichTextEditor
          label="Contenu *"
          value={article.content || ""}
          onChange={onContentChange}
          height={500}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="excerpt">Extrait / Résumé</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          value={article.excerpt || ''}
          onChange={onFieldChange}
          placeholder="Bref résumé de l'article"
          className="min-h-[80px]"
        />
        <p className="text-xs text-gray-500">
          Affiché sur la page d'accueil. Si non renseigné, les premiers caractères du contenu seront utilisés.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">Image principale</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="max-w-md"
          />
          {article.image_url && (
            <div className="w-16 h-16 rounded overflow-hidden">
              <img 
                src={article.image_url} 
                alt="Aperçu" 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Format recommandé: 1200x630px
        </p>
      </div>
    </div>
  );
};

export default ArticleContentSection;
