// components/purchases/PurchasesPage.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ExperienceDetails from "@/components/experiences/ExperienceDetails";
import { Loader2, ShoppingBag, Calendar, CheckCircle, Users, Undo2, AlertCircle, XCircle } from "lucide-react";

// Interface simplificada
interface Purchase {
  id: number;
  user_id: string;
  experiencia_id: number;
  data_compra: string;
  status: string;
  valor: number;
  quantidade_ingressos?: number;
  data_experiencia?: string | null;
  detalhes_pagamento?: any;
  created_at?: string;
  experiencia_titulo?: string;
  experiencia_img?: string;
  experiencia_local?: string;
}

const PurchasesPage = () => {
  const { user, signOut } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingRefunds, setProcessingRefunds] = useState<{[key: number]: boolean}>({});
  const [refundDialog, setRefundDialog] = useState<{isOpen: boolean; purchase: Purchase | null}>({
    isOpen: false,
    purchase: null
  });
  const [refundReason, setRefundReason] = useState("");

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Primeiro buscar as compras
      const { data: comprasData, error } = await supabase
        .from('compras_experiencias')
        .select('*')
        .eq('user_id', user.id)
        .order('data_compra', { ascending: false });

      if (error) {
        console.error('Erro ao buscar compras:', error);
        throw error;
      }

      if (!comprasData) {
        setPurchases([]);
        return;
      }

      // Enriquecer os dados com informações das experiências
      const purchasesEnriched = await Promise.all(
        comprasData.map(async (compra) => {
          try {
            // Buscar informações da experiência
            const { data: experienciaData } = await supabase
              .from('experiencias_dis')
              .select('titulo, img, local')
              .eq('id', compra.experiencia_id)
              .single();

            return {
              id: compra.id,
              user_id: compra.user_id,
              experiencia_id: compra.experiencia_id,
              data_compra: compra.data_compra,
              status: compra.status,
              valor: compra.valor,
              quantidade_ingressos: compra.quantidade_ingressos,
              data_experiencia: compra.data_experiencia,
              detalhes_pagamento: compra.detalhes_pagamento,
              created_at: compra.created_at,
              experiencia_titulo: experienciaData?.titulo || 'Experiência não encontrada',
              experiencia_img: experienciaData?.img || '',
              experiencia_local: experienciaData?.local || 'Local não informado'
            };
          } catch (error) {
            console.error(`Erro ao buscar experiência ${compra.experiencia_id}:`, error);
            return {
              ...compra,
              experiencia_titulo: 'Erro ao carregar',
              experiencia_img: '',
              experiencia_local: 'Erro ao carregar'
            };
          }
        })
      );
      
      console.log('Compras carregadas:', purchasesEnriched);
      setPurchases(purchasesEnriched);
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string | null | undefined) => {
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmado':
        return { 
          text: 'Confirmado', 
          color: 'text-green-600', 
          bgColor: 'bg-green-100',
          icon: CheckCircle 
        };
      case 'analise':
        return { 
          text: 'Reembolso em Análise', 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100',
          icon: AlertCircle 
        };
      case 'reembolsado':
        return { 
          text: 'Reembolsado', 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-100',
          icon: CheckCircle 
        };
      case 'rejeitado':
        return { 
          text: 'Reembolso Rejeitado', 
          color: 'text-red-600', 
          bgColor: 'bg-red-100',
          icon: XCircle 
        };
      default:
        return { 
          text: status, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-100',
          icon: AlertCircle 
        };
    }
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
    // 1. Primeiro, atualizar o status da compra para 'analise'
    const { error: updateError } = await supabase
      .from('compras_experiencias')
      .update({ 
        status: 'analise',
        motivo_reembolso: refundReason,
        data_solicitacao_reembolso: new Date().toISOString()
      })
      .eq('id', purchaseId);

    if (updateError) throw updateError;

    // 2. Inserir na tabela de solicitações de reembolso
    const { error: solicitacaoError } = await supabase
      .from('solicitacoes_reembolso')
      .insert({
        compra_id: purchaseId,
        user_id: user?.id,
        motivo: refundReason,
        status: 'pendente',
        valor: refundDialog.purchase.valor,
        data_solicitacao: new Date().toISOString()
      });

    if (solicitacaoError) {
      console.error('Erro ao inserir na tabela de solicitações:', solicitacaoError);
      // Não interrompe o fluxo, apenas registra o erro
    }

    alert('Solicitação de reembolso enviada para análise! Entraremos em contato em breve.');
    
    closeRefundDialog();
    
    // 3. Atualizar a lista de compras imediatamente
    setPurchases(prevPurchases => 
      prevPurchases.map(purchase => 
        purchase.id === purchaseId 
          ? { 
              ...purchase, 
              status: 'analise',
              motivo_reembolso: refundReason,
              data_solicitacao_reembolso: new Date().toISOString()
            }
          : purchase
      )
    );
    
    // 4. Buscar dados atualizados do servidor
    fetchPurchases();

  } catch (error) {
    console.error('Erro ao processar solicitação de reembolso:', error);
    alert('Erro ao processar solicitação de reembolso. Tente novamente.');
  } finally {
    setProcessingRefunds(prev => ({ ...prev, [purchaseId]: false }));
  }
};


  const handleCardClick = async (purchase: Purchase) => {
    try {
      // Buscar detalhes completos da experiência
      const { data: experienciaData } = await supabase
        .from('experiencias_dis')
        .select('*')
        .eq('id', purchase.experiencia_id)
        .single();

      setSelectedExperience(experienciaData);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes da experiência:', error);
      alert('Erro ao carregar detalhes da experiência.');
    }
  };

  if (loading) {
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
                                 purchase.status !== 'analise' &&
                                 purchase.status !== 'rejeitado';
                
                const statusInfo = getStatusInfo(purchase.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={purchase.id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <img 
                            src={purchase.experiencia_img || ''} 
                            alt={purchase.experiencia_titulo || 'Experiência'}
                            className="w-48 h-32 object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {purchase.experiencia_titulo || 'Experiência não encontrada'}
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
                              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                              <span className="text-sm text-gray-600">Status:</span>
                              <span className={`font-medium capitalize ${statusInfo.color}`}>
                                {statusInfo.text}
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

                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Local:</span>
                              <span className="font-medium">{purchase.experiencia_local}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <Button 
                              onClick={() => handleCardClick(purchase)}
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
                            
                            <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              <StatusIcon className="h-4 w-4 mr-1" />
                              {statusInfo.text}
                            </span>
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
              <strong> {refundDialog.purchase?.experiencia_titulo || 'Experiência'}</strong>
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