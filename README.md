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

- 📤 Share via Web Share API (when supported)

- 🧠 How It Works

### This app sends your input to a serverless PDF rendering API which uses a headless browser to:

- Load the URL

- Wait for the timeout (e.g. 2000ms)

- Render the page as a PDF using specified options

- Return the PDF as a blob for preview, download, print, or share
