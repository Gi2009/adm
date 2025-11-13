import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null; data?: { user: User | null } }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Primeiro, verifique a sessão atual
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Depois configure o listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session) {
          // Aguarde um pouco antes de criar o perfil para evitar conflitos
          setTimeout(async () => {
            await createUserProfile(session.user);
          }, 1000);
          navigate('/');
        } else if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Função separada para criar perfil
  const createUserProfile = async (user: User) => {
    try {
      // Verifique se o perfil já existe antes de criar
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking profile:', checkError);
      }

      // Se o perfil não existir, crie
      if (!existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            nome: user.user_metadata?.nome || '',
            telefone: user.user_metadata?.telefone || '',
            cpf: user.user_metadata?.cpf || '',
            type: '1',
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error creating profile:', error);
          // Tente um upsert como fallback
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              user_id: user.id,
              email: user.email,
              nome: user.user_metadata?.nome || '',
              telefone: user.user_metadata?.telefone || '',
              cpf: user.user_metadata?.cpf || '',
              type: '1',
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id'
            });

          if (upsertError) {
            console.error('Error upserting profile:', upsertError);
          }
        } else {
          console.log('Profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
    }
  };

  // signUp simplificado - SEM tentar criar perfil durante o signup
  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    try {
      console.log('Starting signup process...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata || {}
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        setLoading(false);
        return { error, data };
      }

      setLoading(false);
      return { error: null, data };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      setLoading(false);
      return { 
        error: { 
          name: 'AuthError', 
          message: 'Erro inesperado durante o cadastro',
          status: 500 
        } as AuthError 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};