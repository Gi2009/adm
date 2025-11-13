import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Mail, Phone, MapPin, Check, X, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

interface Candidate {
  id: number;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  municipio: string | null;
  idade: string | null;
  comunidade: string | null;
  associacao: string | null;
  cont_asso: string | null;
  exp_prevista: string | null;
  created_at: string;
}

const CandidatesDashboard = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []); 

  const fetchCandidates = async () => {
    try {
      console.log('🔍 Buscando candidatos...');
      
      const { data, error } = await supabase
        .from('candidatos_oferec')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar candidatos:', error);
        throw error;
      }

      console.log('✅ Candidatos encontrados:', data?.length);
      setCandidates(data || []);
      
    } catch (error: any) {
      console.error('💥 Erro detalhado:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os candidatos. Verifique as permissões do banco.",
        variant: "destructive",
      });
      
      // Dados mock para teste
      const mockCandidates: Candidate[] = [
        {
          id: 1,
          nome: "Candidato Teste 1",
          email: "teste1@email.com",
          telefone: "(11) 99999-9999",
          endereco: "Rua Teste, 123",
          municipio: "São Paulo",
          idade: "30",
          comunidade: "Comunidade Teste",
          associacao: "Associação Teste",
          cont_asso: "(11) 88888-8888",
          exp_prevista: "Artesanato local",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: "Candidato Teste 2",
          email: "teste2@email.com",
          telefone: "(11) 77777-7777",
          endereco: "Avenida Teste, 456",
          municipio: "Rio de Janeiro",
          idade: "25",
          comunidade: "Comunidade Teste 2",
          associacao: "Associação Teste 2",
          cont_asso: "(11) 66666-6666",
          exp_prevista: "Culinária tradicional",
          created_at: new Date().toISOString()
        }
      ];
      
      setCandidates(mockCandidates);
      
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (candidate: Candidate) => {
    if (!candidate.email || !candidate.nome) {
      toast({
        title: "Erro",
        description: "Candidato precisa ter email e nome para ser aprovado.",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(candidate.id);

    try {
      // Gerar token único
      const token = crypto.randomUUID();

      console.log('✅ Aprovando candidato:', candidate.nome);

      // Inserir na tabela de candidatos aprovados (versão simplificada)
      const { error: insertError } = await supabase
        .from('candidatos_aprovados')
        .insert({
          candidato_id: candidate.id,
          email: candidate.email,
          nome: candidate.nome,
          token: token
        });

      if (insertError) {
        console.error('❌ Erro ao inserir candidato aprovado:', insertError);
        throw insertError;
      }

      // Tentar enviar email (se a função edge existir)
      try {
        const { error: emailError } = await supabase.functions.invoke('candidate-email', {
          body: {
            email: candidate.email,
            nome: candidate.nome,
            type: 'approved',
            token: token
          }
        });

        if (emailError) {
          console.warn('⚠️ Erro ao enviar email (pode ser normal se a função não existir):', emailError);
        }
      } catch (emailError) {
        console.warn('⚠️ Erro na função de email:', emailError);
      }

      // Remover candidato da lista após aprovação
      const { error: deleteError } = await supabase
        .from('candidatos_oferec')
        .delete()
        .eq('id', candidate.id);

      if (deleteError) {
        console.error('❌ Erro ao deletar candidato:', deleteError);
        throw deleteError;
      }

      toast({
        title: "Sucesso!",
        description: `Candidato ${candidate.nome} aprovado com sucesso.`,
      });

      // Atualizar lista
      fetchCandidates();

    } catch (error: any) {
      console.error('💥 Erro ao aprovar candidato:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar candidato. Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (candidate: Candidate) => {
    if (!candidate.email || !candidate.nome) {
      toast({
        title: "Erro",
        description: "Candidato precisa ter email e nome para ser rejeitado.",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(candidate.id);

    try {
      console.log('❌ Rejeitando candidato:', candidate.nome);

      // Tentar enviar email de rejeição
      try {
        const { error: emailError } = await supabase.functions.invoke('candidate-email', {
          body: {
            email: candidate.email,
            nome: candidate.nome,
            type: 'rejected'
          }
        });

        if (emailError) {
          console.warn('⚠️ Erro ao enviar email de rejeição:', emailError);
        }
      } catch (emailError) {
        console.warn('⚠️ Erro na função de email de rejeição:', emailError);
      }

      // Remover candidato da lista
      const { error: deleteError } = await supabase
        .from('candidatos_oferec')
        .delete()
        .eq('id', candidate.id);

      if (deleteError) {
        console.error('❌ Erro ao deletar candidato rejeitado:', deleteError);
        throw deleteError;
      }

      toast({
        title: "Candidato rejeitado",
        description: `${candidate.nome} foi removido da lista de candidatos.`,
      });

      // Atualizar lista
      fetchCandidates();

    } catch (error: any) {
      console.error('💥 Erro ao rejeitar candidato:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar candidato. Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Candidatos</h1>
          <Badge variant="secondary" className="ml-4">
            {candidates.length} candidatos
          </Badge>
          <Link to="/admin-registration" className="ml-auto">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Admin
            </Button>
          </Link>
        </div>

        {candidates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum candidato encontrado</h3>
              <p className="text-muted-foreground">
                Ainda não há candidatos cadastrados no sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {candidate.nome || "Nome não informado"}
                  </CardTitle>
                  <CardDescription>
                    Cadastrado em {new Date(candidate.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {candidate.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{candidate.email}</span>
                    </div>
                  )}
                  
                  {candidate.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{candidate.telefone}</span>
                    </div>
                  )}
                  
                  {(candidate.endereco || candidate.municipio) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {candidate.endereco && candidate.municipio 
                          ? `${candidate.endereco}, ${candidate.municipio}`
                          : candidate.endereco || candidate.municipio}
                      </span>
                    </div>
                  )}

                  {candidate.idade && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Idade: </span>
                      <span className="text-foreground">{candidate.idade}</span>
                    </div>
                  )}

                  {candidate.comunidade && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Comunidade: </span>
                      <span className="text-foreground">{candidate.comunidade}</span>
                    </div>
                  )}

                  {candidate.associacao && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Associação: </span>
                      <span className="text-foreground">{candidate.associacao}</span>
                    </div>
                  )}

                  {candidate.cont_asso && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Contato Associação: </span>
                      <span className="text-foreground">{candidate.cont_asso}</span>
                    </div>
                  )}

                  {candidate.exp_prevista && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Experiência Prevista: </span>
                      <span className="text-foreground">{candidate.exp_prevista}</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(candidate)}
                      disabled={processingId === candidate.id}
                      className="flex-1"
                      size="sm"
                    >
                      {processingId === candidate.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReject(candidate)}
                      disabled={processingId === candidate.id}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      {processingId === candidate.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
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
    </div>
  );
};

export default CandidatesDashboard;