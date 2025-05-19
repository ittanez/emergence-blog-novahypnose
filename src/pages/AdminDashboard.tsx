
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/services/authService";
import { useAuth } from "@/lib/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Déconnexion réussie");
      navigate("/admin");
    } catch (error: any) {
      toast.error("Erreur lors de la déconnexion", { 
        description: error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleAction = (action: string) => {
    if (action === "Gestion des articles") {
      navigate("/admin/articles");
      return;
    }
    
    toast.info(`Fonctionnalité "${action}" en cours de développement`, {
      description: "Cette fonctionnalité sera disponible prochainement."
    });
  };

  console.log("AdminDashboard rendu, utilisateur:", user);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? "Déconnexion..." : "Se déconnecter"}
          </Button>
        </div>
        
        <p className="mb-8 text-gray-600">
          Bienvenue dans l'interface d'administration du blog.
          {user && <span> Vous êtes connecté en tant que <strong>{user.email}</strong>.</span>}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Carte pour gérer les articles */}
          <Card>
            <CardHeader>
              <CardTitle>Articles</CardTitle>
              <CardDescription>Gérer les articles du blog</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Créez, modifiez et supprimez des articles. Planifiez leur publication.</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full brand-gradient" 
                onClick={() => handleNavigation("/admin/articles")}
              >
                Gérer les articles
              </Button>
            </CardFooter>
          </Card>
          
          {/* Carte pour gérer les catégories */}
          <Card>
            <CardHeader>
              <CardTitle>Catégories</CardTitle>
              <CardDescription>Organiser le contenu</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Créez et modifiez les catégories pour organiser vos articles.</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full brand-gradient"
                onClick={() => handleAction("Gestion des catégories")}
              >
                Gérer les catégories
              </Button>
            </CardFooter>
          </Card>
          
          {/* Carte pour gérer les utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Administrateurs</CardTitle>
              <CardDescription>Gérer les accès</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Ajoutez de nouveaux administrateurs pour gérer le blog.</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full brand-gradient"
                onClick={() => handleAction("Gestion des administrateurs")}
              >
                Gérer les administrateurs
              </Button>
            </CardFooter>
          </Card>
          
          {/* Carte pour les statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Analyser la performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Consultez les statistiques de votre blog : vues, interactions, etc.</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full brand-gradient"
                onClick={() => handleAction("Affichage des statistiques")}
              >
                Voir les statistiques
              </Button>
            </CardFooter>
          </Card>
          
          {/* Carte pour les commentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Commentaires</CardTitle>
              <CardDescription>Gérer les interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Modérez les commentaires des visiteurs sur vos articles.</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full brand-gradient"
                onClick={() => handleAction("Modération des commentaires")}
              >
                Gérer les commentaires
              </Button>
            </CardFooter>
          </Card>
          
          {/* Carte pour les réglages */}
          <Card>
            <CardHeader>
              <CardTitle>Réglages</CardTitle>
              <CardDescription>Configurer le blog</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Modifiez les paramètres généraux du blog.</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                className="w-full brand-gradient"
                onClick={() => handleAction("Configuration des réglages")}
              >
                Configurer
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
