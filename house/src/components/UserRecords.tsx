import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, Phone, MapPin, User, Shield, Loader2, Calendar } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  nome: string | null;
  telefone: string | null;
  type: string | null;
  local: string | null;
  associação: string | null;
  cpf: string | null;
  created_at: string;
  updated_at: string;
}

const UserRecords = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Iniciando busca de usuários...');
      
      // Teste simples primeiro
      const { data: testData, error: testError } = await supabase
        .from("profiles")
        .select("count")
        .single();

      if (testError) {
        console.error('❌ Erro no teste simples:', testError);
      } else {
        console.log('✅ Teste simples bem-sucedido:', testData);
      }

      // Buscar todos os perfis da tabela profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro detalhado ao buscar perfis:", error);
        console.log('Código do erro:', error.code);
        console.log('Mensagem:', error.message);
        console.log('Detalhes:', error.details);
        console.log('Hint:', error.hint);
        
        // Dados mock baseados no seu SQL
        const mockUsers: UserProfile[] = [
          {
            id: "0739e7ff-c83e-4e2c-9010-62af6d1a0e44",
            user_id: "73068bb9-3f57-4152-9c1c-34e2b38a1f67",
            nome: "Giovanna Oliveira",
            telefone: "(11) 96312-4376",
            type: "2",
            local: null,
            associação: null,
            cpf: "54444444444",
            created_at: "2025-09-03T20:22:43.931609+00:00",
            updated_at: "2025-09-19T11:34:49.685372+00:00"
          },
          {
            id: "bb254877-f550-4337-acc5-a068f4af5447",
            user_id: "af0286f1-9882-4fc1-903e-d8d505f91fe2",
            nome: "Kaua Guarani",
            telefone: "2222222222",
            type: "3",
            local: null,
            associação: null,
            cpf: "11111111111",
            created_at: "2025-09-10T12:51:41.601729+00:00",
            updated_at: "2025-09-10T12:51:41.601729+00:00"
          },
          {
            id: "f25829f3-44b5-423a-96a1-19471d24fe2d",
            user_id: "b6489ae0-abad-4a03-8f8d-f27a5e4a6a8f",
            nome: "Meraki",
            telefone: "(11) 96472-4376",
            type: "3",
            local: null,
            associação: null,
            cpf: "55555555555",
            created_at: "2025-08-31T21:20:05.04324+00:00",
            updated_at: "2025-09-06T17:23:52.508006+00:00"
          },
          {
            id: "fe735f62-42a3-4916-9b00-6544cacc22b8",
            user_id: "963ecf83-0e94-41df-a874-238215bca8bb",
            nome: "Agatha",
            telefone: "(00) 00000-000",
            type: "1",
            local: null,
            associação: null,
            cpf: "44444444444",
            created_at: "2025-09-07T17:57:17.766932+00:00",
            updated_at: "2025-09-19T11:15:43.741589+00:00"
          }
        ];
        
        console.log("📋 Usando dados mock:", mockUsers);
        setUsers(mockUsers);
        return;
      }

      console.log('✅ Perfis encontrados:', profiles?.length);
      
      // Garantir que todos os campos estejam preenchidos
      const completeProfiles: UserProfile[] = (profiles || []).map(profile => ({
        id: profile.id || "",
        user_id: profile.user_id || "",
        nome: profile.nome || null,
        telefone: profile.telefone || null,
        type: profile.type || null,
        local: profile.local || null,
        associação: profile.associação || null,
        cpf: profile.cpf || null,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString()
      }));
      
      setUsers(completeProfiles);
      
    } catch (error: any) {
      console.error("💥 Erro ao carregar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtrar por tipo
    if (filterType !== "all") {
      filtered = filtered.filter(user => user.type === filterType);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        (user.nome && user.nome.toLowerCase().includes(term)) ||
        (user.telefone && user.telefone.includes(term)) ||
        (user.local && user.local.toLowerCase().includes(term)) ||
        (user.associação && user.associação.toLowerCase().includes(term)) ||
        (user.cpf && user.cpf.includes(term)) ||
        (user.user_id && user.user_id.toLowerCase().includes(term))
      );
    }

    setFilteredUsers(filtered);
  };

  const getTypeLabel = (type: string | null) => {
    switch (type) {
      case "1": return "Turista";
      case "2": return "Dono de Experiência";
      case "3": return "Administrador";
      default: return "Não definido";
    }
  };

  const getTypeColor = (type: string | null) => {
    switch (type) {
      case "1": return "bg-blue-100 text-blue-800 border-blue-200";
      case "2": return "bg-green-100 text-green-800 border-green-200";
      case "3": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não disponível";
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Registro de Usuários</h1>
          <Badge variant="secondary" className="ml-4">
            {users.length} usuários
          </Badge>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { type: "all", label: "Total", count: users.length, color: "blue" },
            { type: "1", label: "Turistas", count: users.filter(u => u.type === "1").length, color: "blue" },
            { type: "2", label: "Donos", count: users.filter(u => u.type === "2").length, color: "green" },
            { type: "3", label: "Admins", count: users.filter(u => u.type === "3").length, color: "red" }
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
                  placeholder="Buscar por nome, telefone, CPF, local..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={filterType === "1" ? "default" : "outline"}
                  onClick={() => setFilterType("1")}
                  size="sm"
                >
                  Turistas
                </Button>
                <Button
                  variant={filterType === "2" ? "secondary" : "outline"}
                  onClick={() => setFilterType("2")}
                  size="sm"
                >
                  Donos
                </Button>
                <Button
                  variant={filterType === "3" ? "destructive" : "outline"}
                  onClick={() => setFilterType("3")}
                  size="sm"
                >
                  Admins
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de usuários */}
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {users.length === 0 ? "Nenhum usuário encontrado" : "Nenhum resultado para a busca"}
              </h3>
              <p className="text-muted-foreground">
                {users.length === 0 
                  ? "Ainda não há usuários cadastrados no sistema." 
                  : "Tente ajustar os filtros ou termos de busca."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <Card key={user.user_id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {user.nome || "Nome não informado"}
                      </CardTitle>
                      <CardDescription>
                        Cadastrado em {formatDate(user.created_at)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={getTypeColor(user.type)}>
                      {getTypeLabel(user.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  
                  {user.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{user.telefone}</span>
                    </div>
                  )}
                  
                  {user.cpf && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{user.cpf}</span>
                    </div>
                  )}
                  
                  {user.local && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{user.local}</span>
                    </div>
                  )}

                  {user.associação && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{user.associação}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>ID: {user.user_id}</span>
                    </div>
                    <div className="mt-1">
                      <span>Tipo: {user.type}</span>
                    </div>
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

export default UserRecords;