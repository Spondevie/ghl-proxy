const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const PROXY_SECRET = process.env.PROXY_SECRET || 'changeme';
const GHL_BASE = 'https://services.leadconnectorhq.com';

app.use(cors());
app.use(express.json());

// Auth middleware
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  const secret = req.headers['x-proxy-secret'];
  if (!secret || secret !== PROXY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GHL Proxy is running' });
});

// Proxy all GHL requests
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

app.listen(PORT, () => {
  console.log(`GHL Proxy running on port ${PORT}`);
});
