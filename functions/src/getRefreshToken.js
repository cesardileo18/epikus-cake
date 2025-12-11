const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Lee el archivo credentials.json
const credentialsPath = path.join(__dirname, '..', 'credentials.json');
const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
const credentials = JSON.parse(credentialsContent).web;

const oAuth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[2]
);

const SCOPES = ['https://mail.google.com/'];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent'
});

console.log('Autoriza esta app visitando esta URL:\n', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Ingresa el código de la URL: ', (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('Error obteniendo token:', err.message);
      return;
    }
    // console.log('\n✅ Token obtenido exitosamente!');
    // console.log('\n📋 Tu refresh_token es:\n', token.refresh_token);
    // console.log('\n📋 Token completo:\n', JSON.stringify(token, null, 2));
  });
});