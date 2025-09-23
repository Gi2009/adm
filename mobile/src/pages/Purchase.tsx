// components/purchases/PurchasesPage.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import { supabase } from "@/integrations/supabase/client";
import ExperienceDetails from "@/components/experiences/ExperienceDetails";
import { Loader2, ShoppingBag, Calendar, CheckCircle, Users, Undo2 } from "lucide-react";

interface Purchase {
  id: number;
  user_id: string;
  experiencia_id: number;
  data_compra: string;
  status: string;
  valor: number;
  quantidade_ingressos?: number;
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
  const [processingRefunds, setProcessingRefunds] = useState<{[key: number]: boolean}>({});

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRefundAvailable = (purchaseDate: string) => {
    const purchaseDateTime = new Date(purchaseDate);
    const currentDateTime = new Date();
    const diffTime = currentDateTime.getTime() - purchaseDateTime.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  const handleRefund = async (purchaseId: number) => {
    if (processingRefunds[purchaseId]) return;

    setProcessingRefunds(prev => ({ ...prev, [purchaseId]: true }));

    try {
      // Aqui você implementaria a lógica de reembolso
      // Por exemplo, chamar uma API ou atualizar o status no Supabase
      const { error } = await supabase
        .from('compras_experiencias')
        .update({ status: 'reembolsado' })
        .eq('id', purchaseId);

      if (error) {
        throw error;
      }

      // Atualizar a lista de compras (você pode querer recarregar os dados)
      alert('Reembolso solicitado com sucesso!');
      // Recarregar a página ou atualizar o estado das compras
      window.location.reload();
    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      alert('Erro ao processar reembolso. Tente novamente.');
    } finally {
      setProcessingRefunds(prev => ({ ...prev, [purchaseId]: false }));
    }
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
              {purchases.map((purchase) => {
                const canRefund = isRefundAvailable(purchase.data_compra) && purchase.status !== 'reembolsado';
                
                return (
                  <div key={purchase.id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500">
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
                              <span className="font-medium">{formatDateTime(purchase.data_compra)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-gray-600">Experiência agendada:</span>
                              <span className="font-medium text-green-700">
                                {formatDateTime(purchase.data_experiencia)}
                              </span>
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

                            {purchase.quantidade_ingressos && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-gray-600">Ingressos:</span>
                                <span className="font-medium">{purchase.quantidade_ingressos}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <Button 
                              onClick={() => handleCardClick(purchase.experiencias_dis)}
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              Ver Detalhes
                            </Button>
                            
                            {canRefund && (
                              <Button 
                                onClick={() => handleRefund(purchase.id)}
                                variant="outline"
                                disabled={processingRefunds[purchase.id]}
                                className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                              >
                                {processingRefunds[purchase.id] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Processando...
                                  </>
                                ) : (
                                  <>
                                    <Undo2 className="h-4 w-4 mr-2" />
                                    Solicitar Reembolso
                                  </>
                                )}
                              </Button>
                            )}
                            
                            {purchase.status === 'reembolsado' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Reembolsado
                              </span>
                            )}
                            
                            {!canRefund && purchase.status !== 'reembolsado' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                <Calendar className="h-4 w-4 mr-1" />
                                Período de reembolso expirado
                              </span>
                            )}
                          </div>
                          
                          {canRefund && (
                            <div className="mt-3 text-xs text-gray-500">
                              * Reembolso disponível nos primeiros 7 dias após a compra
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <ExperienceDetails
        experience={selectedExperience}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        isPurchaseView={true}
      />
    </div>
  );
};

export default PurchasesPage;