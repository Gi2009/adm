import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, UserPlus, LogIn } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-200 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-yellow-800">Sistema de Turismo</h1>
          <p className="text-xl text-yellow-700">
            Plataforma para gestão de candidatos e experiências turísticas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mx-auto">
          <Card className="hover:shadow-lg transition-shadow border border-yellow-200 rounded-xl">
            <CardHeader className="bg-yellow-600 text-white rounded-t-xl p-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-white" />
                <CardTitle className="text-lg font-semibold">Cadastro de Fornecedor</CardTitle>
              </div>
              <CardDescription className="text-yellow-100">
                Registre-se como fornecedor de experiências turísticas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Button asChild className="w-full py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition">
                <Link to="/provider-registration">
                  Cadastrar-se
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-yellow-200 rounded-xl">
            <CardHeader className="bg-yellow-600 text-white rounded-t-xl p-4">
              <div className="flex items-center gap-2">
                <LogIn className="h-6 w-6 text-white" />
                <CardTitle className="text-lg font-semibold">Login</CardTitle>
              </div>
              <CardDescription className="text-yellow-100">
                Acesse sua conta no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Button asChild variant="outline" className="w-full py-2 rounded-lg border-yellow-500 text-yellow-700 hover:bg-yellow-50 transition">
                <Link to="/login">
                  Fazer Login
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border border-yellow-200 rounded-xl">
            <CardHeader className="bg-yellow-600 text-white rounded-t-xl p-4">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-white" />
                <CardTitle className="text-lg font-semibold">Dashboard</CardTitle>
              </div>
              <CardDescription className="text-yellow-100">
                Visualize candidatos e experiências (somente administradores)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button asChild variant="secondary" className="w-full py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition">
                <Link to="/candidates-dashboard">
                  Ver Candidatos
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full py-2 rounded-lg border-yellow-500 text-yellow-700 hover:bg-yellow-50 transition">
                <Link to="/experiences-analysis">
                  Análise de Experiências
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
