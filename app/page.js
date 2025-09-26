'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  PlusSquare,
  FileText,
  Loader2,
  Download,
  Printer,
  Share2,
  Clipboard,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'


const GLBView = dynamic(() => import('./GLBView'), { ssr: false })

const pdfSizesInches = {
  Letter: [8.5, 11],
  Legal: [8.5, 14],
  Tabloid: [11, 17],
  A0: [33.1, 46.8],
  A1: [23.4, 33.1],
  A2: [16.5, 23.4],
  A3: [11.7, 16.5],
  A4: [8.3, 11.7],
  A5: [5.8, 8.3],
  A6: [4.1, 5.8],
}

export default function Home() {
  const [url, setUrl] = useState('https://example.com/')
  const [format, setFormat] = useState('A4')
  const [orientation, setOrientation] = useState('portrait')
  const [waitTime, setWaitTime] = useState(2000)
  const [printBackground, setPrintBackground] = useState(true)
  const [displayHeaderFooter, setDisplayHeaderFooter] = useState(false)
  const [status, setStatus] = useState('')
  const [statusColor, setStatusColor] = useState('gray')
  const [isLoading, setIsLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [pdfInfo, setPdfInfo] = useState('')
  const [uploadedImages, setUploadedImages] = useState([])
  const iframeRef = useRef(null)
  const imageInputRef = useRef(null)

  const updateSizeInfo = () => {
    const size = pdfSizesInches[format] || [8.3, 11.7]
    return orientation === 'portrait'
      ? `${size[0].toFixed(1)} × ${size[1].toFixed(1)} in`
      : `${size[1].toFixed(1)} × ${size[0].toFixed(1)} in`
  }

  const isValidUrl = (string) => {
    try { new URL(string); return true } catch { return false }
  }

  const handleImageFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => setUploadedImages(prev => [...prev, reader.result])
      reader.readAsDataURL(file)
    })
  }

  const onDrop = (e) => {
    e.preventDefault()
    handleImageFiles(e.dataTransfer.files)
  }

  const generatePDF = async () => {
    if (url && !isValidUrl(url)) {
      setStatus('Invalid URL. Please enter a valid one.')
      setStatusColor('red')
      return
    }

    if (!url && uploadedImages.length === 0) {
      setStatus('Please provide a URL or upload at least one image.')
      setStatusColor('red')
      return
    }

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
      setPdfBlob(null)
    }

    setIsLoading(true)
    setStatus('')
    setPdfInfo('')

    try {
      const res = await fetch('https://snapshot.jessejesse.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url || '',
          waitForTimeout: parseInt(String(waitTime), 10),
          pdfOptions: {
            format,
            landscape: orientation === 'landscape',
            printBackground,
            displayHeaderFooter,
            margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
          },
          images: uploadedImages,
        }),
      })

      if (!res.ok) throw new Error(await res.text())
      const blob = await res.blob()
      const newUrl = URL.createObjectURL(blob)
      setPdfUrl(newUrl)
      setPdfBlob(blob)
      setPdfInfo(`${format} | ${orientation} | ${(blob.size / 1024).toFixed(1)} KB`)
      setStatus('PDF created successfully!')
      setStatusColor('green')
    } catch (err) {
      setStatus(`Error: ${err.message}`)
      setStatusColor('red')
    } finally {
      setIsLoading(false)
    }
  }

  const printPDF = () => {
    if (!pdfBlob) return alert('No PDF available to print.')
    const blobUrl = URL.createObjectURL(pdfBlob)
    const printWindow = window.open(blobUrl, '_blank')
    if (!printWindow) return alert('Pop-up blocked. Please allow pop-ups.')
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.onafterprint = () => URL.revokeObjectURL(blobUrl)
    }
  }

  const sharePDF = async () => {
    if (!pdfBlob) return alert('No PDF to share.')
    const file = new File([pdfBlob], 'webPDF.pdf', { type: 'application/pdf' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title: 'Web PDF', text: 'Powered by JesseJesse.com', files: [file] })
        setStatus('PDF shared successfully!')
        setStatusColor('green')
      } catch (err) {
        setStatus(`Error sharing: ${err.message}`)
        setStatusColor('red')
      }
    } else alert('Sharing not supported. Please download instead.')
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="w-full text-center bg-gray-800 p-4 border-b border-indigo-500 flex items-center justify-center gap-2 mb-6">
        <PlusSquare className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-bold text-indigo-300">pdf.JesseJesse.com</h1>
      </header>

      <main className="flex-1 w-full overflow-y-auto px-4 md:px-6 pb-32">
        <div className="w-full max-w-2xl space-y-4 mx-auto">
          {/* URL & Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 text-green-500 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">PDF Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.keys(pdfSizesInches).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">Size: {updateSizeInfo()}</p>
            </div>
          </div>

          {/* Wait & Orientation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Wait Time (ms)</label>
              <input
                type="number"
                value={waitTime}
                onChange={(e) => setWaitTime(Number(e.target.value))}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Orientation</label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={printBackground}
                onChange={(e) => setPrintBackground(e.target.checked)}
                className="rounded bg-gray-800 border-gray-700 text-indigo-600"
              />
              <span className="text-sm">Print Background</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={displayHeaderFooter}
                onChange={(e) => setDisplayHeaderFooter(e.target.checked)}
                className="rounded bg-gray-800 border-gray-700 text-indigo-600"
              />
              <span className="text-sm">Include Timestamp</span>
            </label>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload Images</label>
            <div
              onClick={() => imageInputRef.current.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="border-2 border-dashed border-indigo-500 rounded p-4 text-center cursor-pointer"
            >
              drop images here to create PDF
            </div>
            <input
              type="file"
              ref={imageInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFiles(e.target.files)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {uploadedImages.map((img, i) => (
                <img key={i} src={img} alt="" className="h-20 rounded border border-gray-600" />
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={generatePDF}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold py-3 px-4 rounded shadow flex items-center justify-center gap-2"
          >
            {!isLoading ? (
              <>
                <FileText className="w-5 h-5" /> Create PDF
              </>
            ) : (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Just a moment...
              </>
            )}
          </button>

          <p className={`text-sm text-center mt-2 ${
            statusColor === 'green' ? 'text-green-400' :
            statusColor === 'red' ? 'text-red-400' : 'text-gray-400'
          }`}>{status}</p>

          {/* Preview + 3D Viewer */}
          {pdfUrl && (
            <div className="w-full max-w-6xl mt-8 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-2">
                <h2 className="text-lg text-gray-400 font-medium">Preview</h2>
                <span className="text-xs text-gray-400">{pdfInfo}</span>
              </div>
              <div
                className="rounded-lg shadow-lg overflow-hidden border border-gray-800 w-full"
                style={{ minHeight: '400px', height: '60vh' }}
              >
                <iframe
                  ref={iframeRef}
                  src={pdfUrl}
                  className="w-full h-full block"
                  style={{ border: 'none' }}
                />
              </div>
              <GLBView url="/pdf.glb" />
            </div>
          )}

          {/* Actions */}
          {pdfUrl && (
            <div className="flex flex-wrap gap-4 mt-4">
              <a
                download="webPDF.pdf"
                href={pdfUrl}
                className="bg-emerald-600 hover:bg-emerald-700 transition text-white font-medium py-2 px-4 rounded shadow flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download
              </a>
              <button
                onClick={printPDF}
                className="bg-indigo-600 hover:bg-indigo-700 transition text-white font-medium py-2 px-4 rounded shadow flex items-center gap-2"
              >
                <Printer className="w-5 h-5" /> Print
              </button>
              <button
                onClick={sharePDF}
                className="bg-cyan-600 hover:bg-cyan-700 transition text-white font-medium py-2 px-4 rounded shadow flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" /> Share
              </button>
            </div>
          )}
        </div>
      </main>
          {/* Footer */}
<footer className="w-full bg-gray-900 text-gray-400 py-4 text-center border-t border-gray-800 mt-auto">
  <a
    href="https://pdf.JesseJesse.com"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-indigo-400 transition"
  >
    pdf.JesseJesse.com
  </a>
</footer>

    </div>
  )
}

