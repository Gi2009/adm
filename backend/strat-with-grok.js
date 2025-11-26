// start-with-ngrok.js
const ngrok = require('ngrok');
const { exec } = require('child_process');

async function startServer() {
  try {
    console.log('🚀 Iniciando servidor e ngrok...');
    
    // Inicia o ngrok
    const url = await ngrok.connect({
      addr: 3000,
      region: 'us', // ou 'sa' para América do Sul
      onStatusChange: (status) => console.log('Ngrok status:', status),
      onLogEvent: (data) => console.log('Ngrok log:', data)
    });
    
    console.log('🌐 URL PÚBLICA DO NGROK:');
    console.log('📱 ' + url);
    console.log('🎯 Acessível de QUALQUER dispositivo com internet!');
    console.log('');
    console.log('📋 URLs para testar:');
    console.log(`   - ${url}/test`);
    console.log(`   - ${url}/api/test`);
    console.log('');
    console.log('⚠️  ATUALIZE as URLs no payments.js:');
    console.log(`   return_url: '${url}/payment/success'`);
    console.log(`   cancel_url: '${url}/payment/cancel'`);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar ngrok:', error);
  }
}

startServer();