import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Map, LogOut } from "lucide-react";

const GeralDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Verifica se há usuário logado
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          toast({
            title: "Erro de autenticação",
            description: "Por favor, faça login novamente",
            variant: "destructive"
          });
          navigate("/login");
          return;
        }

        setUserEmail(session.user?.email || "");

        // Verifica se o usuário é admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('type')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          console.error('Erro ao carregar perfil:', profileError);
          toast({
            title: "Erro",
            description: "Erro ao carregar perfil de usuário",
            variant: "destructive"
          });
          return;
        }

        // Verifica se é admin (type = '1' ou outro critério)
        setIsAdmin(profile?.type === '1' || profile?.type === '3');
        
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dashboard",
          variant: "destructive"
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate, toast]);

  // Monitora mudanças na autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            {userEmail && (
              <p className="text-muted-foreground mt-1">Logado como: {userEmail}</p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/login");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        {isAdmin ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Candidatos</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Gerencie os candidatos cadastrados</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/candidates-dashboard">
                  <Button className="w-full">Ver Candidatos</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Experiências</CardTitle>
                  <Map className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Acompanhe e valide experiências turísticas</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/experiences-analysis">
                  <Button variant="secondary" className="w-full">
                    Analisar Experiências
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Informações gerais do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Usuário</span>
                    <Badge variant="outline">Admin</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Versão</span>
                    <Badge variant="secondary">1.0.0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email</span>
                    <Badge variant="outline" className="text-xs">
                      {userEmail}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <Card>
              <CardContent className="pt-6">
                <div className="max-w-md mx-auto">
                  <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
                  <p className="text-muted-foreground mb-6">
                    Você não tem permissão para acessar o painel administrativo.
                  </p>
                  <div className="space-y-4">
                    <Button onClick={() => navigate("/")} className="w-full">
                      Ir para a Página Inicial
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        await supabase.auth.signOut();
                        navigate("/login");
                      }}
                      className="w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeralDashboard;