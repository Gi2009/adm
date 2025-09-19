import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, Clock, DollarSign, Plus, Minus, CheckCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useUser  } from '@supabase/auth-helpers-react';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    paypal: any;
  }
}

interface Experience {
  id: number;
  titulo: string;
  img: string;
  local: string;
  preco: number;
  descricao: string;
  incluso: string;
  quantas_p: number;
  duracao: string;
  tipo: number;
  data_experiencia?: string;
}

interface ExperienceDetailsProps {
  experience: Experience | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPurchaseView?: boolean; // Adicione esta prop
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const ExperienceDetails = ({ experience, open, onOpenChange, isPurchaseView = false }: ExperienceDetailsProps) => {
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const { user } = useAuth();

  console.log('Usuário atual:', user);

  const handlePaymentSuccess = useCallback(async (details: any) => {
    console.log('Pagamento bem-sucedido:', details);
    setPaymentSuccess(true);
    
    if (!user) {
      console.warn('Usuário não autenticado');
      return;
    }

    if (user && experience) {
      try {
        const totalAmount = experience.preco * ticketQuantity;
        
        const { error } = await supabase
          .from('compras_experiencias')
          .insert({
            user_id: user.id,
            experiencia_id: experience.id,
            data_compra: new Date().toISOString(),
            status: 'confirmado',
            valor: totalAmount,
            quantidade_ingressos: ticketQuantity,
            detalhes_pagamento: details
          } as Database['public']['Tables']['compras_experiencias']['Insert']);

        if (error) {
          console.error('Erro ao salvar compra:', error);
        } else {
          console.log('Compra salva com sucesso');
        }
      } catch (error) {
        console.error('Erro ao salvar compra:', error);
      }
    }
  }, [user, experience, ticketQuantity]);

  const increaseQuantity = () => {
    if (experience && ticketQuantity < experience.quantas_p) {
      setTicketQuantity(ticketQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity(ticketQuantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && experience && value <= experience.quantas_p) {
      setTicketQuantity(value);
    }
  };

  useEffect(() => {
    if (isPurchaseView) return; // Não carrega PayPal se for visualização de compra
    
    if (!open) {
      setPaymentSuccess(false);
      setTicketQuantity(1);
      return;
    }

    const loadPaypal = () => {
      if (window.paypal) {
        setPaypalLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=Ab8AUo6wjB0HVwXsS3llXpgW-ftWEtjEohTPtCKqcLHxdvaCMewGE3MNwPJLXV0u1P72l7BEDs9cEEFf&currency=BRL';
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    };

    loadPaypal();
  }, [open, isPurchaseView]);

  useEffect(() => {
    if (isPurchaseView) return; // Não renderiza PayPal se for visualização de compra
    
    if (!paypalLoaded || !experience || !open) return;

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    container.innerHTML = '';

    const totalAmount = experience.preco * ticketQuantity;

    const paypalButtons = window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: async function(data: any, actions: any) {
        try {
          if (!experience) throw new Error("Experiência não definida");

          console.log('Criando ordem para:', experience.id, 'Quantidade:', ticketQuantity, 'Total:', totalAmount);
          
          const response = await fetch('http://localhost:3000/api/create-paypal-order', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              experienceId: experience.id,
              amount: totalAmount,
              quantity: ticketQuantity
            }),
          });

          console.log('Resposta do servidor:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro detalhado:', errorText);
            throw new Error(`Erro do servidor: ${response.status}`);
          }

          const orderData = await response.json();
          console.log('Ordem criada com sucesso:', orderData);
          return orderData.id;

        } catch (error) {
          console.error('Erro detalhado ao criar ordem:', error);
          throw new Error('Não foi possível processar o pagamento. Tente novamente.');
        }
      },
      onApprove: function(data: any, actions: any) {
        return actions.order.capture().then(function(details: any) {
          handlePaymentSuccess(details);
        });
      },
      onError: function(err: any) {
        console.error('Erro no pagamento:', err);
        alert('Ocorreu um erro durante o pagamento. Por favor, tente novamente.');
      }
    });

    paypalButtons.render(container);

    return () => {
      paypalButtons.close();
    };
  }, [paypalLoaded, experience, open, handlePaymentSuccess, ticketQuantity, isPurchaseView]);

  if (!experience) return null;

  const totalAmount = experience.preco * ticketQuantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {experience.titulo}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <img 
              src={experience.img} 
              alt={experience.titulo}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Local:</span>
              <span className="font-medium">{experience.local}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Preço unitário:</span>
              <span className="font-bold text-primary">R$ {experience.preco.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Vagas disponíveis:</span>
              <span className="font-medium">{experience.quantas_p}</span>
            </div>

           <div>
            <span className="text-sm text-muted-foreground">Duração:</span>
              <span className="font-medium">{experience.duracao}</span>
          </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Data:</span>
              <span className="font-medium">{formatDate(experience.data_experiencia || '')}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-foreground">Descrição</h4>
            <p className="text-muted-foreground leading-relaxed">{experience.descricao}</p>
          </div>

          {experience.incluso && (
            <div>
              <h4 className="font-semibold mb-2 text-foreground">O que está incluso</h4>
              <div className="text-muted-foreground">
                {experience.incluso.split('\n').map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            {paymentSuccess ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h4 className="font-semibold">Pagamento realizado com sucesso!</h4>
                </div>
                <p className="text-green-600 mt-2">
                  {ticketQuantity} {ticketQuantity === 1 ? 'ingresso' : 'ingressos'} comprado(s) com sucesso. 
                  Você receberá um e-mail com os detalhes.
                </p>
              </div>
            ) : isPurchaseView ? (
              // Visualização de compra - sem opção de comprar
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700">
                  <CheckCircle className="h-6 w-6" />
                  <h4 className="font-semibold">Experiência Comprada</h4>
                </div>
                <p className="text-blue-600 mt-2">
                  Você já adquiriu esta experiência. Aproveite sua aventura!
                </p>
              </div>
            ) : (
              // Visualização normal - com opção de compra
              <>
                <h4 className="font-semibold mb-4 text-foreground">Reservar esta experiência</h4>
                
                {/* Seletor de quantidade */}
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Quantidade de ingressos:</span>
                    <span className="text-xs text-muted-foreground">
                      Máximo: {experience.quantas_p} {experience.quantas_p === 1 ? 'vaga' : 'vagas'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={ticketQuantity <= 1}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <Input
                      type="number"
                      min="1"
                      max={experience.quantas_p}
                      value={ticketQuantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center h-8"
                    />
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={increaseQuantity}
                      disabled={ticketQuantity >= experience.quantas_p}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Preço unitário:</p>
                      <p className="font-medium">R$ {experience.preco.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total:</p>
                      <p className="font-bold text-primary text-lg">R$ {totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-3">Pagamento seguro via PayPal</p>
                </div>
                
                {paypalLoaded ? (
                  <div id="paypal-button-container" className="paypal-buttons"></div>
                ) : (
                  <div className="flex justify-center items-center h-16 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Carregando opções de pagamento...</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExperienceDetails;