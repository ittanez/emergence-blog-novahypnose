
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { addSubscriber } from "@/lib/services/subscriberService";
import { Bell } from "lucide-react";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre adresse email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await addSubscriber(email);
      
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Déjà inscrit",
            description: "Cette adresse email est déjà inscrite à notre newsletter.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (data) {
        toast({
          title: "Inscription réussie !",
          description: "Vous recevrez désormais nos notifications d'articles.",
        });
        setEmail("");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
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
