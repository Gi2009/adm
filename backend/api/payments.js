// api/payments.js
/*const express = require('express');
const router = express.Router();

// ✅ Rota SIMULADA - Sem tentar conectar com PayPal real
router.post('/create-paypal-order', async (req, res) => {
  try {
    console.log('✅ Recebendo requisição de pagamento');
    const { experienceId, amount } = req.body;

    if (!experienceId || amount === undefined) {
      return res.status(400).json({
        error: 'Dados incompletos',
        message: 'experienceId e amount são obrigatórios'
      });
    }

    // ✅ SEMPRE retorne resposta simulada para desenvolvimento
    console.log('🎯 Modo Desenvolvimento: Retornando ordem simulada');
    
    // Simula resposta do PayPal com estrutura correta
    const orderId = 'SB_ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    res.json({
      id: orderId,
      status: 'CREATED',
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
          rel: 'approve',
          method: 'GET'
        }
      ]
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({
      error: 'Erro ao processar pagamento',
      message: 'Tente novamente'
    });
  }
});

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Backend funcionando!', timestamp: new Date().toISOString() });
});

module.exports = router;*/
/*
const fetch = require('node-fetch');

const PAYPAL_CLIENT_ID = 'SEU_CLIENT_ID_SANDBOX';
const PAYPAL_SECRET = 'SEU_SECRET_SANDBOX';

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  return data.access_token;
}

router.post('/create-paypal-order', async (req, res) => {
  try {
    const { experienceId, amount } = req.body;
    if (!experienceId || amount === undefined) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const accessToken = await getAccessToken();

    const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'BRL',
            value: amount.toFixed(2)
          }
        }]
      })
    });

    if (!orderResponse.ok) {
      const errorBody = await orderResponse.text();
      console.error('Erro ao criar ordem PayPal:', errorBody);
      return res.status(500).json({ error: 'Erro ao criar ordem PayPal' });
    }

    const orderData = await orderResponse.json();
    res.json(orderData);

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});
*/
// api/payments.js
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'Ab8AUo6wjB0HVwXsS3llXpgW-ftWEtjEohTPtCKqcLHxdvaCMewGE3MNwPJLXV0u1P72l7BEDs9cEEFf';
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EDJbgnEfRKaJyLcsKy4lipvLDgisqReS8UAcEfFwMciIj_NidkwP9kXVIVaF9lq0A-dkBAqqIOT1qqbW';

async function getAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PayPal auth failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

/*router.post('/create-paypal-order', async (req, res) => {
  try {
    console.log('Received PayPal order request:', req.body);
    
    const { experienceId, amount } = req.body;
    if (!experienceId || amount === undefined) {
      return res.status(400).json({ 
        error: 'Dados incompletos',
        message: 'experienceId e amount são obrigatórios' 
      });
    }

    const accessToken = await getAccessToken();
    console.log('Got access token');

    const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'BRL',
            value: amount.toFixed(2)
          }
        }]
      })
    });

    const responseText = await orderResponse.text();
    console.log('PayPal response:', orderResponse.status, responseText);

    if (!orderResponse.ok) {
      return res.status(orderResponse.status).json({ 
        error: 'Erro ao criar ordem PayPal',
        details: responseText 
      });
    }

    const orderData = JSON.parse(responseText);
    res.json(orderData);

  } catch (error) {
    console.error('Error in create-paypal-order:', error);
    res.status(500).json({ 
      error: 'Erro interno',
      message: error.message 
    });
  }
});*/


// api/payments.js
router.post('/create-paypal-order', async (req, res) => {
  try {
    console.log('Received PayPal order request:', req.body);
    
    const { experienceId, amount, quantity } = req.body;
    if (!experienceId || amount === undefined) {
      return res.status(400).json({ 
        error: 'Dados incompletos',
        message: 'experienceId e amount são obrigatórios' 
      });
    }

    const accessToken = await getAccessToken();
    console.log('Got access token');

    const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'BRL',
            value: amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'BRL',
                value: amount.toFixed(2)
              }
            }
          },
          items: [
            {
              name: `Ingresso para Experiência ${experienceId}`,
              quantity: quantity.toString(),
              unit_amount: {
                currency_code: 'BRL',
                value: (amount / quantity).toFixed(2)
              }
            }
          ]
        }]
      })
    });

    const responseText = await orderResponse.text();
    console.log('PayPal response:', orderResponse.status, responseText);

    if (!orderResponse.ok) {
      return res.status(orderResponse.status).json({ 
        error: 'Erro ao criar ordem PayPal',
        details: responseText 
      });
    }

    const orderData = JSON.parse(responseText);
    res.json(orderData);

  } catch (error) {
    console.error('Error in create-paypal-order:', error);
    res.status(500).json({ 
      error: 'Erro interno',
      message: error.message 
    });
  }
});

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend funcionando!', 
    timestamp: new Date().toISOString(),
    paypalClientId: PAYPAL_CLIENT_ID ? '✅ Definido' : '❌ Não definido'
  });
});

module.exports = router;