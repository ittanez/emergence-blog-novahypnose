
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AdminArticlesHeaderProps {
  totalCount: number;
  onNewArticle: () => void;
}

const AdminArticlesHeader = ({ totalCount, onNewArticle }: AdminArticlesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des articles</h1>
        <p className="text-gray-600 mt-1">
          {totalCount} article{totalCount > 1 ? 's' : ''} au total
        </p>
      </div>
      <Button 
        onClick={onNewArticle}
        className="brand-gradient flex items-center gap-2"
      >
        <Plus size={16} />
        Nouvel article
      </Button>
    </div>
  );
};

export default AdminArticlesHeader;
