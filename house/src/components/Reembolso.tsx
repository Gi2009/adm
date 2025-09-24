// src/pages/RefundManagement.tsx
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
  experiencia_id: number;
  data_compra: string;
  status: string;
  valor: number;
  quantidade_ingressos: number;
  data_experiencia: string | null;
  motivo_reembolso: string | null;
  data_solicitacao_reembolso: string | null;
  user_nome: string;
  user_email: string;
  experiencia_titulo: string;
  experiencia_local: string;
  detalhes_pagamento?: any;
  created_at?: string;
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
      
      // Buscar explicitamente os campos de reembolso
      const { data: comprasData, error } = await supabase
        .from("compras_experiencias")
        .select(`
          id,
          user_id,
          experiencia_id,
          data_compra,
          status,
          valor,
          quantidade_ingressos,
          data_experiencia,
          motivo_reembolso,
          data_solicitacao_reembolso,
          detalhes_pagamento,
          created_at
        `)
        .eq("status", "analise")
        .order("data_solicitacao_reembolso", { ascending: false });

      if (error) throw error;

      if (!comprasData || comprasData.length === 0) {
        setRefundRequests([]);
        return;
      }

      // Enriquecer os dados com informações do usuário e experiência
      const requestsEnriquecidas: RefundRequest[] = await Promise.all(
        comprasData.map(async (compra) => {
          try {
            // Buscar informações do usuário
            const { data: userProfile } = await supabase
              .from("profiles")
              .select("nome, email")
              .eq("user_id", compra.user_id)
              .single();

            // Buscar informações da experiência
            const { data: experienciaData } = await supabase
              .from("experiencias_dis")
              .select("titulo, local")
              .eq("id", compra.experiencia_id)
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
              motivo_reembolso: compra.motivo_reembolso || null,
              data_solicitacao_reembolso: compra.data_solicitacao_reembolso || null,
              user_nome: userProfile?.nome || "Usuário não encontrado",
              user_email: userProfile?.email || "Email não disponível",
              experiencia_titulo: experienciaData?.titulo || `Experiência #${compra.experiencia_id}`,
              experiencia_local: experienciaData?.local || "Local não informado",
              detalhes_pagamento: compra.detalhes_pagamento,
              created_at: compra.created_at
            };
          } catch (error) {
            console.error(`Erro ao enriquecer compra ${compra.id}:`, error);
            return {
              id: compra.id,
              user_id: compra.user_id,
              experiencia_id: compra.experiencia_id,
              data_compra: compra.data_compra,
              status: compra.status,
              valor: compra.valor,
              quantidade_ingressos: compra.quantidade_ingressos,
              data_experiencia: compra.data_experiencia,
              motivo_reembolso: compra.motivo_reembolso || null,
              data_solicitacao_reembolso: compra.data_solicitacao_reembolso || null,
              user_nome: "Erro ao carregar",
              user_email: "Erro ao carregar",
              experiencia_titulo: `Experiência #${compra.experiencia_id}`,
              experiencia_local: "Erro ao carregar",
              detalhes_pagamento: compra.detalhes_pagamento,
              created_at: compra.created_at
            };
          }
        })
      );

      setRefundRequests(requestsEnriquecidas);
      
    } catch (error: any) {
      console.error("Erro ao carregar solicitações de reembolso:", error);
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
      const newStatus = decisionDialog.decision === 'approve' ? 'reembolsado' : 'confirmado';
      
      // Primeiro tentar atualizar com resposta_admin
      let updateData: any = { 
        status: newStatus,
        resposta_admin: adminResponse || `Reembolso ${decisionDialog.decision === 'approve' ? 'aprovado' : 'rejeitado'} pelo administrador.`
      };

      const { error: updateError } = await supabase
        .from('compras_experiencias')
        .update(updateData)
        .eq('id', requestId);

      // Se der erro por coluna não existente, tentar sem resposta_admin
      if (updateError && updateError.message.includes('resposta_admin')) {
        const { error: retryError } = await supabase
          .from('compras_experiencias')
          .update({ status: newStatus })
          .eq('id', requestId);

        if (retryError) throw retryError;
      } else if (updateError) {
        throw updateError;
      }

      // Tentar registrar na tabela de solicitações de reembolso
      try {
        const { error: logError } = await supabase
          .from('solicitacoes_reembolso')
          .update({
            status: decisionDialog.decision === 'approve' ? 'aprovado' : 'rejeitado',
            data_resolucao: new Date().toISOString(),
            resposta_admin: adminResponse
          })
          .eq('compra_id', requestId);

        if (logError) {
          console.log('Tabela solicitacoes_reembolso não disponível para update');
        }
      } catch (logError) {
        console.log('Tabela solicitacoes_reembolso não disponível');
      }

      toast({
        title: "Sucesso!",
        description: `Reembolso ${decisionDialog.decision === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso.`,
      });

      closeDecisionDialog();
      fetchRefundRequests();

    } catch (error: any) {
      console.error('Erro ao processar decisão:', error);
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
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
      (request.motivo_reembolso && request.motivo_reembolso.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
                <p className="text-sm text-muted-foreground">Em Análise</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {refundRequests.filter(r => r.status === 'analise').length}
                </p>
              </div>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(refundRequests.reduce((sum, r) => sum + r.valor, 0))}
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Última Atualização</p>
                <p className="text-sm font-medium">Agora</p>
              </div>
              <Calendar className="h-4 w-4 text-gray-500" />
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
                        Solicitação #{request.id} • {formatDate(request.data_solicitacao_reembolso)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Em Análise
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
                        <div>
                          <span className="text-muted-foreground">Ingressos: </span>
                          <span className="font-medium">{request.quantidade_ingressos}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Data compra: </span>
                          <span className="font-medium">{formatDate(request.data_compra)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Motivo do Reembolso */}
                  {request.motivo_reembolso && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Motivo do Reembolso</h4>
                      <div className="bg-gray-50 rounded-md p-3 text-sm">
                        {request.motivo_reembolso}
                      </div>
                    </div>
                  )}

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
                ? "Você está prestes a aprovar o reembolso desta compra. O valor será devolvido ao usuário."
                : "Você está prestes a rejeitar o pedido de reembolso. A compra permanecerá confirmada."
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
                  {decisionDialog.request.motivo_reembolso && (
                    <p><strong>Motivo do usuário:</strong> {decisionDialog.request.motivo_reembolso}</p>
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