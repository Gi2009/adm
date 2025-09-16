// api/payments.js
const express = require('express');
const router = express.Router();

// ✅ Adicione este middleware de debug
router.use((req, res, next) => {
  console.log(`🔍 API Route: ${req.method} ${req.path}`);
  next();
});

// Rota de TESTE para verificar se o backend está funcionando
router.get('/test', (req, res) => {
  console.log('✅ Rota /api/test atingida');
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
});

// Rota: POST /api/create-paypal-order
router.post('/create-paypal-order', async (req, res) => {
  try {
    console.log('✅ Recebendo requisição no PayPal endpoint');
    console.log('Body:', req.body);

    const { experienceId, amount } = req.body;

    if (!experienceId || amount === undefined) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'experienceId e amount são obrigatórios'
      });
    }

    // ✅ Resposta simulada para teste (remova depois)
    console.log('✅ Criando ordem PayPal para:', { experienceId, amount });
    
    res.json({
      id: 'TEST_ORDER_' + Date.now(),
      status: 'CREATED',
      experienceId: experienceId,
      amount: amount,
      message: 'Ordem criada com sucesso (modo teste)'
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      error: 'Erro ao processar pagamento',
      message: error.message
    });
  }
});

module.exports = router;