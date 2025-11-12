const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const creds = require('./jacket-scanner-25015107dc9a.json');

(async () => {
  try {
    // Create the JWT auth client
    const auth = new JWT({
      email: creds.client_email,
      key: creds.private_key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    // Request an access token
    const tokens = await auth.authorize();

    console.log('✅ Auth successful!');
    console.log('Access Token:', tokens.access_token.substring(0, 40) + '...');
    console.log('Expires in:', tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'unknown');
  } catch (err) {
    console.error('❌ Auth failed:', err.message);
  }
})();