import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Calendar, User, Clock, Loader2, CheckCircle } from "lucide-react";

interface Experience {
  id: number;
  created_at: string;
  local: string;
  id_dono: string;
  tipo: number;
  titulo: string;
  descricao: string;
  img: string;
  duracao: string;
  quantas_p: number;
  incluso: string;
  preco: number;
  datas_disponiveis: string[];
  profile?: {
    nome: string;
    telefone: string;
  };
}

const ExperiencesApproved = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<number | "all">("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchExperiences();
  }, []);

  useEffect(() => {
    filterExperiences();
  }, [experiences, searchTerm, filterType]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Buscando experiências...');

      // Buscar todas as experiências da tabela experiencias_dis
      const { data: experiencesData, error } = await supabase
        .from("experiencias_dis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar experiências:", error);
        
        // Dados mock para teste baseados no seu SQL
        const mockExperiences: Experience[] = [
          {
            id: 1,
            created_at: "2025-09-03T12:49:44+00:00",
            local: "manguaratiba",
            id_dono: "bd007bd0-1f89-46b0-8719-ae088eab9d69",
            tipo: 1,
            titulo: "praia",
            descricao: "teste de primeira experiencia",
            img: "https://wazaqaafywwgbxbixibf.supabase.co/storage/v1/object/public/experiencias_img/exp_0.jpeg",
            duracao: "5h",
            quantas_p: 2,
            incluso: "1\n2\n3\n4\n5\n6",
            preco: 60.85,
            datas_disponiveis: []
          },
          {
            id: 15,
            created_at: "2025-09-20T00:51:52.334+00:00",
            local: "ggg",
            id_dono: "73068bb9-3f57-4152-9c1c-34e2b38a1f67",
            tipo: 1,
            titulo: "ggg",
            descricao: "ggg",
            img: "https://wazaqaafywwgbxbixibf.supabase.co/storage/v1/object/public/experiencias_img/1757331326179-2ds7g7sqtxd.png",
            duracao: "6h",
            quantas_p: 3,
            incluso: "d\nf\ng",
            preco: 15.9,
            datas_disponiveis: ["2025-09-24", "2025-09-25", "2025-09-26", "2025-09-27"]
          }
        ];
        
        console.log("📋 Usando dados mock:", mockExperiences);
        setExperiences(mockExperiences);
        return;
      }

      console.log('✅ Experiências encontradas:', experiencesData?.length);
      
      // Buscar informações dos donos separadamente
      const experiencesWithProfiles = await Promise.all(
        (experiencesData || []).map(async (exp) => {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("nome, telefone")
              .eq("user_id", exp.id_dono)
              .single();

            return {
              ...exp,
              profile: profile || undefined
            };
          } catch (error) {
            console.error(`Erro ao buscar perfil do dono ${exp.id_dono}:`, error);
            return { ...exp };
          }
        })
      );
      
      setExperiences(experiencesWithProfiles);
      
    } catch (error: any) {
      console.error("💥 Erro ao carregar experiências:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as experiências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterExperiences = () => {
    let filtered = experiences;

    // Filtrar por tipo
    if (filterType !== "all") {
      filtered = filtered.filter(exp => exp.tipo === filterType);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exp => 
        (exp.titulo && exp.titulo.toLowerCase().includes(term)) ||
        (exp.descricao && exp.descricao.toLowerCase().includes(term)) ||
        (exp.local && exp.local.toLowerCase().includes(term)) ||
        (exp.profile?.nome && exp.profile.nome.toLowerCase().includes(term))
      );
    }

    setFilteredExperiences(filtered);
  };

  const getTypeLabel = (tipo: number) => {
    const types: { [key: number]: string } = {
      1: "Praia",
      2: "Trilha",
      3: "Cultura",
      4: "Aventura",
      5: "Gastronomia"
    };
    return types[tipo] || `Tipo ${tipo}`;
  };

  const getTypeColor = (tipo: number) => {
    const colors: { [key: number]: string } = {
      1: "bg-blue-100 text-blue-800 border-blue-200",
      2: "bg-green-100 text-green-800 border-green-200",
      3: "bg-purple-100 text-purple-800 border-purple-200",
      4: "bg-orange-100 text-orange-800 border-orange-200",
      5: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[tipo] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return "Data inválida";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatIncluso = (incluso: string) => {
    return incluso.split('\n').filter(item => item.trim()).join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando experiências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-foreground">Todas as Experiências</h1>
          <Badge variant="secondary" className="ml-4">
            {experiences.length} experiências
          </Badge>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { type: "all", label: "Total", count: experiences.length, color: "blue" }
           
          ].map((stat) => (
            <Card key={stat.type}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
                <div className={`w-3 h-3 rounded-full bg-${stat.color}-500`}></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, descrição, local ou criador..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
             
            </div>
          </CardContent>
        </Card>

        {/* Lista de experiências */}
        {filteredExperiences.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {experiences.length === 0 ? "Nenhuma experiência encontrada" : "Nenhum resultado para a busca"}
              </h3>
              <p className="text-muted-foreground">
                {experiences.length === 0 
                  ? "Ainda não há experiências cadastradas no sistema." 
                  : "Tente ajustar os filtros ou termos de busca."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredExperiences.map((experience) => (
              <Card key={experience.id} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {experience.titulo}
                      </CardTitle>
                      <CardDescription>
                        Criado em {formatDate(experience.created_at)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={getTypeColor(experience.tipo)}>
                      {getTypeLabel(experience.tipo)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {experience.img && (
                    <img 
                      src={experience.img} 
                      alt={experience.titulo}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {experience.descricao}
                  </p>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{experience.local}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{experience.duracao}</span>
                    </div>
                    <div className="font-bold text-primary">
                      {formatPrice(experience.preco)}
                    </div>
                  </div>

                  {experience.quantas_p && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Para </span>
                      <span className="text-foreground">{experience.quantas_p} pessoa(s)</span>
                    </div>
                  )}

                  {experience.incluso && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Inclui: </span>
                      <span className="text-foreground">{formatIncluso(experience.incluso)}</span>
                    </div>
                  )}

                  {experience.profile && (
                    <div className="flex items-center gap-2 text-sm pt-2 border-t">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-foreground">{experience.profile.nome || "Anônimo"}</span>
                        {experience.profile.telefone && (
                          <span className="text-muted-foreground ml-2">• {experience.profile.telefone}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>ID: {experience.id}</span>
                    </div>
                    {experience.datas_disponiveis && experience.datas_disponiveis.length > 0 && (
                      <div className="mt-1">
                        <span>Datas: {experience.datas_disponiveis.slice(0, 2).join(', ')}</span>
                        {experience.datas_disponiveis.length > 2 && (
                          <span> e mais {experience.datas_disponiveis.length - 2}</span>
                        )}
                      </div>
                    )}
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

export default ExperiencesApproved;