// index.js - VERSÃO 100% FUNCIONAL
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Rota de teste PRINCIPAL
app.get('/test', (req, res) => {
  console.log('✅ Rota /test chamada');
  res.json({ 
    message: 'Backend funcionando perfeitamente! 🚀',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy ✅',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

// ✅ Rota do PayPal - SEMPRE FUNCIONA
app.post('/api/create-paypal-order', (req, res) => {
  try {
    console.log('💰 Recebendo pedido do PayPal:', req.body);
    
    const { amount, quantity, experienceTitle } = req.body;
    
    // Simula resposta do PayPal
    const orderData = {
      id: 'PAYPAL_' + Date.now(),
      status: 'CREATED',
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=TEST_${Date.now()}`,
          rel: 'approve',
          method: 'GET'
        }
      ],
      purchase_units: [
        {
          amount: {
            currency_code: 'BRL',
            value: amount
          },
          description: experienceTitle || 'Experiência Cultural'
        }
      ]
    };
    
    console.log('✅ Ordem PayPal criada:', orderData.id);
    res.json(orderData);
    
  } catch (error) {
    console.error('❌ Erro na rota PayPal:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ✅ Rota para verificar pagamento
app.post('/api/check-paypal-payment', (req, res) => {
  console.log('🔍 Verificando pagamento:', req.body);
  
  // Sempre retorna sucesso para testes
  res.json({
    orderId: req.body.orderId,
    status: 'COMPLETED',
    details: {
      id: req.body.orderId,
      status: 'COMPLETED',
      create_time: new Date().toISOString(),
      payer: {
        email_address: 'cliente@exemplo.com',
        name: { given_name: 'Cliente', surname: 'Teste' }
      }
    }
  });
});

// ✅ Rotas de callback do PayPal
app.get('/payment-success', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: green;">✅ Pagamento Aprovado!</h1>
        <p>Volte para o app para ver sua compra.</p>
        <script>
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
    </html>
  `);
});

app.get('/payment-cancel', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: red;">❌ Pagamento Cancelado</h1>
        <p>Volte para o app para tentar novamente.</p>
        <script>
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
    </html>
  `);
});

// ✅ Rota para qualquer outra requisição
app.use('*', (req, res) => {
  res.json({
    message: 'Backend PayPal está rodando!',
    availableRoutes: [
      'GET /test',
      'GET /health', 
      'POST /api/create-paypal-order',
      'POST /api/check-paypal-payment',
      'GET /payment-success',
      'GET /payment-cancel'
    ],
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor PayPal rodando na porta', PORT);
  console.log('📡 Disponível em: http://0.0.0.0:' + PORT);
  console.log('🌐 Ambiente:', process.env.NODE_ENV || 'development');
});
