# GHL Proxy for Claude

A lightweight proxy server that allows Claude to interact directly with your GoHighLevel account.

## Setup on Railway.app

1. Go to railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Upload these files or connect your GitHub repo
4. Add these environment variables in Railway settings:
   - PROXY_SECRET = (create a strong password, e.g. "Princess2026$GHL")
   - PORT = 3000

5. Railway will give you a URL like: https://ghl-proxy-production.up.railway.app
6. Share that URL + your PROXY_SECRET with Claude

## How it works

Claude sends requests to YOUR proxy URL instead of GHL directly.
The proxy forwards them to GHL using your API key.
No network restrictions, full hands-on access.

## Security

- PROXY_SECRET protects your proxy from unauthorized access
- Your GHL API key is never stored in the proxy
- All traffic is HTTPS encrypted
