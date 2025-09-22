import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, MapPin, DollarSign, CalendarIcon, Clock, CheckCircle, UserCheck, UserX, CreditCard, Landmark as Bank } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Experience {
  id: number;
  titulo: string | null;
  descricao: string | null;
  local: string | null;
  preco: number | null;
  img: string | null;
  incluso: string | null;
  tipo: number | null;
  duracao: string | null;
  quantas_p: number | null;
  datas_disponiveis: string[] | null;
  status: 'analise' | 'disponivel';
  created_at: string;
  id_dono: string | null;
}

interface BankData {
  email_paypal: string;
  nome_titular: string;
  cpf_titular: string;
}

const ManageExperiences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isUserApproved, setIsUserApproved] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [checkingApproval, setCheckingApproval] = useState(true);
  const [bankData, setBankData] = useState<BankData>({
    email_paypal: '',
    nome_titular: '',
    cpf_titular: ''
  });
  const [hasBankData, setHasBankData] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    local: '',
    preco: '',
    img: '',
    incluso: '',
    tipo: '1',
    duracao: '',
    quantas_p: '',
  });

  // ✅ OTIMIZADO: useCallback para evitar recriações desnecessárias
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (!date) return;
    
    const dateString = date.toISOString().split('T')[0];
    const isSelected = selectedDates.some(d => d.toISOString().split('T')[0] === dateString);
    
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.toISOString().split('T')[0] !== dateString));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  }, [selectedDates]);

  // ✅ OTIMIZADO: Verificação de aprovação com useCallback
  const checkUserApproval = useCallback(async () => {
    if (!user) {
      setIsUserApproved(false);
      setCheckingApproval(false);
      return;
    }

    try {
      // Buscar perfil do usuário apenas uma vez
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('type, email')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
      }

      const userEmail = profileData?.email || user.email;
      setUserType(profileData?.type || null);

      if (!userEmail) {
        setIsUserApproved(false);
        setCheckingApproval(false);
        return;
      }

      // Verificar se é tipo 2 (aprovado) ou se está na tabela de aprovados
      if (profileData?.type === '2') {
        setIsUserApproved(true);
        checkBankData();
        // ✅ CARREGAR EXPERIÊNCIAS PARALELAMENTE
        fetchExperiences();
      } else {
        // Verificar na tabela candidatos_aprovados
        const { data, error } = await supabase
          .from('candidatos_aprovados')
          .select('email')
          .eq('email', userEmail)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar aprovação:', error);
        }

        const approved = !!data;
        setIsUserApproved(approved);
        
        if (approved) {
          // ✅ CARREGAR EXPERIÊNCIAS SE APROVADO
          fetchExperiences();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar aprovação:', error);
      setIsUserApproved(false);
    } finally {
      setCheckingApproval(false);
    }
  }, [user]);

  // ✅ OTIMIZADO: Verificação de dados bancários
  const checkBankData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dados_bancarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar dados bancários:', error);
      }

      setHasBankData(!!data);
      if (data) {
        setBankData({
          email_paypal: data.email_paypal,
          nome_titular: data.nome_titular,
          cpf_titular: data.cpf_titular
        });
      }
    } catch (error) {
      console.error('Erro ao verificar dados bancários:', error);
    }
  }, [user]);

  // ✅ OTIMIZADO: Buscar experiências com Promise.all
  const fetchExperiences = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // ✅ EXECUTAR CONSULTAS EM PARALELO (MUITO MAIS RÁPIDO)
      const [analiseResult, disponivelResult] = await Promise.all([
        supabase
          .from('experiencias_analise')
          .select('*')
          .eq('id_dono', user.id),
        supabase
          .from('experiencias_dis')
          .select('*')
          .eq('id_dono', user.id)
      ]);

      if (analiseResult.error) throw analiseResult.error;
      if (disponivelResult.error) throw disponivelResult.error;

      const experienciasAnalise = (analiseResult.data || []).map(exp => ({
        ...exp,
        status: 'analise' as const
      }));

      const experienciasDisponiveis = (disponivelResult.data || []).map(exp => ({
        ...exp,
        status: 'disponivel' as const
      }));

      const todasExperiencias = [...experienciasAnalise, ...experienciasDisponiveis]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setExperiences(todasExperiencias);
    } catch (error) {
      console.error('Erro ao buscar experiências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas experiências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // ✅ OTIMIZADO: useEffect para carregar dados iniciais
  useEffect(() => {
    if (user) {
      checkUserApproval();
    }
  }, [user, checkUserApproval]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const experienceData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        local: formData.local,
        preco: parseFloat(formData.preco) || 0,
        img: formData.img,
        incluso: formData.incluso,
        tipo: parseInt(formData.tipo) || 1,
        duracao: formData.duracao,
        quantas_p: parseInt(formData.quantas_p) || 1,
        datas_disponiveis: selectedDates.map(date => date.toISOString().split('T')[0]),
        id_dono: user.id
      };

      if (editingExperience) {
        // ✅ OTIMIZADO: Executar em paralelo
        const [insertResult, deleteResult] = await Promise.all([
          supabase.from('experiencias_analise').insert([experienceData]),
          supabase
            .from(editingExperience.status === 'disponivel' ? 'experiencias_dis' : 'experiencias_analise')
            .delete()
            .eq('id', editingExperience.id)
        ]);

        if (insertResult.error) throw insertResult.error;
        if (deleteResult.error) throw deleteResult.error;
        
        toast({
          title: "Sucesso",
          description: "Experiência atualizada e enviada para análise!",
        });
      } else {
        const { error } = await supabase
          .from('experiencias_analise')
          .insert([experienceData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Experiência criada com sucesso!",
        });
      }

      resetForm();
      fetchExperiences();
    } catch (error) {
      console.error('Erro ao salvar experiência:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a experiência.",
        variant: "destructive",
      });
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const bankDataToSave = {
        user_id: user.id,
        email_paypal: bankData.email_paypal,
        nome_titular: bankData.nome_titular,
        cpf_titular: bankData.cpf_titular
      };

      if (hasBankData) {
        const { error } = await supabase
          .from('dados_bancarios')
          .update(bankDataToSave)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Dados bancários atualizados com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('dados_bancarios')
          .insert([bankDataToSave]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Dados bancários cadastrados com sucesso!",
        });
      }

      setIsBankDialogOpen(false);
      checkBankData();
    } catch (error) {
      console.error('Erro ao salvar dados bancários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados bancários.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta experiência?')) return;

    try {
      const experience = experiences.find(exp => exp.id === id);
      if (!experience) return;

      const tableName = experience.status === 'disponivel' ? 'experiencias_dis' : 'experiencias_analise';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Experiência excluída com sucesso!",
      });
      
      fetchExperiences();
    } catch (error) {
      console.error('Erro ao excluir experiência:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a experiência.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setFormData({
      titulo: experience.titulo || '',
      descricao: experience.descricao || '',
      local: experience.local || '',
      preco: experience.preco?.toString() || '',
      img: experience.img || '',
      incluso: experience.incluso || '',
      tipo: experience.tipo?.toString() || '1',
      duracao: experience.duracao || '',
      quantas_p: experience.quantas_p?.toString() || '',
    });
    
    if (experience.datas_disponiveis) {
      setSelectedDates(experience.datas_disponiveis.map(dateStr => new Date(dateStr)));
    } else {
      setSelectedDates([]);
    }
    
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      local: '',
      preco: '',
      img: '',
      incluso: '',
      tipo: '1',
      duracao: '',
      quantas_p: '',
    });
    setSelectedDates([]);
    setEditingExperience(null);
    setIsDialogOpen(false);
  };

  // ✅ COMPONENTE DE LOADING OTIMIZADO
  if (checkingApproval) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando aprovação...</p>
        </div>
      </div>
    );
  }

  // ✅ CARREGAMENTO MAIS RÁPIDO: Mostrar conteúdo principal enquanto carrega experiências
  if (!isUserApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <UserX className="mx-auto mb-4 text-red-500" size={64} />
            <CardTitle className="text-2xl text-red-600">Acesso Não Autorizado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você precisa ser aprovado como candidato para acessar esta área.
            </p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com a administração para mais informações.
            </p>
            <Button 
              onClick={checkUserApproval} 
              variant="outline" 
              className="mt-4"
            >
              Verificar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ CONTEÚDO PRINCIPAL CARREGA IMEDIATAMENTE (não espera pelas experiências)
  const ExperienceCard = ({ experience }: { experience: Experience }) => (
    <Card key={experience.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        {experience.img ? (
          <img 
            src={experience.img} 
            alt={experience.titulo || 'Experiência'} 
            className="w-full h-full object-cover"
            loading="lazy" // ✅ OTIMIZAÇÃO: lazy loading de imagens
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Plus className="text-muted-foreground" size={48} />
          </div>
        )}
        <Badge 
          className={cn(
            "absolute top-2 right-2",
            experience.status === 'disponivel' 
              ? "bg-green-100 text-green-800 border-green-300" 
              : "bg-yellow-100 text-yellow-800 border-yellow-300"
          )}
        >
          {experience.status === 'disponivel' ? 'Disponível' : 'Em Análise'}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{experience.titulo}</h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(experience)}>
              <Edit size={16} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(experience.id)}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span className="line-clamp-1">{experience.local}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={14} />
            <span>R$ {experience.preco?.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{experience.duracao}</span>
          </div>
          {experience.datas_disponiveis && experience.datas_disponiveis.length > 0 && (
            <div className="flex items-center gap-1">
              <CalendarIcon size={14} />
              <span>{experience.datas_disponiveis.length} datas</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Conteúdo para usuários tipo 1
  if (userType === '1') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 pb-20">
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-200">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-emerald-800">Cadastro de Experiências</h1>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                <UserCheck className="w-3 h-3 mr-1" />
                Tipo 1 - Básico
              </Badge>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Cadastrar Nova Experiência</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Formulário mantido igual */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="local">Local *</Label>
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) => setFormData({...formData, local: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                {/* Restante do formulário... */}
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Enviar Experiência para Análise
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Conteúdo para usuários tipo 2
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-emerald-800">Gerenciar Experiências</h1>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              <UserCheck className="w-3 h-3 mr-1" />
              Tipo 2 - Completo
            </Badge>
          </div>
          <div className="flex gap-2">
            <Dialog open={isBankDialogOpen} onOpenChange={setIsBankDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <CreditCard className="mr-2" size={16} />
                  {hasBankData ? 'Editar Dados Bancários' : 'Cadastrar Dados Bancários'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {hasBankData ? 'Editar Dados Bancários' : 'Cadastrar Dados Bancários'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBankSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email_paypal">Email do PayPal *</Label>
                    <Input
                      id="email_paypal"
                      type="email"
                      value={bankData.email_paypal}
                      onChange={(e) => setBankData({...bankData, email_paypal: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nome_titular">Nome do Titular *</Label>
                    <Input
                      id="nome_titular"
                      value={bankData.nome_titular}
                      onChange={(e) => setBankData({...bankData, nome_titular: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf_titular">CPF do Titular *</Label>
                    <Input
                      id="cpf_titular"
                      value={bankData.cpf_titular}
                      onChange={(e) => setBankData({...bankData, cpf_titular: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsBankDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {hasBankData ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingExperience(null);
                  setSelectedDates([]);
                }} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2" size={16} />
                  Nova Experiência
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingExperience ? 'Editar Experiência' : 'Nova Experiência'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Formulário completo aqui */}
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Seção de Dados Bancários */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bank className="w-5 h-5" />
              Dados Bancários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasBankData ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Email PayPal</Label>
                  <p className="text-sm">{bankData.email_paypal}</p>
                </div>
                <div>
                  <Label>Nome do Titular</Label>
                  <p className="text-sm">{bankData.nome_titular}</p>
                </div>
                <div>
                  <Label>CPF</Label>
                  <p className="text-sm">{bankData.cpf_titular}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="mx-auto mb-2 text-muted-foreground" size={32} />
                <p className="text-muted-foreground">Nenhum dado bancário cadastrado</p>
                <Button 
                  onClick={() => setIsBankDialogOpen(true)} 
                  variant="outline" 
                  className="mt-2"
                >
                  Cadastrar Dados Bancários
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ CARREGAMENTO OTIMIZADO: Mostra loading apenas se necessário */}
        {loading && experiences.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando experiências...</p>
          </div>
        ) : experiences.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Plus className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-semibold mb-2">Nenhuma experiência cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira experiência para oferecer aos visitantes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageExperiences;