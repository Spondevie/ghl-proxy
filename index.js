const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const GHL_BASE = 'https://services.leadconnectorhq.com';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-proxy-secret', 'x-ghl-token', 'x-ghl-version', 'Authorization']
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GHL Proxy is running', version: '2.0' });
});

app.all('/ghl/*', async (req, res) => {
  const ghlPath = req.path.replace('/ghl', '');
  const ghlToken = req.headers['x-ghl-token'];
  const ghlVersion = req.headers['x-ghl-version'] || '2021-07-28';

  if (!ghlToken) {
    return res.status(400).json({ error: 'Missing x-ghl-token header' });
  }

  const url = new URL(GHL_BASE + ghlPath);
  if (req.query) {
    Object.entries(req.query).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${ghlToken}`,
        'Version': ghlVersion,
        'Content-Type': 'application/json',
      },
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url.toString(), fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, HOST, () => {
 console.log(`GHL Proxy v2.1 running on ${HOST}:${PORT}`);
});
