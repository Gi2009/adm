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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profile?.is_admin) {
        setIsAdmin(true);
      } else {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar o dashboard.",
          variant: "destructive",
        });
        navigate("/");
      }
      setLoading(false);
    };

    checkUser();
  }, [navigate, toast]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-6 mb-12">
          <h1 className="text-4xl font-bold">Painel Administrativo</h1>
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

        {isAdmin && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-center">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-center gap-2">
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

            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-center gap-2">
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

            <Card className="shadow-lg">
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
