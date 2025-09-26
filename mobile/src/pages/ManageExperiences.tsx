
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
import { Plus, Edit, Trash2, MapPin, DollarSign, CalendarIcon, Clock, CheckCircle, UserCheck, UserX, CreditCard, Landmark as Bank, Users, ShoppingCart } from "lucide-react";
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

interface Compra {
  id: number;
  user_id: string;
  experiencia_id: number;
  data_compra: string;
  status: string;
  valor: number;
  quantidade_ingressos: number;
  data_experiencia: string;
  user_email?: string;
  user_nome?: string;
  experiencia_titulo?: string; // ✅ NOVO CAMPO
}

const ManageExperiences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompras, setLoadingCompras] = useState(false);
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

  // ✅ useEffect para debug (adicione temporariamente)
useEffect(() => {
  console.log('Compras carregadas:', compras);
  console.log('Experiências do usuário:', experiences.map(exp => ({ id: exp.id, titulo: exp.titulo })));
}, [compras, experiences]);

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






const fetchCompras = useCallback(async () => {
  if (!user) return;
  
  setLoadingCompras(true);
  try {
    console.log('🔄 Buscando compras para usuário:', user.id);

    // Buscar experiências do usuário com uma query mais robusta
    const { data: experienciasData, error: expError } = await supabase
      .from('experiencias_dis')
      .select('id, titulo')
      .eq('id_dono', user.id);

    if (expError) {
      console.error('Erro ao buscar experiências:', expError);
    }

    const experienciasAnaliseData = await supabase
      .from('experiencias_analise')
      .select('id, titulo')
      .eq('id_dono', user.id);

    if (experienciasAnaliseData.error) {
      console.error('Erro ao buscar experiências em análise:', experienciasAnaliseData.error);
    }

    const todasExperiencias = [
      ...(experienciasData || []),
      ...(experienciasAnaliseData.data || [])
    ];

    console.log('📊 Total de experiências encontradas:', todasExperiencias.length);
    console.log('🔍 IDs das experiências:', todasExperiencias.map(exp => exp.id));

    if (todasExperiencias.length === 0) {
      console.log('ℹ️ Usuário não tem experiências cadastradas');
      setCompras([]);
      return;
    }

    const experienciaIds = todasExperiencias.map(exp => exp.id);
    
    // Buscar compras com fallback caso a RLS bloqueie
    let comprasData: any[] = [];
    
    try {
      // Tentativa 1: Buscar normalmente
      const { data, error } = await supabase
        .from('compras_experiencias')
        .select('*')
        .in('experiencia_id', experienciaIds)
        .order('data_compra', { ascending: false });

      if (error) throw error;
      comprasData = data || [];
    } catch (error) {
      console.error('❌ Erro na busca principal de compras:', error);
      
      // Tentativa 2: Buscar uma por uma (fallback)
      console.log('🔄 Tentando busca individual de compras...');
      const comprasIndividuais = [];
      
      for (const expId of experienciaIds) {
        try {
          const { data: compraExp, error: errorExp } = await supabase
            .from('compras_experiencias')
            .select('*')
            .eq('experiencia_id', expId)
            .order('data_compra', { ascending: false });

          if (!errorExp && compraExp) {
            comprasIndividuais.push(...compraExp);
          }
        } catch (e) {
          console.error(`Erro ao buscar compras para experiência ${expId}:`, e);
        }
      }
      
      comprasData = comprasIndividuais;
    }

    console.log('✅ Compras encontradas:', comprasData);

    if (comprasData.length === 0) {
      console.log('ℹ️ Nenhuma compra encontrada para estas experiências');
      setCompras([]);
      return;
    }

    // Enriquecer com informações do usuário e experiência
    const comprasEnriquecidas = await Promise.all(
      comprasData.map(async (compra) => {
        try {
          // Buscar informações do usuário que comprou
          const { data: profileData } = await supabase
            .from('profiles')
            .select('nome, email')
            .eq('user_id', compra.user_id)
            .single();

          // Buscar título da experiência
          const experiencia = todasExperiencias.find(exp => exp.id === compra.experiencia_id);

          return {
            ...compra,
            user_nome: profileData?.nome || 'Usuário',
            user_email: profileData?.email || 'Email não disponível',
            experiencia_titulo: experiencia?.titulo || `Experiência #${compra.experiencia_id}`
          };
        } catch (error) {
          console.error('Erro ao enriquecer compra:', error);
          const experiencia = todasExperiencias.find(exp => exp.id === compra.experiencia_id);
          
          return {
            ...compra,
            user_nome: 'Usuário',
            user_email: 'Email não disponível',
            experiencia_titulo: experiencia?.titulo || `Experiência #${compra.experiencia_id}`
          };
        }
      })
    );

    console.log('🎉 Compras enriquecidas:', comprasEnriquecidas);
    setCompras(comprasEnriquecidas);

  } catch (error) {
    console.error('💥 Erro geral ao buscar compras:', error);
    setCompras([]);
  } finally {
    setLoadingCompras(false);
  }
}, [user]);

