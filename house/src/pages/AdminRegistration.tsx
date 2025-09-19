import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const adminRegistrationSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type AdminRegistrationForm = z.infer<typeof adminRegistrationSchema>;

const AdminRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<AdminRegistrationForm>({
    resolver: zodResolver(adminRegistrationSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
      confirmPassword: "",
      cpf: "",
      telefone: "",
    },
  });

  const onSubmit = async (data: AdminRegistrationForm) => {
    setLoading(true);

    try {
      // Verificar se o usuário atual tem permissão para criar admins
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast({
          title: "Erro de autorização",
          description: "Você precisa estar logado para criar administradores.",
          variant: "destructive",
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('type')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile || profile.type !== '3') {
        toast({
          title: "Erro de autorização",
          description: "Apenas administradores podem criar novos administradores.",
          variant: "destructive",
        });
        return;
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            telefone: data.telefone,
            cpf: data.cpf,
            type: '3'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          toast({
            title: "Erro",
            description: "Este email já está cadastrado no sistema.",
            variant: "destructive",
          });
        } else {
          throw authError;
        }
        return;
      }

      // Se o usuário foi criado com sucesso
      if (authData.user) {
        // O perfil já será criado automaticamente pelo trigger handle_new_user
        // mas vamos garantir que seja tipo 3
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ type: '3' })
          .eq('user_id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar tipo do perfil:', updateError);
        }

        toast({
          title: "Sucesso!",
          description: `Administrador ${data.nome} criado com sucesso.`,
        });

        form.reset();
        navigate('/candidates-dashboard');
      }

    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar administrador. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6"style={{ backgroundColor: "#fdf6e3" }}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            <CardTitle>Cadastrar Administrador</CardTitle>
          </div>
          <CardDescription>
            Preencha os dados para criar um novo administrador do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Digite o email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o CPF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o telefone" {...field} />
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
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite a senha"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-white-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme a senha"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-white-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Cadastrar Administrador
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRegistration;
