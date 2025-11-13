import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Undo2, CheckCircle, XCircle, Calendar, DollarSign, User, Mail, AlertCircle, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RefundRequest {
  id: number;
  user_id: string;
  compra_id: number;
  motivo: string;
  status: string;
  valor: number | null;
  data_solicitacao: string;
  data_resolucao: string | null;
  resposta_admin: string | null;
  user_nome: string;
  user_email: string;
  experiencia_titulo: string;
  experiencia_local: string;
  quantidade_ingressos?: number;
  data_compra?: string;
  data_experiencia?: string | null;
}

const RefundManagement = () => {
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [decisionDialog, setDecisionDialog] = useState<{
    isOpen: boolean;
    request: RefundRequest | null;
    decision: 'approve' | 'reject' | null;
  }>({
    isOpen: false,
    request: null,
    decision: null
  });
  const [adminResponse, setAdminResponse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { toast } = useToast();

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Buscando solicitações de reembolso...');
      
      // Buscar da tabela solicitacoes_reembolso
      const { data: solicitacoesData, error } = await supabase
        .from("solicitacoes_reembolso")
        .select(`
          id,
          compra_id,
          user_id,
          motivo,
          status,
          valor,
          data_solicitacao,
          data_resolucao,
          resposta_admin
        `)
        .in("status", ["pendente", "analise"])
        .order("data_solicitacao", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar solicitações:", error);
        throw error;
      }

      console.log('✅ Solicitações encontradas:', solicitacoesData?.length || 0);

      if (!solicitacoesData || solicitacoesData.length === 0) {
        setRefundRequests([]);
        return;
      }

      // Enriquecer os dados com informações do usuário, compra e experiência
      const requestsEnriquecidas: RefundRequest[] = await Promise.all(
        solicitacoesData.map(async (solicitacao) => {
          try {
            // Buscar informações do usuário
            const { data: userProfile } = await supabase
              .from("profiles")
              .select("nome, email")
              .eq("user_id", solicitacao.user_id)
              .single();

            // Buscar informações da compra
            const { data: compraData } = await supabase
              .from("compras_experiencias")
              .select(`
                experiencia_id,
                quantidade_ingressos,
                data_compra,
                data_experiencia
              `)
              .eq("id", solicitacao.compra_id)
              .single();

            // Buscar informações da experiência
            let experienciaTitulo = "Experiência não encontrada";
            let experienciaLocal = "Local não informado";

            if (compraData?.experiencia_id) {
              const { data: experienciaData } = await supabase
                .from("experiencias_dis")
                .select("titulo, local")
                .eq("id", compraData.experiencia_id)
                .single();

              if (experienciaData) {
                experienciaTitulo = experienciaData.titulo || `Experiência #${compraData.experiencia_id}`;
                experienciaLocal = experienciaData.local || "Local não informado";
              }
            }

            return {
              id: solicitacao.id,
              user_id: solicitacao.user_id,
              compra_id: solicitacao.compra_id,
              motivo: solicitacao.motivo,
              status: solicitacao.status,
              valor: solicitacao.valor,
              data_solicitacao: solicitacao.data_solicitacao,
              data_resolucao: solicitacao.data_resolucao,
              resposta_admin: solicitacao.resposta_admin,
              user_nome: userProfile?.nome || "Usuário não encontrado",
              user_email: userProfile?.email || "Email não disponível",
              experiencia_titulo: experienciaTitulo,
              experiencia_local: experienciaLocal,
              quantidade_ingressos: compraData?.quantidade_ingressos,
              data_compra: compraData?.data_compra,
              data_experiencia: compraData?.data_experiencia
            };
          } catch (error) {
            console.error(`❌ Erro ao enriquecer solicitação ${solicitacao.id}:`, error);
            return {
              id: solicitacao.id,
              user_id: solicitacao.user_id,
              compra_id: solicitacao.compra_id,
              motivo: solicitacao.motivo,
              status: solicitacao.status,
              valor: solicitacao.valor,
              data_solicitacao: solicitacao.data_solicitacao,
              data_resolucao: solicitacao.data_resolucao,
              resposta_admin: solicitacao.resposta_admin,
              user_nome: "Erro ao carregar",
              user_email: "Erro ao carregar",
              experiencia_titulo: `Experiência #${solicitacao.compra_id}`,
              experiencia_local: "Erro ao carregar",
              quantidade_ingressos: 0,
              data_compra: new Date().toISOString(),
              data_experiencia: null
            };
          }
        })
      );

      console.log('📊 Solicitações enriquecidas:', requestsEnriquecidas.length);
      setRefundRequests(requestsEnriquecidas);
      
    } catch (error: any) {
      console.error("💥 Erro ao carregar solicitações de reembolso:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações de reembolso.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDecisionDialog = (request: RefundRequest, decision: 'approve' | 'reject') => {
    setDecisionDialog({
      isOpen: true,
      request,
      decision
    });
    setAdminResponse("");
  };

  const closeDecisionDialog = () => {
    setDecisionDialog({
      isOpen: false,
      request: null,
      decision: null
    });
    setAdminResponse("");
  };

  const handleDecision = async () => {
  if (!decisionDialog.request || !decisionDialog.decision) return;

  const requestId = decisionDialog.request.id;
  setProcessingId(requestId);

  try {
    const newStatus = decisionDialog.decision === 'approve' ? 'aprovado' : 'rejeitado';
    const dataResolucao = new Date().toISOString();
    
    console.log(`🔄 Processando ${newStatus} para solicitação ${requestId}`);
    
    // Atualizar a tabela solicitacoes_reembolso
    const { error: updateError } = await supabase
      .from('solicitacoes_reembolso')
      .update({
        status: newStatus,
        data_resolucao: dataResolucao,
        resposta_admin: adminResponse || `Reembolso ${decisionDialog.decision === 'approve' ? 'aprovado' : 'rejeitado'} pelo administrador.`
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('❌ Erro ao atualizar solicitação:', updateError);
      throw updateError;
    }

    // Se foi aprovado, também atualizar a compra para status 'reembolsado'
    if (decisionDialog.decision === 'approve') {
      const { error: compraError } = await supabase
        .from('compras_experiencias')
        .update({ 
          status: 'reembolsado',
          motivo_reembolso: decisionDialog.request.motivo,
          data_solicitacao_reembolso: decisionDialog.request.data_solicitacao,
          resposta_admin: adminResponse || 'Reembolso aprovado pelo administrador.'
        })
        .eq('id', decisionDialog.request.compra_id);

      if (compraError) {
        console.error('❌ Erro ao atualizar compra:', compraError);
        throw compraError;
      }
    } else {
      // Se foi rejeitado, voltar o status da compra para 'confirmado'
      const { error: compraError } = await supabase
        .from('compras_experiencias')
        .update({ 
          status: 'confirmado',
          resposta_admin: adminResponse || 'Solicitação de reembolso rejeitada.'
        })
        .eq('id', decisionDialog.request.compra_id);

      if (compraError) {
        console.warn('⚠️ Aviso: Não foi possível atualizar a compra:', compraError);
      }
    }

    console.log('✅ Decisão processada com sucesso');
    
    toast({
      title: "Sucesso!",
      description: `Reembolso ${decisionDialog.decision === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso.`,
    });

    closeDecisionDialog();
    fetchRefundRequests();

  } catch (error: any) {
    console.error('💥 Erro ao processar decisão:', error);
    toast({
      title: "Erro",
      description: "Erro ao processar a decisão. Tente novamente.",
      variant: "destructive",
    });
  } finally {
    setProcessingId(null);
  }
};
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não informada";
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

  const filteredRequests = refundRequests.filter(request => {
    const matchesSearch = searchTerm === "" || 
      request.user_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.experiencia_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.motivo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando solicitações de reembolso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Undo2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Reembolsos</h1>
          <Badge variant="secondary" className="ml-4">
            {refundRequests.length} solicitações
          </Badge>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{refundRequests.length}</p>
              </div>
              <Undo2 className="h-4 w-4 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {refundRequests.filter(r => r.status === 'pendente').length}
                </p>
              </div>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Análise</p>
                <p className="text-2xl font-bold text-orange-600">
                  {refundRequests.filter(r => r.status === 'analise').length}
                </p>
              </div>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(refundRequests.reduce((sum, r) => sum + (r.valor || 0), 0))}
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, email, experiência ou motivo..."
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
                  variant={filterStatus === "pendente" ? "secondary" : "outline"}
                  onClick={() => setFilterStatus("pendente")}
                  size="sm"
                >
                  Pendentes
                </Button>
                <Button
                  variant={filterStatus === "analise" ? "secondary" : "outline"}
                  onClick={() => setFilterStatus("analise")}
                  size="sm"
                >
                  Em Análise
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Solicitações */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Undo2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {refundRequests.length === 0 ? "Nenhuma solicitação de reembolso" : "Nenhum resultado para a busca"}
              </h3>
              <p className="text-muted-foreground">
                {refundRequests.length === 0 
                  ? "Não há solicitações de reembolso pendentes no momento." 
                  : "Tente ajustar os filtros ou termos de busca."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.experiencia_titulo}</CardTitle>
                      <CardDescription>
                        Solicitação #{request.id} • {formatDate(request.data_solicitacao)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={
                      request.status === 'pendente' 
                        ? "bg-yellow-100 text-yellow-800 border-yellow-300" 
                        : "bg-orange-100 text-orange-800 border-orange-300"
                    }>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {request.status === 'pendente' ? 'Pendente' : 'Em Análise'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Informações do Usuário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Usuário
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nome: </span>
                          <span className="font-medium">{request.user_nome}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email: </span>
                          <span className="font-medium">{request.user_email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Informações da Compra */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Compra
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Valor: </span>
                          <span className="font-medium text-green-600">{formatCurrency(request.valor)}</span>
                        </div>
                        {request.quantidade_ingressos && (
                          <div>
                            <span className="text-muted-foreground">Ingressos: </span>
                            <span className="font-medium">{request.quantidade_ingressos}</span>
                          </div>
                        )}
                        {request.data_compra && (
                          <div>
                            <span className="text-muted-foreground">Data compra: </span>
                            <span className="font-medium">{formatDate(request.data_compra)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Motivo do Reembolso */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Motivo do Reembolso</h4>
                    <div className="bg-gray-50 rounded-md p-3 text-sm">
                      {request.motivo}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => openDecisionDialog(request, 'approve')}
                      disabled={processingId === request.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar Reembolso
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => openDecisionDialog(request, 'reject')}
                      disabled={processingId === request.id}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      {processingId === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeitar Reembolso
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de Decisão */}
      <Dialog open={decisionDialog.isOpen} onOpenChange={closeDecisionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {decisionDialog.decision === 'approve' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Aprovar Reembolso
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Rejeitar Reembolso
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {decisionDialog.decision === 'approve' 
                ? "Você está prestes a aprovar o reembolso."
                : "Você está prestes a rejeitar o reembolso. A compra permanecerá confirmada."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="admin-response" className="text-sm font-medium">
                Resposta para o usuário {decisionDialog.decision === 'reject' && '(opcional)'}
              </label>
              <Textarea
                id="admin-response"
                placeholder={
                  decisionDialog.decision === 'approve' 
                    ? "Informe os detalhes da aprovação..." 
                    : "Informe o motivo da rejeição (recomendado)..."
                }
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            {decisionDialog.request && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="text-sm text-blue-800">
                  <p><strong>Usuário:</strong> {decisionDialog.request.user_nome}</p>
                  <p><strong>Experiência:</strong> {decisionDialog.request.experiencia_titulo}</p>
                  <p><strong>Valor:</strong> {formatCurrency(decisionDialog.request.valor)}</p>
                  {decisionDialog.request.motivo && (
                    <p><strong>Motivo do usuário:</strong> {decisionDialog.request.motivo}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDecisionDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleDecision}
              disabled={processingId === decisionDialog.request?.id}
              className={
                decisionDialog.decision === 'approve' 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {processingId === decisionDialog.request?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  {decisionDialog.decision === 'approve' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar Reembolso
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar Reembolso
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundManagement;