import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, UserPlus, LogIn } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Sistema de Turismo</h1>
          <p className="text-xl text-muted-foreground">
            Plataforma para gestão de candidatos e experiências turísticas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LogIn className="h-6 w-6 text-primary" />
                <CardTitle>Login</CardTitle>
              </div>
              <CardDescription>
                Acesse sua conta no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">
                  Fazer Login
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
