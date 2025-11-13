// index.js
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

// ✅ Tente importar as rotas da API
try {
  const paymentsRouter = require('./api/payments');
  app.use('/api', paymentsRouter);
  console.log('✅ Rotas da API carregadas com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar rotas da API:', error.message);
  
  // Rota fallback para debug
  app.all('/api/*', (req, res) => {
    res.status(500).json({ 
      error: 'API não carregada', 
      message: error.message 
    });
  });
}

// ✅ CORREÇÃO: Use um middleware padrão para rotas não encontradas
app.use((req, res, next) => {
  console.log('❌ Rota não encontrada:', req.originalUrl);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    availableRoutes: ['GET /test', 'POST /api/create-paypal-order', 'GET /api/test']
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ Servidor rodando na porta 3000');
  console.log('📋 Rotas disponíveis:');
  console.log('   - GET  /test');
  console.log('   - GET  /api/test');
  console.log('   - POST /api/create-paypal-order');
  console.log('📝 PayPal Client ID:', process.env.PAYPAL_CLIENT_ID ? '✅ Definido' : '❌ Não definido');
});