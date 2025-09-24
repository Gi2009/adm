import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Mail, Phone, MapPin, Check, X, UserPlus, FileImage, IdCard, Home } from "lucide-react";
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
  url_foto_documento: string | null;
  url_comprovante_endereco: string | null;
}

const CandidatesDashboard = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; url: string | null; title: string }>({
    isOpen: false,
    url: null,
    title: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidatos_oferec')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os candidatos.",
        variant: "destructive",
      });
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

      // Procurar perfil existente por EMAIL (agora comparando por email)
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('user_id, type, nome, telefone, local, "associação", email')
        .eq('email', candidate.email);
      
      let userId = existingProfiles?.[0]?.user_id;

      // Se existe perfil com mesmo EMAIL, atualizar informações e tipo para 2
      if (userId && candidate.email) {
        const existingProfile = existingProfiles[0];
        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({
            type: '2', // Atualizar tipo para 2
            nome: candidate.nome || existingProfile.nome,
            telefone: candidate.telefone || existingProfile.telefone,
            local: candidate.municipio || existingProfile.local,
            'associação': candidate.associacao || existingProfile.associação,
            email: candidate.email // Adicionar o campo email obrigatório
          })
          .eq('user_id', userId);

        if (updateProfileError) throw updateProfileError;
      }

      // Inserir na tabela de candidatos aprovados
      const { error: insertError } = await supabase
        .from('candidatos_aprovados')
        .insert({
          candidato_id: candidate.id,
          email: candidate.email,
          nome: candidate.nome,
          token: token
        });

      if (insertError) throw insertError;

      // Enviar email de aprovação
      const { error: emailError } = await supabase.functions.invoke('candidate-email', {
        body: {
          email: candidate.email,
          nome: candidate.nome,
          type: 'approved',
          token: token
        }
      });

      if (emailError) throw emailError;

      // Remover candidato da lista após aprovação
      const { error: deleteError } = await supabase
        .from('candidatos_oferec')
        .delete()
        .eq('id', candidate.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Sucesso!",
        description: `Candidato ${candidate.nome} aprovado e email enviado. ${userId ? 'Perfil atualizado para tipo 2.' : 'Usuário poderá se registrar como tipo 2.'}`,
      });

      // Atualizar lista
      fetchCandidates();

    } catch (error: any) {
      console.error('Error approving candidate:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar candidato. Tente novamente.",
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
      // Enviar email de rejeição
      const { error: emailError } = await supabase.functions.invoke('candidate-email', {
        body: {
          email: candidate.email,
          nome: candidate.nome,
          type: 'rejected'
        }
      });

      if (emailError) throw emailError;

      // Remover candidato da lista
      const { error: deleteError } = await supabase
        .from('candidatos_oferec')
        .delete()
        .eq('id', candidate.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Candidato rejeitado",
        description: `${candidate.nome} foi rejeitado e email enviado.`,
      });

      // Atualizar lista
      fetchCandidates();

    } catch (error: any) {
      console.error('Error rejecting candidate:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar candidato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openImageModal = (url: string | null, title: string) => {
    if (!url) {
      toast({
        title: "Imagem não disponível",
        description: "Comprovante não foi enviado pelo candidato.",
        variant: "destructive",
      });
      return;
    }
    setImageModal({ isOpen: true, url, title });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, url: null, title: "" });
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
      {/* Modal para visualizar imagens */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{imageModal.title}</h3>
              <Button variant="ghost" onClick={closeImageModal} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {imageModal.url ? (
                <img 
                  src={imageModal.url} 
                  alt={imageModal.title}
                  className="max-w-full max-h-96 object-contain mx-auto"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', imageModal.url);
                    toast({
                      title: "Erro ao carregar imagem",
                      description: "URL da imagem pode estar inválida.",
                      variant: "destructive",
                    });
                  }}
                />
              ) : (
                <div className="text-center p-8">
                  <FileImage className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p>Imagem não disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  {/* Informações Pessoais */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Informações Pessoais</h4>
                    
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
                    
                    {candidate.idade && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Idade: </span>
                        <span className="text-foreground">{candidate.idade}</span>
                      </div>
                    )}
                  </div>

                  {/* Endereço */}
                  {(candidate.endereco || candidate.municipio) && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Endereço</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {candidate.endereco && candidate.municipio 
                            ? `${candidate.endereco}, ${candidate.municipio}`
                            : candidate.endereco || candidate.municipio}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Informações da Comunidade */}
                  {(candidate.comunidade || candidate.associacao || candidate.cont_asso) && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Comunidade & Associação</h4>
                      
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
                    </div>
                  )}

                  {/* Experiência Prevista */}
                  {candidate.exp_prevista && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">Experiência Oferecida</h4>
                      <div className="text-sm">
                        <span className="text-foreground">{candidate.exp_prevista}</span>
                      </div>
                    </div>
                  )}

                  {/* Comprovantes */}
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="font-semibold text-sm text-muted-foreground">Comprovantes</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openImageModal(candidate.url_foto_documento, `Documento - ${candidate.nome}`)}
                      >
                        <IdCard className="h-4 w-4 mr-1" />
                        Documento
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openImageModal(candidate.url_comprovante_endereco, `Comprovante Endereço - ${candidate.nome}`)}
                      >
                        <Home className="h-4 w-4 mr-1" />
                        Endereço
                      </Button>
                    </div>
                  </div>

                  {/* Ações */}
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