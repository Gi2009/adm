// components/purchases/PurchasesPage.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import { supabase } from "@/integrations/supabase/client";
import ExperienceDetails from "@/components/experiences/ExperienceDetails";
import { Loader2, ShoppingBag, Calendar, CheckCircle, Users, Undo2, AlertCircle } from "lucide-react";

// Interface corrigida para compatibilidade
interface Purchase {
  id: number;
  user_id: string;
  experiencia_id: number;
  data_compra: string;
  status: string;
  valor: number;
  quantidade_ingressos?: number;
  data_experiencia?: string;
  motivo_reembolso?: string;
  data_solicitacao_reembolso?: string;
  experiencias_dis: {
    id: number;
    titulo: string;
    img: string;
    local: string;
    preco: number;
    descricao: string;
    incluso: string;
    quantas_p: number;
    duracao: string; // Corrigido: era "duração" no código anterior
    tipo: number;
    data_experiencia: string;
    created_at: string;
    datas_disponiveis: string[];
    id_dono: string;
  };
}

const PurchasesPage = () => {
  const { signOut } = useAuth();
  const { purchases, loading: purchasesLoading, refetch } = usePurchases(); // Corrigido: use refetch em vez de refreshPurchases
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingRefunds, setProcessingRefunds] = useState<{[key: number]: boolean}>({});
  const [refundDialog, setRefundDialog] = useState<{isOpen: boolean; purchase: Purchase | null}>({
    isOpen: false,
    purchase: null
  });
  const [refundReason, setRefundReason] = useState("");

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

  const openRefundDialog = (purchase: Purchase) => {
    setRefundDialog({ isOpen: true, purchase });
    setRefundReason("");
  };

  const closeRefundDialog = () => {
    setRefundDialog({ isOpen: false, purchase: null });
    setRefundReason("");
  };

  const handleRefund = async () => {
    if (!refundDialog.purchase || !refundReason.trim()) {
      alert('Por favor, informe o motivo do reembolso.');
      return;
    }

    const purchaseId = refundDialog.purchase.id;

    if (processingRefunds[purchaseId]) return;

    setProcessingRefunds(prev => ({ ...prev, [purchaseId]: true }));

    try {
      // Primeiro, atualizar a tabela compras_experiencias
      const { error } = await supabase
        .from('compras_experiencias')
        .update({ 
          status: 'analise',
          motivo_reembolso: refundReason,
          data_solicitacao_reembolso: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (error) {
        throw error;
      }

      // Tentar inserir na tabela de solicitações de reembolso (se existir)
      try {
        const { error: logError } = await supabase
          .from('solicitacoes_reembolso')
          .insert({
            compra_id: purchaseId,
            user_id: refundDialog.purchase.user_id,
            motivo: refundReason,
            status: 'pendente',
            valor: refundDialog.purchase.valor,
            data_solicitacao: new Date().toISOString()
          });

        if (logError) {
          console.log('Tabela solicitacoes_reembolso não existe ou erro ao inserir:', logError);
          // Continua normalmente mesmo se a tabela extra não existir
        }
      } catch (logError) {
        console.log('Tabela solicitacoes_reembolso não disponível');
      }

      alert('Solicitação de reembolso enviada para análise! Entraremos em contato em breve.');
      
      // Fechar o diálogo e recarregar as compras
      closeRefundDialog();
      refetch(); // Usar refetch em vez de refreshPurchases

    } catch (error) {
      console.error('Erro ao processar solicitação de reembolso:', error);
      alert('Erro ao processar solicitação de reembolso. Tente novamente.');
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
                const canRefund = isRefundAvailable(purchase.data_compra) && 
                                 purchase.status !== 'reembolsado' && 
                                 purchase.status !== 'analise';
                
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
                            
                            {purchase.data_experiencia && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-600">Experiência agendada:</span>
                                <span className="font-medium text-green-700">
                                  {formatDate(purchase.data_experiencia)}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`h-4 w-4 ${
                                purchase.status === 'confirmado' ? 'text-green-600' :
                                purchase.status === 'analise' ? 'text-yellow-600' :
                                purchase.status === 'reembolsado' ? 'text-blue-600' :
                                'text-gray-600'
                              }`} />
                              <span className="text-sm text-gray-600">Status:</span>
                              <span className={`font-medium capitalize ${
                                purchase.status === 'confirmado' ? 'text-green-600' :
                                purchase.status === 'analise' ? 'text-yellow-600' :
                                purchase.status === 'reembolsado' ? 'text-blue-600' :
                                'text-gray-600'
                              }`}>
                                {purchase.status === 'analise' ? 'em análise' : purchase.status}
                              </span>
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
                                onClick={() => openRefundDialog(purchase)}
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                              >
                                <Undo2 className="h-4 w-4 mr-2" />
                                Solicitar Reembolso
                              </Button>
                            )}
                            
                            {purchase.status === 'reembolsado' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Reembolsado
                              </span>
                            )}
                            
                            {purchase.status === 'analise' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Reembolso em Análise
                              </span>
                            )}
                            
                            {!canRefund && purchase.status === 'confirmado' && (
                              <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
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

      {/* Diálogo de Solicitação de Reembolso */}
      <Dialog open={refundDialog.isOpen} onOpenChange={closeRefundDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Undo2 className="h-5 w-5 text-red-600" />
              Solicitar Reembolso
            </DialogTitle>
            <DialogDescription>
              Informe o motivo da solicitação de reembolso para a experiência: 
              <strong> {refundDialog.purchase?.experiencias_dis.titulo}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="refund-reason" className="text-sm font-medium">
                Motivo do reembolso *
              </label>
              <Textarea
                id="refund-reason"
                placeholder="Descreva o motivo da sua solicitação de reembolso..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-yellow-800 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Importante:</span>
              </div>
              <ul className="text-yellow-700 text-xs mt-1 space-y-1 list-disc list-inside">
                <li>Reembolsos são avaliados em até 5 dias úteis</li>
                <li>O valor será devolvido pelo mesmo método de pagamento</li>
                <li>Após a análise, você receberá um e-mail com o resultado</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeRefundDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRefund}
              disabled={!refundReason.trim() || processingRefunds[refundDialog.purchase?.id || 0]}
              className="bg-red-600 hover:bg-red-700"
            >
              {processingRefunds[refundDialog.purchase?.id || 0] ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Undo2 className="h-4 w-4 mr-2" />
                  Solicitar Reembolso
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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