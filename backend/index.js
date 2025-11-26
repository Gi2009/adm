// index.js - VERSÃO CORRIGIDA
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ✅ Middleware de debug para ver todas as requisições
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ✅ Rota de teste PRINCIPAL (deve funcionar)
app.get('/test', (req, res) => {
  console.log('✅ Rota /test atingida com sucesso!');
  res.json({ 
    message: 'Servidor funcionando!', 
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// ✅ Rota de health check para Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor está rodando',
    timestamp: new Date().toISOString()
  });
});

// ✅ Tente importar as rotas da API
try {
  const paymentsRouter = require('./api/payments');
  app.use('/api', paymentsRouter);
  console.log('✅ Rotas da API carregadas com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar rotas da API:', error.message);
  
  // Rota fallback para debug
  app.all('/api/*', (req, res) => {
    console.log('❌ Tentativa de acessar rota API não carregada:', req.originalUrl);
    res.status(500).json({ 
      error: 'API não carregada', 
      message: error.message,
      path: req.originalUrl
    });
  });
}

// ✅ CORREÇÃO: Middleware para rotas não encontradas (SEM o ; que causava erro)
app.use('*', (req, res) => {
  console.log('❌ Rota não encontrada:', req.originalUrl);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    availableRoutes: [
      'GET /test', 
      'GET /health',
      'POST /api/create-paypal-order', 
      'GET /api/test'
    ]
  });
});

// ✅ CORREÇÃO: Rotas para callback do PayPal
app.get('/payment-success', (req, res) => {
  console.log('✅ Pagamento sucesso via callback');
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: green;">✅ Pagamento Aprovado!</h1>
        <p>Volte para o app para continuar.</p>
        <script>
          setTimeout(() => {
            // Tenta fechar a janela ou redirecionar
            if (window.opener) {
              window.close();
            } else {
              window.location.href = 'https://paypal-scvf.onrender.com';
            }
          }, 3000);
        </script>
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
        <script>
          setTimeout(() => {
            if (window.opener) {
              window.close();
            } else {
              window.location.href = 'https://paypal-scvf.onrender.com';
            }
          }, 3000);
        </script>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('✅ Servidor rodando na porta', PORT);
  console.log('📋 Rotas disponíveis:');
  console.log('   - GET  /test');
  console.log('   - GET  /health');
  console.log('   - GET  /payment-success');
  console.log('   - GET  /payment-cancel');
  console.log('   - GET  /api/test');
  console.log('   - POST /api/create-paypal-order');
  console.log('📝 PayPal Client ID:', process.env.PAYPAL_CLIENT_ID ? '✅ Definido' : '❌ Não definido');
  console.log('🌐 Ambiente:', process.env.NODE_ENV || 'development');
});
