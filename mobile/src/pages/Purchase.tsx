// components/purchases/PurchasesPage.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import { supabase } from "@/integrations/supabase/client";
import ExperienceCard from "@/components/experiences/ExperienceCard";
import ExperienceDetails from "@/components/experiences/ExperienceDetails";
import { Loader2, ShoppingBag, Calendar, CheckCircle } from "lucide-react";

interface Purchase {
  id: number;
  user_id: string;
  experiencia_id: number;
  data_compra: string;
  status: string;
  valor: number;
  experiencias_dis: {
    id: number;
    titulo: string;
    img: string;
    local: string;
    preco: number;
    descricao: string;
    incluso: string;
    quantas_p: number;
    duração: string;
    tipo: number;
    data_experiencia: string;
  };
}

const PurchasesPage = () => {
  const { signOut } = useAuth();
  const { purchases, loading: purchasesLoading } = usePurchases();
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCardClick = (experience: any) => {
    setSelectedExperience(experience);
    setIsDetailsOpen(true);
  };

  if (purchasesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-200">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-800">Minhas Compras</h1>
            <Button variant="outline" onClick={signOut} className="border-blue-300 text-blue-700 hover:bg-blue-50">
              Sair
            </Button>
          </div>
        </header>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando suas compras...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800">Minhas Compras</h1>
          <Button variant="outline" onClick={signOut} className="border-blue-300 text-blue-700 hover:bg-blue-50">
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-blue-600 mr-2" />
            <h2 className="text-3xl font-bold text-blue-900">Suas Experiências Compradas</h2>
          </div>
          <p className="text-blue-700">
            Aqui estão todas as experiências que você adquiriu
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma compra ainda</h3>
              <p className="text-gray-500">Explore as experiências e adquira sua primeira aventura!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <img 
                          src={purchase.experiencias_dis.img} 
                          alt={purchase.experiencias_dis.titulo}
                          className="w-48 h-32 object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {purchase.experiencias_dis.titulo}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-600">Data da compra:</span>
                            <span className="font-medium">{formatDate(purchase.data_compra)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className="font-medium text-green-600 capitalize">{purchase.status}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Valor pago:</span>
                            <span className="font-bold text-blue-600">R$ {purchase.valor.toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handleCardClick(purchase.experiencias_dis)}
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ExperienceDetails
        experience={selectedExperience}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
};

export default PurchasesPage;