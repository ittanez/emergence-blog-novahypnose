
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin } from '@/lib/services/authService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fonction pour vérifier si l'utilisateur est admin
    const verifyAdminStatus = async (userId: string) => {
      try {
        console.log("Vérification du statut admin pour l'utilisateur:", userId);
        const { isAdmin: adminStatus, error } = await checkIsAdmin();
        
        if (error) {
          console.error("Erreur lors de la vérification du statut admin:", error);
          setIsAdmin(false);
          return;
        }
        
        console.log("Statut admin:", adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Exception lors de la vérification du statut admin:", error);
        setIsAdmin(false);
      }
    };

    // État d'authentification initial
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        console.log("Session initiale:", session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await verifyAdminStatus(session.user.id);
        }
      } catch (error) {
        console.error('Erreur d\'initialisation de l\'authentification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialiser l'authentification
    initAuth();

    // Écouteur des changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Événement d'authentification:", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Mettre à jour le statut admin lorsque l'état d'authentification change
          setTimeout(() => {
            verifyAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
