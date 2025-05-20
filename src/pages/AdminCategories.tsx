
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Plus, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getAllCategories, saveCategory, deleteCategory } from "@/lib/services/articleService";
import { Category } from "@/lib/types";

// Schéma de validation pour le formulaire de catégorie
const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  slug: z.string().min(2, { message: "Le slug doit contenir au moins 2 caractères" }),
  description: z.string().optional(),
  parent_id: z.string().optional()
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { isAdmin } = useAuth();
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parent_id: ""
    }
  });
  
  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getAllCategories();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des catégories:", error);
        toast.error("Impossible de charger les catégories", { 
          description: error.message 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Gérer l'ouverture du formulaire d'édition
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    form.reset({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parent_id: category.parent_id || ""
    });
    setDialogOpen(true);
  };
  
  // Gérer l'ouverture du formulaire de création
  const handleNewCategory = () => {
    setSelectedCategory(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      parent_id: ""
    });
    setDialogOpen(true);
  };
  
  // Générer un slug à partir du nom
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };
  
  // Mettre à jour le slug lorsque le nom change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const currentSlug = form.getValues("slug");
    
    // Ne générer un slug que si l'utilisateur n'en a pas déjà saisi un manuellement
    // ou si le slug actuel est dérivé du nom précédent
    if (!currentSlug || currentSlug === generateSlug(form.getValues("name"))) {
      form.setValue("slug", generateSlug(name));
    }
    
    form.setValue("name", name);
  };
  
  // Sauvegarder la catégorie
  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const { data: savedCategory, error } = await saveCategory({
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        parent_id: data.parent_id === "" ? undefined : data.parent_id
      });
      
      if (error) throw error;
      
      if (!savedCategory) {
        throw new Error("Aucune donnée n'a été retournée lors de l'enregistrement");
      }
      
      // Mettre à jour la liste des catégories
      if (data.id) {
        setCategories(prev => 
          prev.map(cat => cat.id === savedCategory.id ? savedCategory : cat)
        );
        toast.success("Catégorie mise à jour avec succès");
      } else {
        setCategories(prev => [...prev, savedCategory]);
        toast.success("Catégorie créée avec succès");
      }
      
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde de la catégorie:", error);
      toast.error("Erreur lors de la sauvegarde", { 
        description: error.message 
      });
    }
  };
  
  // Gérer la suppression d'une catégorie
  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedCategory) return;
    
    try {
      setIsLoading(true);
      const { success, error } = await deleteCategory(selectedCategory.id);
      
      if (!success) {
        if (error) throw error;
        throw new Error("La suppression a échoué sans message d'erreur");
      }
      
      setCategories(categories.filter(c => c.id !== selectedCategory.id));
      toast.success("Catégorie supprimée avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      toast.error("Erreur lors de la suppression", { 
        description: error.message 
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion des catégories</h1>
          <Button 
            onClick={handleNewCategory}
            className="brand-gradient flex items-center gap-2"
          >
            <Plus size={16} />
            Nouvelle catégorie
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Chargement des catégories...</div>
        ) : categories.length === 0 ? (
          <Alert className="mb-6">
            <AlertDescription>
              Aucune catégorie n'a été créée. Créez votre première catégorie en cliquant sur "Nouvelle catégorie".
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Catégorie parente</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{category.slug}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {category.description || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {category.parent_id ? 
                        categories.find(c => c.id === category.parent_id)?.name || "—" : 
                        "—"}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        title="Modifier la catégorie"
                      >
                        <Edit size={16} />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteClick(category)}
                        className="text-red-500 hover:text-red-700"
                        title="Supprimer la catégorie"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      
      {/* Dialogue de formulaire de catégorie */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory ? 
                "Modifier les détails de la catégorie" : 
                "Créer une nouvelle catégorie pour organiser vos articles"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Nom de la catégorie"
                        onChange={handleNameChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="nom-de-la-categorie" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Description de la catégorie"
                        className="h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie parente</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie parente (optionnel)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Aucune</SelectItem>
                        {categories
                          .filter(c => c.id !== selectedCategory?.id) // Éviter les références circulaires
                          .map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" className="brand-gradient">
                  {selectedCategory ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 text-white hover:bg-red-600" 
              onClick={confirmDelete}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default AdminCategories;
