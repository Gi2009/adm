import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, Calendar, DollarSign, MapPin, Package, CheckCircle, Clock, XCircle, Loader2, User, ShoppingCart } from "lucide-react";

interface CompraExperiencia {
  id: number;
  user_id: string;
  experiencia_id: number;
  data_compra: string;
  status: string;
  valor: number;
  quantidade_ingressos: number;
  data_experiencia: string;
  // Campos enriquecidos
  user_nome?: string;
  user_email?: string;
  experiencia_titulo?: string;
  experiencia_local?: string;
  dono_nome?: string;
}

const ComprasExperiencias = () => {
  const [compras, setCompras] = useState<CompraExperiencia[]>([]);
  const [filteredCompras, setFilteredCompras] = useState<CompraExperiencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    // Teste inicial para verificar dados
    testarConexao();
    fetchCompras();
  }, []);

  useEffect(() => {
    filterCompras();
  }, [compras, searchTerm, filterStatus]);

  const testarConexao = async () => {
    try {
      console.log('🔍 Testando conexão com o banco...');
      
      // Teste 1: Verificar usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Usuário logado:', user?.id);

      // Teste 2: Verificar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('type, nome')
        .eq('user_id', user?.id)
        .single();
      
      console.log('📊 Perfil do usuário:', profile);

      // Teste 3: Buscar compras simples
      const { data: comprasTeste, error: errorTeste } = await supabase
        .from('compras_experiencias')
        .select('*')
        .limit(5);

      console.log('🧪 Teste compras:', comprasTeste);
      console.log('❌ Erro teste:', errorTeste);

    } catch (error) {
      console.error('💥 Erro no teste:', error);
    }
  };

  const fetchCompras = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Iniciando busca de compras...');

      // PRIMEIRO: Buscar apenas os dados básicos das compras
      const { data: comprasData, error: comprasError } = await supabase
        .from("compras_experiencias")
        .select("*")
        .order("data_compra", { ascending: false });

      if (comprasError) {
        console.error("❌ Erro ao buscar compras:", comprasError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as compras.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Compras encontradas:', comprasData?.length);

      if (!comprasData || comprasData.length === 0) {
        setCompras([]);
        return;
      }

      // SEGUNDO: Enriquecer as compras com informações adicionais
      const comprasEnriquecidas = await Promise.all(
        comprasData.map(async (compra) => {
          try {
            // Buscar informações do usuário que comprou
            const { data: userProfile } = await supabase
              .from("profiles")
              .select("nome, email")
              .eq("user_id", compra.user_id)
              .single();

            // Buscar informações da experiência
            let experienciaInfo = null;
            
            // Tenta buscar na tabela experiencias_dis primeiro
            const { data: experienciaData } = await supabase
              .from("experiencias_dis")
              .select("titulo, local, id_dono")
              .eq("id", compra.experiencia_id)
              .single();

            if (experienciaData) {
              experienciaInfo = experienciaData;
            } else {
              // Se não encontrar, busca na tabela experiencias_analise
              const { data: experienciaAnalise } = await supabase
                .from("experiencias_analise")
                .select("titulo, local, id_dono")
                .eq("id", compra.experiencia_id)
                .single();
              
              experienciaInfo = experienciaAnalise;
            }

            // Buscar informações do dono da experiência
            let donoNome = "Não encontrado";
            if (experienciaInfo?.id_dono) {
              const { data: donoProfile } = await supabase
                .from("profiles")
                .select("nome")
                .eq("user_id", experienciaInfo.id_dono)
                .single();
              
              if (donoProfile) {
                donoNome = donoProfile.nome;
              }
            }

            return {
              ...compra,
              user_nome: userProfile?.nome || "Usuário não encontrado",
              user_email: userProfile?.email || "Email não disponível",
              experiencia_titulo: experienciaInfo?.titulo || `Experiência #${compra.experiencia_id}`,
              experiencia_local: experienciaInfo?.local || "Local não informado",
              dono_nome: donoNome
            };
          } catch (error) {
            console.error(`Erro ao enriquecer compra ${compra.id}:`, error);
            return {
              ...compra,
              user_nome: "Erro ao carregar",
              user_email: "Erro ao carregar",
              experiencia_titulo: `Experiência #${compra.experiencia_id}`,
              experiencia_local: "Erro ao carregar",
              dono_nome: "Erro ao carregar"
            };
          }
        })
      );

      setCompras(comprasEnriquecidas);
      
    } catch (error: any) {
      console.error("💥 Erro ao carregar compras:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as compras. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCompras = () => {
    let filtered = compras;

    // Filtrar por status
    if (filterStatus !== "all") {
      filtered = filtered.filter(compra => compra.status === filterStatus);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(compra => 
        compra.user_nome?.toLowerCase().includes(term) ||
        compra.user_email?.toLowerCase().includes(term) ||
        compra.experiencia_titulo?.toLowerCase().includes(term) ||
        compra.dono_nome?.toLowerCase().includes(term) ||
        compra.experiencia_local?.toLowerCase().includes(term) ||
        compra.id.toString().includes(term)
      );
    }

    setFilteredCompras(filtered);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmado": return "Confirmado";
      case "pendente": return "Pendente";
      case "cancelado": return "Cancelado";
      case "concluido": return "Concluído";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado": return "bg-green-100 text-green-800";
      case "pendente": return "bg-yellow-100 text-yellow-800";
      case "cancelado": return "bg-red-100 text-red-800";
      case "concluido": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmado": return <CheckCircle className="h-4 w-4" />;
      case "pendente": return <Clock className="h-4 w-4" />;
      case "cancelado": return <XCircle className="h-4 w-4" />;
      case "concluido": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não agendada";
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Data inválida";
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando compras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Compras de Experiências</h1>
          <Badge variant="secondary" className="ml-4">
            {compras.length} compras
          </Badge>
        </div>

        {/* Botão para teste rápido */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <h3 className="font-semibold">Diagnóstico</h3>
                <p className="text-sm text-muted-foreground">
                  {compras.length === 0 
                    ? "Nenhuma compra encontrada." 
                    : `${compras.length} compras carregadas com sucesso.`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={testarConexao}
                  variant="outline"
                  size="sm"
                >
                  
                </Button>
                <Button
                  onClick={fetchCompras}
                  variant="default"
                  size="sm"
                >
                  <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Recarregar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {compras.length > 0 && (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[
                { status: "all", label: "Total", count: compras.length, color: "blue" },
                { status: "confirmado", label: "Confirmadas", count: compras.filter(c => c.status === "confirmado").length, color: "green" },
                { status: "pendente", label: "Pendentes", count: compras.filter(c => c.status === "pendente").length, color: "yellow" },
                { status: "cancelado", label: "Canceladas", count: compras.filter(c => c.status === "cancelado").length, color: "red" },
                { status: "concluido", label: "Concluídas", count: compras.filter(c => c.status === "concluido").length, color: "blue" }
              ].map((stat) => (
                <Card key={stat.status}>
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
                      placeholder="Buscar por usuário, experiência, dono, local..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      onClick={() => setFilterStatus("all")}
                      size="sm"
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filterStatus === "confirmado" ? "default" : "outline"}
                      onClick={() => setFilterStatus("confirmado")}
                      size="sm"
                    >
                      Confirmadas
                    </Button>
                    <Button
                      variant={filterStatus === "pendente" ? "secondary" : "outline"}
                      onClick={() => setFilterStatus("pendente")}
                      size="sm"
                    >
                      Pendentes
                    </Button>
                    <Button
                      variant={filterStatus === "cancelado" ? "destructive" : "outline"}
                      onClick={() => setFilterStatus("cancelado")}
                      size="sm"
                    >
                      Canceladas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de compras */}
            {filteredCompras.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum resultado para a busca</h3>
                  <p className="text-muted-foreground">Tente ajustar os filtros ou termos de busca.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredCompras.map((compra) => (
                  <Card key={compra.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            {compra.experiencia_titulo}
                          </CardTitle>
                          <CardDescription>
                            Compra #{compra.id} • {formatDate(compra.data_compra)}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={getStatusColor(compra.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(compra.status)}
                            {getStatusLabel(compra.status)}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Informações do Comprador */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Comprador
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Nome: </span>
                              <span className="font-medium">{compra.user_nome}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Email: </span>
                              <span className="font-medium">{compra.user_email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Informações da Experiência */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Experiência
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Oferecida por: </span>
                              <span className="font-medium">{compra.dono_nome}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Local: </span>
                              <span className="font-medium">{compra.experiencia_local}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Informações Financeiras e Datas */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                        <div className="text-center">
                          <DollarSign className="h-4 w-4 text-green-600 mx-auto mb-1" />
                          <p className="text-sm text-muted-foreground">Valor Total</p>
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(compra.valor)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                          <p className="text-sm text-muted-foreground">Ingressos</p>
                          <p className="font-bold text-lg text-blue-600">
                            {compra.quantidade_ingressos}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <Calendar className="h-4 w-4 text-orange-600 mx-auto mb-1" />
                          <p className="text-sm text-muted-foreground">Data Agendada</p>
                          <p className="font-bold text-lg text-orange-600">
                            {formatDate(compra.data_experiencia)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {compras.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma compra encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Não há compras de experiencias.
              </p>
              <div className="space-y-2 text-sm text-left max-w-md mx-auto">
                
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
             
               
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ComprasExperiencias;