import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ProviderApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    isCommunityMember: "",
    communityName: "",
    experience: "",
    motivation: "",
    municipio: "",
    nome: "",
    endereco: "",
    idade: "",
    telefone: "",
    email: "",
    associacao: "",
    nome_ass: "", 
    cpf: "",
    cont_ass: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.isCommunityMember === "no") {
      navigate("/");
      return;
    }

    setIsLoading(true);

    try {
      // Preparar dados para inserção na tabela candidatos_oferec
      const dataToInsert = {
        municipio: formData.municipio,
        nome: formData.nome,
        endereco: formData.endereco,
        idade: formData.idade,
        telefone: formData.telefone,
        email: formData.email,
        comunidade: formData.communityName,
        associacao: formData.associacao === "yes" ? formData.nome_ass : null,
        cont_asso: formData.associacao === "yes" ? formData.cont_ass : null,
        exp_prevista: formData.experience
      };

      const { error } = await supabase
        .from('candidatos_oferec')
        .insert([dataToInsert]);

      if (error) {
        throw error;
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua solicitação foi enviada para análise.",
        variant: "default",
      });

      // Redirecionar após sucesso
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao salvar candidato:', error);
      toast({
        title: "Erro ao realizar cadastro",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Cadastro de Oferecedor</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações para Análise</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Você faz parte de uma comunidade tradicional?
                </Label>
                <RadioGroup
                  value={formData.isCommunityMember}
                  onValueChange={(value) => 
                    setFormData({...formData, isCommunityMember: value})
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Sim, sou membro de uma comunidade caiçara</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">Não, mas tenho experiência com turismo sustentável</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="community">Nome da Comunidade</Label>
                  <Input
                    id="community"
                    placeholder="Ex: Comunidade Caiçara do Bonete"
                    value={formData.communityName}
                    onChange={(e) => 
                      setFormData({...formData, communityName: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="experience">Experiência com Turismo</Label>
                  <Textarea
                    id="experience"
                    placeholder="Descreva sua experiência com turismo sustentável e atividades locais..."
                    value={formData.experience}
                    onChange={(e) => 
                      setFormData({...formData, experience: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome:</Label>
                  <Input
                    id="nome"
                    placeholder="Digite o seu nome"
                    value={formData.nome}
                    onChange={(e) => 
                      setFormData({...formData, nome: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Qual seu email"
                    value={formData.email}
                    onChange={(e) => 
                      setFormData({...formData, email: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="tel">Telefone</Label>
                  <Input
                    id="tel"
                    placeholder="Qual seu telefone"
                    value={formData.telefone}
                    onChange={(e) => 
                      setFormData({...formData, telefone: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="Qual seu CPF"
                    value={formData.cpf}
                    onChange={(e) => 
                      setFormData({...formData, cpf: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="idade">Idade</Label>
                  <Input
                    id="idade"
                    placeholder="Qual sua idade"
                    value={formData.idade}
                    onChange={(e) => 
                      setFormData({...formData, idade: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="mun">Município</Label>
                  <Input
                    id="mun"
                    placeholder="Qual seu município"
                    value={formData.municipio}
                    onChange={(e) => 
                      setFormData({...formData, municipio: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="end">Endereço</Label>
                  <Textarea
                    id="end"
                    placeholder="Qual seu endereço (RUA_NUMERO_CEP)"
                    value={formData.endereco}
                    onChange={(e) => 
                      setFormData({...formData, endereco: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Você faz parte de alguma associação?
                  </Label>
                  <RadioGroup
                    value={formData.associacao}
                    onValueChange={(value) => 
                      setFormData({...formData, associacao: value})
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="assoc-yes" />
                      <Label htmlFor="assoc-yes">Sim, sou membro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="assoc-no" />
                      <Label htmlFor="assoc-no">Não</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {formData.associacao === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="nom_ass">Nome da associação</Label>
                  <Input
                    id="nom_ass"
                    placeholder="Qual o nome da sua associação"
                    value={formData.nome_ass}
                    onChange={(e) => 
                      setFormData({...formData, nome_ass: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.associacao === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="con_ass">Contato da associação</Label>
                  <Input
                    id="con_ass"
                    placeholder="Qual o contato da sua associação"
                    value={formData.cont_ass}
                    onChange={(e) => 
                      setFormData({...formData, cont_ass: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="motivation">Motivação</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Por que você quer oferecer experiências através do Turnativo?"
                    value={formData.motivation}
                    onChange={(e) => 
                      setFormData({...formData, motivation: e.target.value})
                    }
                    required
                  />
                </div>
              )}

              {formData.isCommunityMember === "yes" && (
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar para Análise"}
                </Button>
              )}

              {formData.isCommunityMember === "no" && (
                <>
                  <Label className="text-destructive">
                    Sentimos muito, mas o app é exclusivo para experiências oferecidas por membros de comunidades tradicionais.
                    Agradecemos o seu interesse.
                  </Label>
                  <Button 
                    type="submit" 
                    variant="secondary"
                    className="w-full"
                  >
                    Voltar
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderApplication;
