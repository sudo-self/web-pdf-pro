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
