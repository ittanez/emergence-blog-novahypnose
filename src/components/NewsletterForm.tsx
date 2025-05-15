
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addSubscriber } from "@/lib/services/subscriberService";

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
});

type FormData = z.infer<typeof formSchema>;

const NewsletterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await addSubscriber(data.email);
      
      if (result.error) {
        if (result.error.code === "23505") { // Unique violation
          toast.error("Cette adresse email est déjà inscrite.", {
            description: "Vous recevez déjà nos notifications.",
          });
        } else {
          throw result.error;
        }
      } else {
        toast.success("Inscription réussie ! Vous recevrez nos prochains articles.", {
          description: "Merci pour votre inscription à notre newsletter.",
        });
        form.reset();
      }
    } catch (error) {
      toast.error("Une erreur est survenue", {
        description: "Impossible de vous inscrire, veuillez réessayer plus tard.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gray-50 border rounded-lg p-6">
      <h3 className="text-lg md:text-xl font-serif font-medium mb-2">Recevoir une notification à chaque nouvel article</h3>
      <p className="text-gray-600 text-sm mb-4">
        Inscrivez-vous pour être notifié lorsqu'un nouvel article est publié.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input 
                      placeholder="Votre adresse email" 
                      {...field} 
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="brand-gradient hover:opacity-90"
            >
              {isSubmitting ? "Inscription..." : "S'inscrire"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewsletterForm;
