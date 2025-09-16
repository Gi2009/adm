// paypal.js
const paypal = require('@paypal/checkout-server-sdk');

// Configurar ambiente
const createEnvironment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID || 'sb';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

// Criar cliente
const createClient = () => {
  return new paypal.core.PayPalHttpClient(createEnvironment());
};

module.exports = { createClient, paypal }; // ← Exporte também o paypal