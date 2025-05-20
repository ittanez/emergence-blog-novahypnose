
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, UserPlus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getAllAdmins, addAdmin, removeAdmin, getAdminRequests, reviewAdminRequest } from "@/lib/services/adminService";

// Schéma de validation pour l'ajout d'admin
const adminSchema = z.object({
  userId: z.string().uuid({ message: "L'ID utilisateur doit être un UUID valide" })
});

type AdminFormValues = z.infer<typeof adminSchema>;

const AdminUsers = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const { user, isAdmin } = useAuth();
  
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      userId: ""
    }
  });
  
  // Charger les administrateurs et les demandes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les admins
        const { data: adminsData, error: adminsError } = await getAllAdmins();
        
        if (adminsError) {
          throw adminsError;
        }
        
        if (adminsData) {
          setAdmins(adminsData);
        }
        
        // Récupérer les demandes
        const { data: requestsData, error: requestsError } = await getAdminRequests();
        
        if (requestsError) {
          throw requestsError;
        }
        
        if (requestsData) {
          setRequests(requestsData);
        }
      } catch (error: any) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Impossible de charger les données", { 
          description: error.message 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Ajouter un administrateur
  const onSubmit = async (data: AdminFormValues) => {
    try {
      const { success, error } = await addAdmin(data.userId);
      
      if (!success) {
        if (error) throw error;
        throw new Error("L'ajout a échoué sans message d'erreur");
      }
      
      // Recharger la liste des admins
      const { data: updatedAdmins } = await getAllAdmins();
      
      if (updatedAdmins) {
        setAdmins(updatedAdmins);
      }
      
      toast.success("Administrateur ajouté avec succès");
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de l'administrateur:", error);
      toast.error("Erreur lors de l'ajout", { 
        description: error.message 
      });
    }
  };
  
  // Gérer la suppression d'un administrateur
  const handleDeleteClick = (admin: any) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedAdmin) return;
    
    try {
      setIsLoading(true);
      const { success, error } = await removeAdmin(selectedAdmin.id);
      
      if (!success) {
        if (error) throw error;
        throw new Error("La suppression a échoué sans message d'erreur");
      }
      
      setAdmins(admins.filter(a => a.id !== selectedAdmin.id));
      toast.success("Administrateur supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'administrateur:", error);
      toast.error("Erreur lors de la suppression", { 
        description: error.message 
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAdmin(null);
      setIsLoading(false);
    }
  };
  
  // Traiter une demande d'administrateur
  const handleRequestReview = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { success, error } = await reviewAdminRequest(requestId, status, user.id);
      
      if (!success) {
        if (error) throw error;
        throw new Error("Le traitement de la demande a échoué sans message d'erreur");
      }
      
      // Mettre à jour l'interface
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status, reviewed_at: new Date().toISOString() } : req
      ));
      
      if (status === 'approved') {
        // Recharger la liste des admins
        const { data: updatedAdmins } = await getAllAdmins();
        
        if (updatedAdmins) {
          setAdmins(updatedAdmins);
        }
      }
      
      toast.success(`Demande ${status === 'approved' ? 'approuvée' : 'rejetée'} avec succès`);
    } catch (error: any) {
      console.error("Erreur lors du traitement de la demande:", error);
      toast.error("Erreur lors du traitement", { 
        description: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion des administrateurs</h1>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="brand-gradient flex items-center gap-2"
          >
            <UserPlus size={16} />
            Ajouter un administrateur
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Chargement des données...</div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Administrateurs actuels</h2>
            {admins.length === 0 ? (
              <Alert className="mb-6">
                <AlertDescription>
                  Aucun administrateur n'a été défini. Ajoutez un administrateur en cliquant sur "Ajouter un administrateur".
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto mb-8">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date d'ajout</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map(admin => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.id}</TableCell>
                        <TableCell>{admin.email || "Email non disponible"}</TableCell>
                        <TableCell>
                          {admin.created_at ? new Date(admin.created_at).toLocaleDateString('fr-FR') : "Date inconnue"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteClick(admin)}
                            className="text-red-500 hover:text-red-700"
                            disabled={admins.length <= 1}
                            title={admins.length <= 1 ? "Impossible de supprimer le dernier administrateur" : "Supprimer cet administrateur"}
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
            
            <h2 className="text-xl font-semibold mb-4">Demandes d'administration</h2>
            {requests.length === 0 ? (
              <Alert className="mb-6">
                <AlertDescription>
                  Aucune demande d'administration en attente.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom complet</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests
                      .sort((a, b) => {
                        // Trier par statut (en attente d'abord) puis par date
                        if (a.status === 'pending' && b.status !== 'pending') return -1;
                        if (a.status !== 'pending' && b.status === 'pending') return 1;
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      })
                      .map(request => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.full_name}</TableCell>
                          <TableCell>{request.user_email}</TableCell>
                          <TableCell>{request.reason}</TableCell>
                          <TableCell>
                            {request.status === 'pending' && "En attente"}
                            {request.status === 'approved' && "Approuvée"}
                            {request.status === 'rejected' && "Rejetée"}
                          </TableCell>
                          <TableCell className="text-right flex justify-end gap-2">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-500 hover:text-green-700"
                                  onClick={() => handleRequestReview(request.id, 'approved')}
                                >
                                  Approuver
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleRequestReview(request.id, 'rejected')}
                                >
                                  Rejeter
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Dialogue d'ajout d'administrateur */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ajouter un administrateur</DialogTitle>
            <DialogDescription>
              Entrez l'identifiant de l'utilisateur à ajouter comme administrateur.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Utilisateur *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ID d'utilisateur (UUID)" />
                    </FormControl>
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
                  Ajouter
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
              Êtes-vous sûr de vouloir supprimer cet administrateur ? 
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

export default AdminUsers;
