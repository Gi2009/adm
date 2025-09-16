import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CandidateEmailRequest {
  email: string;
  nome: string;
  type: 'approved' | 'rejected';
  token?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nome, type, token }: CandidateEmailRequest = await req.json();

    console.log(`Sending ${type} email to ${email} for candidate ${nome}`);

    let subject: string;
    let html: string;

    if (type === 'approved') {
      const registrationUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/v1', '')}/candidate-registration?token=${token}`;
      
      subject = "🎉 Parabéns! Sua candidatura foi aprovada!";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a; text-align: center;">Candidatura Aprovada!</h1>
          
          <p>Olá <strong>${nome}</strong>,</p>
          
          <p>Temos o prazer de informar que sua candidatura para oferecer experiências foi <strong>aprovada</strong>!</p>
          
          <p>Você agora será registrado como <strong>fornecedor de experiências</strong> (perfil tipo 2) em nossa plataforma.</p>
          
          <p>Para concluir o processo, você precisa criar sua conta na plataforma. Clique no link abaixo para preencher o formulário de registro:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationUrl}" 
               style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Criar Minha Conta
            </a>
          </div>
          
          <p><strong>Instruções:</strong></p>
          <ul>
            <li>Use o mesmo email desta mensagem para se registrar</li>
            <li>Crie uma senha segura</li>
            <li>Após o registro, você poderá começar a oferecer experiências</li>
          </ul>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Este link é válido por 30 dias. Se você não conseguir acessar, entre em contato conosco.
          </p>
          
          <p>Bem-vindo à nossa plataforma!</p>
        </div>
      `;
    } else {
      subject = "Sobre sua candidatura para oferecer experiências";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc2626; text-align: center;">Candidatura não aprovada</h1>
          
          <p>Olá <strong>${nome}</strong>,</p>
          
          <p>Agradecemos seu interesse em oferecer experiências em nossa plataforma.</p>
          
          <p>Infelizmente, sua candidatura não foi aprovada neste momento. Isso pode acontecer por diversos motivos, incluindo:</p>
          
          <ul>
            <li>Necessidade de mais informações sobre a experiência proposta</li>
            <li>Critérios específicos que precisam ser atendidos</li>
            <li>Limite temporário de novos fornecedores</li>
          </ul>
          
          <p>Encorajamos você a se candidatar novamente no futuro, pois os critérios podem mudar.</p>
          
          <p>Agradecemos sua compreensão.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Se você tiver dúvidas sobre este processo, entre em contato conosco.
          </p>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Plataforma de Experiências <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in candidate-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);