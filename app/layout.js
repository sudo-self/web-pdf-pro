// app/layout.js

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "pdf.JesseJesse.com",
  description: "Convert websites into downloadable PDFs with preview and sharing.",
  metadataBase: new URL("https://pdf.JesseJesse.com"),
  openGraph: {
    type: "website",
    url: "https://pdf.JesseJesse.com",
    title: "pdf.JesseJesse.com",
    description: "Convert websites into downloadable PDFs with preview and sharing.",
    images: ["/pdf-og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "pdf.JesseJesse.com",
    description: "Convert websites into downloadable PDFs with preview and sharing.",
    images: ["/pdf-og.png"],
  },
  authors: [{ name: "Jesse Roper" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta charSet="utf-8" />
            <meta name="theme-color" content="#4f46e5" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
            <meta property="og:site_name" content="pdf.JesseJesse.com" />
          </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ position: "relative", minHeight: "100vh" }}
      >

        {children}

        {/* Decorative SVG Watermark */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            zIndex: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            opacity: 0.1,
            transform: "translateY(-150px)",
          }}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="600"
            height="600"
            viewBox="0 0 20 20"
            fill="none"
            style={{ display: "block" }}
          >
            <path
              fill="#d0d0d2"
              d="M17.924 7.154h-.514l.027-1.89a.46.46 0 0 0-.12-.298L12.901.134A.4.4 0 0 0 12.618 0h-9.24a.8.8 0 0 0-.787.784v6.37h-.515c-.285 0-.56.118-.76.328A1.14 1.14 0 0 0 1 8.275v5.83c0 .618.482 1.12 1.076 1.12h.515v3.99A.8.8 0 0 0 3.38 20h13.278c.415 0 .78-.352.78-.784v-3.99h.487c.594 0 1.076-.503 1.076-1.122v-5.83c0-.296-.113-.582-.315-.792a1.05 1.05 0 0 0-.76-.328M3.95 1.378h6.956v4.577a.4.4 0 0 0 .11.277a.37.37 0 0 0 .267.115h4.759v.807H3.95zm0 17.244v-3.397h12.092v3.397zM12.291 1.52l.385.434l2.58 2.853l.143.173h-2.637q-.3 0-.378-.1q-.08-.098-.093-.313zM3 14.232v-6h1.918q1.09 0 1.42.09q.51.135.853.588q.343.451.343 1.168q0 .552-.198.93q-.198.375-.503.59a1.7 1.7 0 0 1-.62.285q-.428.086-1.239.086h-.779v2.263zm1.195-4.985v1.703h.654q.707 0 .945-.094a.79.79 0 0 0 .508-.762a.78.78 0 0 0-.19-.54a.82.82 0 0 0-.48-.266q-.213-.04-.86-.04zm4.04-1.015h2.184q.739 0 1.127.115q.52.155.892.552q.371.398.565.972q.195.576.194 1.418q0 .741-.182 1.277q-.223.655-.634 1.06q-.31.308-.84.48q-.395.126-1.057.126H8.235zM9.43 9.247v3.974h.892q.501 0 .723-.057q.291-.074.482-.25q.193-.176.313-.579q.121-.403.121-1.099t-.12-1.068a1.4 1.4 0 0 0-.34-.581a1.13 1.13 0 0 0-.553-.283q-.25-.057-.98-.057zm4.513 4.985v-6H18v1.015h-2.862v1.42h2.47v1.015h-2.47v2.55z"
            />
          </svg>
        </div>
      </body>
    </html>
  );
}
