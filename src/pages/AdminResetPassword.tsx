
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { updatePassword } from "@/lib/services/authService";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères",
  }),
  confirmPassword: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const AdminResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Vérifier si l'utilisateur a un accès valide de réinitialisation de mot de passe
  useEffect(() => {
    const checkPasswordRecoverySession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast.error("Lien de réinitialisation invalide ou expiré", {
          description: "Veuillez demander un nouveau lien de réinitialisation.",
        });
        navigate("/admin");
      }
    };
    
    checkPasswordRecoverySession();
  }, [navigate]);
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await updatePassword(data.password);
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast.success("Mot de passe mis à jour avec succès");
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        navigate("/admin");
      }, 3000);
      
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour du mot de passe", {
        description: error.message || "Une erreur s'est produite. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Réinitialisation du mot de passe</CardTitle>
            <CardDescription>Entrez votre nouveau mot de passe</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nouveau mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full brand-gradient hover:opacity-90" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-green-600 font-medium">Mot de passe mis à jour avec succès !</p>
                <p>Vous allez être redirigé vers la page de connexion...</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Cette zone est réservée aux administrateurs du blog.
            </p>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminResetPassword;
