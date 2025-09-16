import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, User, Mail, Lock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const emailSchema = z.object({
  email: z.string().email('Email inválido'),
});

const telefoneSchema = z.object({
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
});

const senhaSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => {
  return data.newPassword === data.confirmPassword;
}, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type TelefoneFormData = z.infer<typeof telefoneSchema>;
type SenhaFormData = z.infer<typeof senhaSchema>;

const EditProfile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingTelefone, setIsSubmittingTelefone] = useState(false);
  const [isSubmittingSenha, setIsSubmittingSenha] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const telefoneForm = useForm<TelefoneFormData>({
    resolver: zodResolver(telefoneSchema),
    defaultValues: {
      telefone: '',
    },
  });

  const senhaForm = useForm<SenhaFormData>({
    resolver: zodResolver(senhaSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar perfil",
        variant: "destructive",
      });
      return;
    }

    setProfileData(data);
    emailForm.setValue('email', user.email || '');
    telefoneForm.setValue('telefone', data.telefone || '');
  };

  const onSubmitEmail = async (data: EmailFormData) => {
    if (!user) return;
    
    setIsSubmittingEmail(true);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        email: data.email
      });
      
      if (authError) throw authError;

      toast({
        title: "Sucesso",
        description: "Email atualizado com sucesso!",
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar email",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const onSubmitTelefone = async (data: TelefoneFormData) => {
    if (!user) return;
    
    setIsSubmittingTelefone(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ telefone: data.telefone })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Sucesso",
        description: "Telefone atualizado com sucesso!",
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar telefone",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTelefone(false);
    }
  };

  const onSubmitSenha = async (data: SenhaFormData) => {
    if (!user) return;
    
    setIsSubmittingSenha(true);

    try {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (passwordError) throw passwordError;

      toast({
        title: "Sucesso",
        description: "Senha atualizada com sucesso!",
      });

      // Limpar campos de senha
      senhaForm.reset();

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar senha",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingSenha(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Você precisa estar logado para editar o perfil</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Editar Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Seção Email */}
              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-medium flex items-center gap-2 border-b pb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </h3>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="seu.email@exemplo.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmittingEmail}
                      className="w-full"
                    >
                      {isSubmittingEmail ? "Salvando..." : "Salvar Email"}
                    </Button>
                  </form>
                </Form>
              </div>

              {/* Seção Telefone */}
              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-medium flex items-center gap-2 border-b pb-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </h3>
                <Form {...telefoneForm}>
                  <form onSubmit={telefoneForm.handleSubmit(onSubmitTelefone)} className="space-y-4">
                    <FormField
                      control={telefoneForm.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(11) 99999-9999"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={isSubmittingTelefone}
                      className="w-full"
                    >
                      {isSubmittingTelefone ? "Salvando..." : "Salvar Telefone"}
                    </Button>
                  </form>
                </Form>
              </div>

              {/* Seção Senha */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2 border-b pb-2">
                  <Lock className="h-4 w-4" />
                  Alterar Senha
                </h3>
                <Form {...senhaForm}>
                  <form onSubmit={senhaForm.handleSubmit(onSubmitSenha)} className="space-y-4">
                    <FormField
                      control={senhaForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Atual</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Digite sua senha atual"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={senhaForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova Senha</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Digite a nova senha"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={senhaForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Nova Senha</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Confirme a nova senha"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isSubmittingSenha}
                      className="w-full"
                    >
                      {isSubmittingSenha ? "Salvando..." : "Salvar Senha"}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;