import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, ArrowLeft, MapPin, Users, Clock, DollarSign } from "lucide-react";

const ExperiencesAnalysisDashboard = () => {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (!profile || profile.type !== '3') {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setUserProfile(profile);
      await loadExperiences();
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);
      navigate("/login");
    }
  };

  const loadExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from("experiencias_analise")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setExperiences(data || []);
    } catch (error) {
      console.error("Erro ao carregar experiências:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as experiências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveExperience = async (experience: any) => {
    try {
      const { error: insertError } = await supabase
        .from("experiencias_dis")
        .insert({
          titulo: experience.titulo,
          descricao: experience.descricao,
          local: experience.local,
          preco: experience.preco,
          tipo: experience.tipo,
          quantas_p: experience.quantas_p,
          duração: experience.duração,
          incluso: experience.incluso,
          img: experience.img,
          id_dono: experience.id_dono,
          data_experiencia: experience.data_experiencia,
        });

      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from("experiencias_analise" as any)
        .delete()
        .eq("id", experience.id);

      if (deleteError) throw deleteError;

      setExperiences(prev => prev.filter(exp => exp.id !== experience.id));

      toast({
        title: "Experiência aprovada!",
        description: "A experiência foi aprovada e está disponível no sistema.",
      });
    } catch (error) {
      console.error("Erro ao aprovar experiência:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a experiência.",
        variant: "destructive",
      });
    }
  };

  const rejectExperience = async (experienceId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta experiência?')) return;

    try {
      const { error } = await supabase
        .from('experiencias_analise')
        .delete()
        .eq('id', experienceId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Experiência excluída com sucesso!",
      });
      
      checkUserAccess();
    } catch (error) {
      console.error('Erro ao excluir experiência:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a experiência.",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (tipo: number) => {
    const types = {
      1: "Aventura",
      2: "Cultural",
      3: "Gastronômica",
      4: "Relaxamento",
      5: "Esportiva"
    };
    return types[tipo as keyof typeof types] || "Outros";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700">Carregando experiências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="p-2 text-green-700 hover:bg-green-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-green-800">
              Dashboard de Análise de Experiências
            </h1>
            <p className="text-green-600 mt-2">
              Analise e aprove experiências submetidas pelos usuários
            </p>
          </div>
        </div>

        {experiences.length === 0 ? (
          <Card className="border border-green-200">
            <CardContent className="text-center py-12">
              <p className="text-green-600 text-lg">
                Não há experiências pendentes de análise.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience) => (
              <Card 
                key={experience.id} 
                className="overflow-hidden border border-green-200 shadow-sm hover:shadow-lg transition"
              >
                {experience.img && (
                  <div className="aspect-video bg-green-50">
                    <img
                      src={experience.img}
                      alt={experience.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg text-green-800">{experience.titulo}</CardTitle>
                    <Badge className="bg-green-100 text-green-700">
                      {getTypeLabel(experience.tipo)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 text-green-600">
                    {experience.descricao}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span className="truncate">{experience.local}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span>R$ {experience.preco?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>{experience.quantas_p} pessoas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="truncate">{experience.data_experiencia}</span>
                    </div>
                  </div>

                  {experience.incluso && (
                    <div>
                      <h4 className="font-medium text-sm text-green-800 mb-1">Incluso:</h4>
                      <p className="text-sm text-green-600 line-clamp-2">
                        {experience.incluso}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => approveExperience(experience)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => rejectExperience(experience.id)}
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperiencesAnalysisDashboard;
