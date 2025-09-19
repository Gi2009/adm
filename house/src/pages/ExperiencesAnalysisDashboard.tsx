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
      console.log("Carregando experiências...");
      const { data, error } = await supabase
        .from("experiencias_analise")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro na query:", error);
        throw error;
      }
      
      console.log("Experiências carregadas:", data?.length || 0, data);
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
    // Preparar os dados garantindo que todos os campos estejam corretos
    const experienceData = {
      titulo: experience.titulo || '',
      descricao: experience.descricao || '',
      local: experience.local || '',
      preco: experience.preco || 0,
      tipo: experience.tipo || 1,
      quantas_p: experience.quantas_p || 1,
      duracao: experience.duracao || null,
      incluso: experience.incluso || '',
      img: experience.img || '',
      id_dono: experience.id_dono,
      data_experiencia: experience.data_experiencia || null,
      created_at: new Date().toISOString(), // Adicionar timestamp atual
     // updated_at: new Date().toISOString()  // Adicionar timestamp de atualização
    };

    console.log("Dados sendo enviados:", experienceData);

    // Insert into experiencias_dis
    const { error: insertError } = await supabase
      .from("experiencias_dis")
      .insert([experienceData]);

    if (insertError) {
      console.error("Erro ao inserir:", insertError);
      throw insertError;
    }

    // Delete from experiencias_analise
    const { error: deleteError } = await supabase
      .from("experiencias_analise")
      .delete()
      .eq("id", experience.id);

    if (deleteError) {
      console.error("Erro ao deletar:", deleteError);
      throw deleteError;
    }

    // Remove from local state immediately
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando experiências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard de Análise de Experiências
            </h1>
            <p className="text-muted-foreground mt-2">
              Analise e aprove experiências submetidas pelos usuários
            </p>
          </div>
        </div>

        {experiences.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Não há experiências pendentes de análise.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience) => (
              <Card key={experience.id} className="overflow-hidden">
                {experience.img && (
                  <div className="aspect-video bg-muted">
                    <img
                      src={experience.img}
                      alt={experience.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{experience.titulo}</CardTitle>
                    <Badge variant="secondary">
                      {getTypeLabel(experience.tipo)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {experience.descricao}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{experience.local}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>R$ {experience.preco?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{experience.quantas_p} pessoas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">
                        {experience.data_experiencia }
                      </span>
                    </div>
                  </div>

                  {experience.incluso && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Incluso:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {experience.incluso}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => approveExperience(experience)}
                      className="flex-1"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      onClick={() => rejectExperience(experience.id)}
                      variant="destructive"
                      className="flex-1"
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