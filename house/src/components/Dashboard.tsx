import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Star, Clock } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Usuários Registrados",
      value: "1,234",
      icon: Users,
      change: "+12% este mês"
    },
    {
      title: "Viagens Pendentes",
      value: "23",
      icon: MapPin,
      change: "Aguardando aprovação"
    },
    {
      title: "Experiências Pendentes",
      value: "15",
      icon: Star,
      change: "Aguardando aprovação"
    },
    {
      title: "Tickets de Suporte",
      value: "8",
      icon: Clock,
      change: "Abertos hoje"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema KANOA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Nova viagem aprovada</span>
                </div>
                <span className="text-xs text-muted-foreground">2 min atrás</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Experiência em análise</span>
                </div>
                <span className="text-xs text-muted-foreground">5 min atrás</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Novo usuário registrado</span>
                </div>
                <span className="text-xs text-muted-foreground">10 min atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="font-medium">Revisar Aprovações</div>
                <div className="text-sm text-muted-foreground">23 viagens + 15 experiências</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="font-medium">Responder Suporte</div>
                <div className="text-sm text-muted-foreground">8 tickets pendentes</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                <div className="font-medium">Gerar Relatório</div>
                <div className="text-sm text-muted-foreground">Exportar dados mensais</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
