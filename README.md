# 🧾 web PDF
### Convert any public webpage into a downloadable, printable, and shareable PDF — instantly and beautifully rendered, with preview support.

- Built with React, Tailwind CSS, and Lucide Icons. Powered by Cloudflare Workers for PDF generation.

## ✨ Features
- ✅ Enter any public URL and generate a high-quality PDF

- 📏 Choose from standard formats (A4, Letter, Tabloid, etc.)

- 🧭 Portrait or landscape orientation

- ⏳ Wait time setting to allow page elements to load before capture

- 🖼️ Optionally include backgrounds and headers/footers

- 🔍 Inline PDF preview

- 💾 Download the PDF

- 🖨️ Print directly from browser


<img width="1512" height="867" alt="Screenshot 2025-09-25 at 19 04 24" src="https://github.com/user-attachments/assets/5d87d50d-afe0-4ec5-ac7d-e43874a64d55" />

```
 curl -X POST "https://snapshot.jessejesse.workers.dev" \
  -H "Content-Type: application/json" \
  --data '{"url":"https://example.com"}' \
  --output example.pdf
```
This App uses a cloudflared worker api to render a headless browser 

## Worker.js

```
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const CF_API_URL =
  'https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/browser-rendering/pdf?cacheTTL=5'

const CF_API_TOKEN = 'YOUR_API_KEY'

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() })
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed, use POST', {
      status: 405,
      headers: corsHeaders()
    })
  }

  let reqJson
  try {
    reqJson = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders() })
  }

  const pdfOptions = {
    ...reqJson.pdfOptions,
    format: reqJson.pdfOptions?.format
      ? reqJson.pdfOptions.format.toLowerCase()
      : undefined
  }

  if (pdfOptions.format === 'tabloid' && pdfOptions.landscape) {
    pdfOptions.format = 'ledger'
  }

  // Build combined HTML
  let html = ''
  if (reqJson.url) {
    html += `<iframe src="${reqJson.url}" style="width:100%;height:100vh;border:none;"></iframe>`
  }

  if (reqJson.images?.length > 0) {
    html += reqJson.images
      .map(src => `<img src="${src}" style="max-width:100%;page-break-after:always;margin-bottom:20px;">`)
      .join('')
  }

  if (!html) {
    return new Response('Missing "url" and no images provided', {
      status: 400,
      headers: corsHeaders()
    })
  }

  const apiResponse = await fetch(CF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      html,
      waitForTimeout: reqJson.waitForTimeout || 0,
      pdfOptions
    })
  })

  if (!apiResponse.ok) {
    const error = await apiResponse.text()
    return new Response(`Cloudflare API error: ${apiResponse.status} - ${error}`, {
      status: 502,
      headers: corsHeaders()
    })
  }

  const pdfArrayBuffer = await apiResponse.arrayBuffer()
  return new Response(pdfArrayBuffer, {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="output.pdf"',
      'Cache-Control': 'no-cache'
    }
  })
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }
}
```
