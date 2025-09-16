import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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
  duração: string;
  tipo: number;
  data_experiencia?: string;
}

interface ExperienceDetailsProps {
  experience: Experience | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ✅ MOVER A FUNÇÃO formatDate PARA CIMA, ANTES DO COMPONENTE
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const ExperienceDetails = ({ experience, open, onOpenChange }: ExperienceDetailsProps) => {
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentSuccess = useCallback((details: any) => {
    console.log('Pagamento bem-sucedido:', details);
    setPaymentSuccess(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setPaymentSuccess(false);
      return;
    }

    const loadPaypal = () => {
      if (window.paypal) {
        setPaypalLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=BRL';
      script.async = true;
      script.onload = () => setPaypalLoaded(true);
      document.body.appendChild(script);
    };

    loadPaypal();
  }, [open]);

  useEffect(() => {
    if (paypalLoaded && experience && open) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
      }

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal'
        },
       createOrder: async function(data: any, actions: any) {
  try {
    if (!experience) throw new Error("Experiência não definida");

    console.log('Criando ordem para:', experience.id);
    
    const response = await fetch('http://localhost:3000/api/create-paypal-order', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        experienceId: experience.id,
        amount: experience.preco
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
      }).render('#paypal-button-container');
    }
  }, [paypalLoaded, experience, open, handlePaymentSuccess]);

  if (!experience) return null;

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
              <span className="text-sm text-muted-foreground">Preço:</span>
              <span className="font-bold text-primary">R$ {experience.preco.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Pessoas:</span>
              <span className="font-medium">{experience.quantas_p}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Duração:</span>
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
                <p className="text-green-600 mt-2">Sua experiência foi reservada. Você receberá um e-mail com os detalhes.</p>
              </div>
            ) : (
              <>
                <h4 className="font-semibold mb-4 text-foreground">Reservar esta experiência</h4>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">Valor total: <span className="font-bold text-primary">R$ {experience.preco.toFixed(2)}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Pagamento seguro via PayPal</p>
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