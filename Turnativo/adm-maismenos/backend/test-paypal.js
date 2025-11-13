// test-paypal.js
require('dotenv').config();
const { createClient, paypal } = require('./paypal');

async function testPaypal() {
  try {
    const client = createClient();
    console.log('✅ Cliente PayPal criado');
    
    // Teste simples de autenticação
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'BRL',
          value: '100.00'
        }
      }]
    });

    const response = await client.execute(request);
    console.log('✅ Conexão com PayPal bem-sucedida');
    
  } catch (error) {
    console.error('❌ Erro de autenticação:');
    console.error('Mensagem:', error.message);
    console.error('Status:', error.statusCode);
    
    // Verifique se as variáveis de ambiente estão carregadas
    console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? '✅ Definido' : '❌ Não definido');
    console.log('PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? '✅ Definido' : '❌ Não definido');
  }
}

testPaypal();