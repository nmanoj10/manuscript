const https = require('https');

const apiKey = process.env.GEMINI_API_KEY || process.argv[2];
if (!apiKey) {
  console.error('Provide GEMINI_API_KEY via environment or as first argument');
  process.exit(1);
}

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: '/v1beta2/models',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.end();
