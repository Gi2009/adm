import { useState, useEffect } from 'react';
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
import { Plus, Edit, Trash2, MapPin, DollarSign, CalendarIcon, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale"; // Adicionar este import
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

const ManageExperiences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Corrigir o tipo do formData - remover datas_disponiveis daqui
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

  // Corrigir a função handleDateSelect
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateString = date.toISOString().split('T')[0];
    const isSelected = selectedDates.some(d => d.toISOString().split('T')[0] === dateString);
    
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.toISOString().split('T')[0] !== dateString));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [user]);

  const fetchExperiences = async () => {
    if (!user) return;
    
    try {
      const { data: analiseData, error: analiseError } = await supabase
        .from('experiencias_analise')
        .select('*')
        .eq('id_dono', user.id);

      if (analiseError) throw analiseError;

      const { data: disponivelData, error: disponivelError } = await supabase
        .from('experiencias_dis')
        .select('*')
        .eq('id_dono', user.id);

      if (disponivelError) throw disponivelError;

      const experienciasAnalise = (analiseData || []).map(exp => ({
        ...exp,
        status: 'analise' as const
      }));

      const experienciasDisponiveis = (disponivelData || []).map(exp => ({
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
  };

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
        const { error: insertError } = await supabase
          .from('experiencias_analise')
          .insert([experienceData]);

        if (insertError) throw insertError;

        const currentTable = editingExperience.status === 'disponivel' ? 'experiencias_dis' : 'experiencias_analise';
        
        const { error: deleteError } = await supabase
          .from(currentTable)
          .delete()
          .eq('id', editingExperience.id);

        if (deleteError) throw deleteError;
        
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando suas experiências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 pb-20">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Gerenciar Experiências</h1>
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
      </header>

      <main className="container mx-auto px-4 py-8">
        {experiences.length === 0 ? (
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
              <Card key={experience.id} className="overflow-hidden">
                {experience.img && (
                  <div className="aspect-video bg-muted">
                    <img
                      src={experience.img}
                      alt={experience.titulo || 'Experiência'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{experience.titulo}</CardTitle>
                    <Badge 
                      variant={experience.status === 'disponivel' ? 'default' : 'secondary'}
                      className={experience.status === 'disponivel' ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white'}
                    >
                      {experience.status === 'disponivel' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Disponível
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Em Análise
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={14} />
                    {experience.local}
                  </div>
                  {experience.preco && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                      <DollarSign size={14} />
                      R$ {experience.preco.toFixed(2)}
                    </div>
                  )}
                  {experience.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {experience.descricao}
                    </p>
                  )}
                  {experience.datas_disponiveis && experience.datas_disponiveis.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {experience.datas_disponiveis.length} data(s) disponível(is)
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(experience)}
                      className="flex-1"
                    >
                      <Edit size={14} className="mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(experience.id)}
                      className="flex-1"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageExperiences;