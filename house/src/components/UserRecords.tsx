import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, Phone, MapPin, User, Shield, Loader2, Calendar, RefreshCw } from "lucide-react";

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
      
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar perfis:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os usuários.",
          variant: "destructive",
        });
        setUsers([]);
        return;
      }

      console.log("Usuários carregados:", profiles?.length);
      setUsers(profiles || []);
      
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar usuários.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (filterType !== "all") {
      filtered = filtered.filter(user => user.type === filterType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.nome?.toLowerCase().includes(term) ||
        user.telefone?.includes(term) ||
        user.local?.toLowerCase().includes(term) ||
        user.associação?.toLowerCase().includes(term) ||
        user.cpf?.includes(term)
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Registro de Usuários</h1>
            <Badge variant="secondary" className="ml-4">
              {users.length} usuários
            </Badge>
          </div>
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>


        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { type: "all", label: "Total", count: users.length, color: "bg-blue-500" },
            { type: "1", label: "Turistas", count: users.filter(u => u.type === "1").length, color: "bg-blue-500" },
            { type: "2", label: "Donos", count: users.filter(u => u.type === "2").length, color: "bg-green-500" },
            { type: "3", label: "Admins", count: users.filter(u => u.type === "3").length, color: "bg-red-500" }
          ].map((stat) => (
            <Card key={stat.type}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
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
              <p className="text-muted-foreground mb-4">
                {users.length === 0 
                  ? "Não há usuários cadastrados no sistema ou você não tem permissão para visualizá-los." 
                  : "Tente ajustar os filtros ou termos de busca."}
              </p>
              <Button onClick={fetchUsers} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
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
                        {user.nome}
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
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user.telefone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user.cpf}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user.local}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user.associação}</span>
                  </div>

                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>ID: {user.user_id.substring(0, 8)}...</span>
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