import { useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";

const PaypalRegistration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email_paypal: '',
    nome_titular: '',
    cpf_titular: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('dados_bancarios')
        .upsert({
          user_id: user.id,
          email_paypal: formData.email_paypal,
          nome_titular: formData.nome_titular,
          cpf_titular: formData.cpf_titular
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Dados bancários cadastrados com sucesso.",
      });

      navigate('/manage-experiences');
    } catch (error) {
      console.error('Erro ao salvar dados bancários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados bancários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="p-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-fit p-0 mb-4 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2" size={16} />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl md:text-2xl">Cadastro de Dados Bancários</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email_paypal" className="text-sm md:text-base">
                Email do PayPal *
              </Label>
              <Input
                id="email_paypal"
                type="email"
                value={formData.email_paypal}
                onChange={(e) => setFormData({...formData, email_paypal: e.target.value})}
                placeholder="seu.email@paypal.com"
                required
                className="h-10 md:h-12 text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome_titular" className="text-sm md:text-base">
                Nome do Titular *
              </Label>
              <Input
                id="nome_titular"
                value={formData.nome_titular}
                onChange={(e) => setFormData({...formData, nome_titular: e.target.value})}
                placeholder="Nome completo como cadastrado no PayPal"
                required
                className="h-10 md:h-12 text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_titular" className="text-sm md:text-base">
                CPF do Titular *
              </Label>
              <Input
                id="cpf_titular"
                value={formData.cpf_titular}
                onChange={(e) => setFormData({...formData, cpf_titular: e.target.value})}
                placeholder="000.000.000-00"
                required
                className="h-10 md:h-12 text-sm md:text-base"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 md:h-14 bg-emerald-600 hover:bg-emerald-700 text-sm md:text-base font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  Salvar Dados Bancários
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaypalRegistration;
