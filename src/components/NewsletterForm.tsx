
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { addSubscriber } from "@/lib/services/subscriberService";
import { Bell } from "lucide-react";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Veuillez entrer votre adresse email.");
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Début de l\'inscription pour:', email);
      const { data, error } = await addSubscriber(email);
      
      if (error) {
        console.error('Erreur reçue:', error);
        
        // Gestion spécifique de l'erreur de duplication
        if (error.code === '23505') {
          toast.error("Cette adresse email est déjà inscrite à notre newsletter.");
        } else {
          // Autres erreurs
          toast.error(error.message || "Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
        }
        return;
      }

      if (data) {
        console.log('Inscription réussie pour:', data);
        toast.success("Inscription réussie ! Vous recevrez désormais nos notifications d'articles.");
        setEmail("");
      }
    } catch (error) {
      console.error("Exception lors de l'inscription:", error);
      toast.error("Une erreur inattendue est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Bell className="h-8 w-8 text-nova-600" />
        </div>
        <CardTitle className="text-xl font-serif">Recevez nos notifications</CardTitle>
        <CardDescription>
          Soyez informé des nouveaux articles sur l'hypnose et le bien-être
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="w-full brand-gradient"
            disabled={isLoading}
          >
            {isLoading ? "Inscription..." : "S'abonner aux notifications"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterForm;