// ✅ Adicione esta função para verificar a tabela
const verificarTabelaCompras = async () => {
  try {
    const { data, error } = await supabase
      .from('compras_experiencias')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Erro ao verificar tabela compras:', error);
      return;
    }

    console.log('Todas as compras na tabela:', data);
  } catch (error) {
    console.error('Erro ao verificar tabela:', error);
  }
};

// ✅ Chame esta função uma vez para debug (adicione em um useEffect)
useEffect(() => {
  if (userType === '2') {
    verificarTabelaCompras();
  }
}, [userType]);


// ✅ Buscar compras quando o usuário for aprovado (tipo 2)
useEffect(() => {
  if (userType === '2' && user) {
    fetchCompras();
  }
}, [userType, user, fetchCompras]);



  // ✅ OTIMIZADO: Verificação de aprovação com useCallback
  const checkUserApproval = useCallback(async () => {
    if (!user) {
      setIsUserApproved(false);
      setCheckingApproval(false);
      return;
    }

    try {
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

      if (profileData?.type === '2') {
        setIsUserApproved(true);
        checkBankData();
        fetchExperiences();
      } else {
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



  // ✅ Buscar compras quando as experiências forem carregadas
  useEffect(() => {
    if (experiences.length > 0 && userType === '2') {
      fetchCompras();
    }
  }, [experiences, userType, fetchCompras]);

  // ✅ OTIMIZADO: useEffect para carregar dados iniciais
  useEffect(() => {
    if (user) {
      checkUserApproval();
    }
  }, [user, checkUserApproval]);

  // ... (mantenha as funções handleSubmit, handleBankSubmit, handleDelete, handleEdit, resetForm iguais)

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

  // ✅ Componente para mostrar as compras de uma experiência
 // ✅ Componente atualizado para mostrar as compras
const ComprasSection = () => {
  if (loadingCompras) {
    return (
      <div className="text-center py-4">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-muted-foreground text-sm">Carregando compras...</p>
      </div>
    );
  }

  if (compras.length === 0) {
    return (
      <div className="text-center py-6">
        <ShoppingCart className="mx-auto mb-2 text-muted-foreground" size={32} />
        <p className="text-muted-foreground">Nenhuma compra realizada ainda</p>
        <p className="text-sm text-muted-foreground mt-1">
          Quando alguém comprar suas experiências, elas aparecerão aqui.
        </p>
      </div>
    );
  }

  // Agrupar compras por experiência (usando o título que já vem na compra)
  const comprasPorExperiencia = compras.reduce((acc, compra) => {
    const titulo = compra.experiencia_titulo || `Experiência #${compra.experiencia_id}`;
    
    if (!acc[titulo]) {
      acc[titulo] = [];
    }
    acc[titulo].push(compra);
    return acc;
  }, {} as Record<string, Compra[]>);

  return (
    <div className="space-y-6">
      {Object.entries(comprasPorExperiencia).map(([titulo, comprasExp]) => (
        <Card key={titulo}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              {titulo}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {comprasExp.map((compra) => (
                <div key={compra.id} className="flex justify-between items-start p-3 border rounded-lg bg-gray-50/50">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{compra.user_nome}</p>
                    <p className="text-xs text-muted-foreground mb-1">{compra.user_email}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Compra: {format(new Date(compra.data_compra), 'dd/MM/yyyy HH:mm')}
                      </span>
                      {compra.data_experiencia && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Experiência: {format(new Date(compra.data_experiencia), 'dd/MM/yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-green-600">R$ {compra.valor?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-muted-foreground">
                      {compra.quantidade_ingressos || 1} ingresso(s)
                    </p>
                    <Badge 
                      variant={compra.status === 'confirmado' ? 'default' : 'secondary'} 
                      className="text-xs mt-1"
                    >
                      {compra.status || 'confirmado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

  // ... (mantenha o ExperienceCard igual)

  const ExperienceCard = ({ experience }: { experience: Experience }) => (
    <Card key={experience.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        {experience.img ? (
          <img 
            src={experience.img} 
            alt={experience.titulo || 'Experiência'} 
            className="w-full h-full object-cover"
            loading="lazy"
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

  // Conteúdo para usuários tipo 1 (mantido igual)
  if (userType === '1') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 pb-20">
        {/* ... (mantenha o conteúdo para tipo 1 igual) */}
      </div>
    );
  }
  else{

  // Conteúdo para usuários tipo 2 (com seção de compras adicionada)
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
          placeholder="seu.email@paypal.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="nome_titular">Nome do Titular *</Label>
        <Input
          id="nome_titular"
          value={bankData.nome_titular}
          onChange={(e) => setBankData({...bankData, nome_titular: e.target.value})}
          placeholder="Nome completo como cadastrado no PayPal"
          required
        />
      </div>

      <div>
        <Label htmlFor="cpf_titular">CPF do Titular *</Label>
        <Input
          id="cpf_titular"
          value={bankData.cpf_titular}
          onChange={(e) => setBankData({...bankData, cpf_titular: e.target.value})}
          placeholder="000.000.000-00"
          required
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsBankDialogOpen(false)}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          {hasBankData ? 'Atualizar' : 'Salvar'}
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
                
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    />
                  </div>
                 
                  <div>
                    <Label htmlFor="duracao">Duração</Label>
                    <Input
                      id="duracao"
                      value={formData.duracao}
                      onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantas_p">Número de Pessoas</Label>
                    <Input
                      id="quantas_p"
                      type="number"
                      value={formData.quantas_p}
                      onChange={(e) => setFormData({...formData, quantas_p: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Datas Disponíveis *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDates.length > 0 
                          ? `${selectedDates.length} data(s) selecionada(s)` 
                          : 'Selecionar datas'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={undefined}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  {selectedDates.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">Datas selecionadas:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedDates
                          .sort((a, b) => a.getTime() - b.getTime())
                          .map((date, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {format(date, 'dd/MM/yyyy')}
                              <button
                                type="button"
                                onClick={() => setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()))}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <ImageUpload
                  value={formData.img}
                  onChange={(url) => setFormData({...formData, img: url})}
                  onRemove={() => setFormData({...formData, img: ''})}
                />

                <div>
                  <Label htmlFor="incluso">Incluído na experiência</Label>
                  <Textarea
                    id="incluso"
                    value={formData.incluso}
                    onChange={(e) => setFormData({...formData, incluso: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {editingExperience ? 'Atualizar' : 'Criar'} Experiência
                  </Button>
                </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Seção de Dados Bancários (mantida igual) */}
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

        {/* ✅ NOVA SEÇÃO: Compras das Experiências */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Compras Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComprasSection />
          </CardContent>
        </Card>

        {/* Seção de Experiências (mantida igual) */}
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
}

export default ManageExperiences;