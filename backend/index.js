// index.js - VERSÃO FUNCIONAL
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// ✅ Rotas básicas de teste
app.get('/test', (req, res) => {
  console.log('✅ Rota /test chamada');
  res.json({ 
    message: 'Servidor funcionando!', 
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor saudável' });
});

// ✅ Rotas de callback do PayPal
app.get('/payment-success', (req, res) => {
  console.log('✅ Pagamento aprovado via callback');
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: green;">✅ Pagamento Aprovado!</h1>
        <p>Volte para o app para continuar.</p>
      </body>
    </html>
  `);
});

app.get('/payment-cancel', (req, res) => {
  console.log('❌ Pagamento cancelado via callback');
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: red;">❌ Pagamento Cancelado</h1>
        <p>Volte para o app para tentar novamente.</p>
      </body>
    </html>
  `);
});

// ✅ Rota do PayPal (DIRETA - sem arquivo externo)
app.post('/api/create-paypal-order', async (req, res) => {
  try {
    console.log('🛒 Recebendo requisição de pagamento:', req.body);
    
    const { experienceId, amount, quantity, experienceTitle } = req.body;
    
    if (!experienceId || amount === undefined || !quantity) {
      return res.status(400).json({ 
        error: 'Dados incompletos',
        message: 'experienceId, amount e quantity são obrigatórios' 
      });
    }

    // ✅ Resposta SIMULADA para teste
    const orderData = {
      id: 'TEST_ORDER_' + Date.now(),
      status: 'CREATED',
      purchase_units: [{
        amount: {
          currency_code: 'BRL',
          value: amount.toFixed(2)
        }
      }],
      links: [{
        href: 'https://www.sandbox.paypal.com/checkoutnow?token=TEST',
        rel: 'approve',
        method: 'GET'
      }]
    };

    console.log('✅ Ordem criada com sucesso:', orderData.id);
    res.json(orderData);

  } catch (error) {
    console.error('💥 Erro ao criar ordem:', error);
    res.status(500).json({ 
      error: 'Erro interno',
      message: error.message 
    });
  }
});

// ✅ Rota de teste da API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando!',
    features: ['PayPal integrado', 'Pagamentos em BRL'],
    timestamp: new Date().toISOString()
  });
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Servidor rodando na porta', PORT);
  console.log('📋 Rotas disponíveis:');
  console.log('   - GET  /test');
  console.log('   - GET  /health');
  console.log('   - GET  /payment-success');
  console.log('   - GET  /payment-cancel');
  console.log('   - GET  /api/test');
  console.log('   - POST /api/create-paypal-order');
});
