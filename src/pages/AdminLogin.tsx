
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
import { signIn, resetPassword } from "@/lib/services/authService";
import { useAuth } from "@/lib/contexts/AuthContext";

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

type FormData = z.infer<typeof formSchema>;

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Rediriger vers le tableau de bord si déjà connecté en tant qu'admin
  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, navigate]);
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Nous nous assurons que les valeurs sont bien définies avant de les passer à signIn
      const { error } = await signIn({
        email: data.email,
        password: data.password
      });
      
      if (error) {
        throw error;
      }
      
      // La redirection sera gérée par l'effet useEffect une fois que l'état d'authentification sera mis à jour
      toast.success("Connexion réussie");
    } catch (error: any) {
      toast.error("Erreur de connexion", {
        description: error.message || "Vérifiez vos identifiants et réessayez.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      toast.error("Veuillez saisir une adresse email valide");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        throw error;
      }
      
      setIsResetSent(true);
      toast.success("Email de réinitialisation envoyé", {
        description: "Vérifiez votre boîte de réception et suivez les instructions."
      });
    } catch (error: any) {
      toast.error("Erreur lors de la réinitialisation", {
        description: error.message || "Une erreur s'est produite lors de l'envoi de l'email de réinitialisation.",
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
            <CardTitle>Administration</CardTitle>
            <CardDescription>Connectez-vous pour gérer votre blog</CardDescription>
          </CardHeader>
          <CardContent>
            {!showResetForm ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="votre@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
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
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                  
                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setShowResetForm(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                {!isResetSent ? (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="reset-email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
                    </Button>
                    
                    <div className="text-center">
                      <button 
                        type="button"
                        onClick={() => setShowResetForm(false)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Retour à la connexion
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-green-600">
                      Un email de réinitialisation a été envoyé à <strong>{resetEmail}</strong>
                    </p>
                    <p>Vérifiez votre boîte de réception et suivez les instructions.</p>
                    <Button 
                      onClick={() => setShowResetForm(false)}
                      variant="outline"
                    >
                      Retour à la connexion
                    </Button>
                  </div>
                )}
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

export default AdminLogin;
