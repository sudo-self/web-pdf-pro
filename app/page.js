'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  PlusSquare,
  FileText,
  Loader2,
  Download,
  Printer,
  Share2,
  X,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

// hook debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

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
  const [isPrinting, setIsPrinting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfBlob, setPdfBlob] = useState(null)
  const [pdfInfo, setPdfInfo] = useState('')
  const [uploadedImages, setUploadedImages] = useState([])
  const [urlError, setUrlError] = useState('')
  const [progress, setProgress] = useState(0)
  const iframeRef = useRef(null)
  const imageInputRef = useRef(null)

  const debouncedUrl = useDebounce(url, 500)


  useEffect(() => {
    validateUrl(debouncedUrl)
  }, [debouncedUrl])


  useEffect(() => {
    let interval
    if (isLoading) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 500)
    } else {
      setProgress(0)
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  const updateSizeInfo = () => {
    const size = pdfSizesInches[format] || [8.3, 11.7]
    return orientation === 'portrait'
      ? `${size[0].toFixed(1)} × ${size[1].toFixed(1)} in`
      : `${size[1].toFixed(1)} × ${size[0].toFixed(1)} in`
  }

  const sizeInfo = useMemo(() => updateSizeInfo(), [format, orientation])

  const validateUrl = (inputUrl) => {
    if (!inputUrl || inputUrl === 'https://example.com/') {
      setUrlError('')
      return true
    }
    
    try {
      const urlObj = new URL(inputUrl)
      if (!urlObj.protocol.startsWith('http')) {
        setUrlError('URL must start with http:// or https://')
        return false
      }
      setUrlError('')
      return true
    } catch {
      setUrlError('Please enter a valid URL')
      return false
    }
  }

  const isValidUrl = (string) => {
    try { 
      new URL(string)
      return true 
    } catch { 
      return false 
    }
  }

  const handleImageFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`Skipped non-image file: ${file.name}`)
        return
      }
      
   
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Image too large: ${file.name} (max 10MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = () => setUploadedImages(prev => [...prev, reader.result])
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const onDrop = (e) => {
    e.preventDefault()
    handleImageFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

const generatePDF = async () => {

  if (url && url !== 'https://example.com/' && !isValidUrl(url)) {
    setStatus('Invalid URL. Please enter a valid one.')
    setStatusColor('red')
    toast.error('Please enter a valid URL')
    return
  }

 
  if ((!url || url === 'https://example.com/') && uploadedImages.length === 0) {
    setStatus('Please provide a URL or upload at least one image.')
    setStatusColor('red')
    toast.error('Please provide a URL or upload images')
    return
  }

  if (urlError) {
    setStatus('Please fix URL errors before generating PDF.')
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
  setProgress(0)

  try {
 
    const payload = {
      waitForTimeout: parseInt(String(waitTime), 10),
      pdfOptions: {
        format,
        landscape: orientation === 'landscape',
        printBackground,
        displayHeaderFooter,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      },
      images: uploadedImages,
    }

    if (url && url !== 'https://example.com/') {
      payload.url = url
    }

    const res = await fetch('https://snapshot.jessejesse.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text()
      if (res.status === 429) throw new Error('Rate limit exceeded. Please try again later.')
      if (res.status === 502) throw new Error('Service temporarily unavailable.')
      if (res.status === 413) throw new Error('File too large. Please reduce image sizes.')
      throw new Error(errorText || `HTTP Error ${res.status}`)
    }

    const blob = await res.blob()

    if (blob.size === 0) {
      throw new Error('Empty PDF generated - please try again')
    }

    setProgress(100)
    const newUrl = URL.createObjectURL(blob)
    setPdfUrl(newUrl)
    setPdfBlob(blob)
    setPdfInfo(`${format} | ${orientation} | ${(blob.size / 1024).toFixed(1)} KB | ${new Date().toLocaleDateString()}`)
    setStatus('PDF created successfully!')
    setStatusColor('green')
    toast.success('PDF generated successfully!')
  } catch (err) {
    console.error('PDF generation error:', err)
    setStatus(`Error: ${err.message}`)
    setStatusColor('red')
    toast.error(`Failed to generate PDF: ${err.message}`)
  } finally {
    setIsLoading(false)
  }
}


  const printPDF = async () => {
    if (!pdfBlob) {
      toast.error('No PDF available to print.')
      return
    }

    setIsPrinting(true)
    try {
      const blobUrl = URL.createObjectURL(pdfBlob)
      const printWindow = window.open(blobUrl, '_blank')
      
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups for printing.')
        return
      }

      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => {
          URL.revokeObjectURL(blobUrl)
          setIsPrinting(false)
        }
      }
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Print failed. Please try again.')
      setIsPrinting(false)
    }
  }

  const sharePDF = async () => {
    if (!pdfBlob) {
      toast.error('No PDF to share.')
      return
    }

    setIsSharing(true)
    try {
      const file = new File([pdfBlob], 'webPDF.pdf', { type: 'application/pdf' })
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ 
          title: 'Web PDF', 
          text: 'Powered by pdf.JesseJesse.com', 
          files: [file] 
        })
        setStatus('PDF shared successfully!')
        setStatusColor('green')
        toast.success('PDF shared successfully!')
      } else {
        toast.error('Sharing not supported. Please download instead.')
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err)
        setStatus(`Error sharing: ${err.message}`)
        setStatusColor('red')
        toast.error('Sharing failed. Please try again.')
      }
    } finally {
      setIsSharing(false)
    }
  }

 const clearAll = () => {
  setUrl('') 
  setUploadedImages([])
  setUrlError('')
  setStatus('')
  if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)
    setPdfBlob(null)
  }
  toast.success('Form cleared!')
}


  return (
    <div className="bg-gray-950 text-white min-h-screen flex flex-col">
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      
      <header className="w-full text-center bg-gray-800 p-4 border-b border-indigo-500 flex items-center justify-center gap-2 mb-6">
      <FilePlus className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-bold text-indigo-300">pdf.JesseJesse.com</h1>
      </header>

      <main className="flex-1 w-full overflow-y-auto px-4 md:px-6 pb-32">
        <div className="w-full max-w-2xl space-y-4 mx-auto">
      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Website URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`w-full px-4 py-2 rounded bg-gray-800 text-green-500 border ${
                  urlError ? 'border-red-500' : 'border-gray-700'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="https://example.com"
              />
              {urlError && <p className="text-red-400 text-xs mt-1">{urlError}</p>}
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
              <p className="mt-1 text-xs text-gray-400">Size: {sizeInfo}</p>
            </div>
          </div>

    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Wait Time (ms)</label>
              <input
                type="number"
                min="0"
                max="10000"
                value={waitTime}
                onChange={(e) => setWaitTime(Number(e.target.value))}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-400">Wait time before creating PDF</p>
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

     
          <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800 rounded-lg">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={printBackground}
                onChange={(e) => setPrintBackground(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">Print Background</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={displayHeaderFooter}
                onChange={(e) => setDisplayHeaderFooter(e.target.checked)}
                className="rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm">Include Timestamp</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Upload Images {uploadedImages.length > 0 && `(${uploadedImages.length})`}
            </label>
            <div
              onClick={() => imageInputRef.current.click()}
              onDragOver={onDragOver}
              onDrop={onDrop}
              className="border-2 border-dashed border-indigo-500 rounded p-6 text-center cursor-pointer hover:bg-gray-800 transition-colors"
            >
              <p className="text-indigo-300 font-medium">Drop images here or click to upload</p>
              <p className="text-gray-400 text-sm mt-1">supported formats jpeg, png, webp, (10mb max)</p>
            </div>
            <input
              type="file"
              ref={imageInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFiles(e.target.files)}
            />
            
            {uploadedImages.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img 
                        src={img} 
                        alt={`Uploaded ${i + 1}`} 
                        className="h-20 w-20 object-cover rounded border border-gray-600"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setUploadedImages([])}
                  className="text-red-400 text-xs mt-2 hover:text-red-300 transition-colors"
                >
                  Remove all images
                </button>
              </div>
            )}
          </div>

       
          {isLoading && (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

    
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              disabled={isLoading}
              aria-label="Generate PDF"
              aria-busy={isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition text-white font-semibold py-3 px-4 rounded shadow flex items-center justify-center gap-2"
            >
              {!isLoading ? (
                <>
                  <FileText className="w-5 h-5" /> Create PDF
                </>
              ) : (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating... ({progress}%)
                </>
              )}
            </button>
            
            <button
              onClick={clearAll}
              disabled={isLoading}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 transition text-white rounded shadow flex items-center gap-2"
            >
              Clear
            </button>
          </div>

          <p className={`text-sm text-center mt-2 ${
            statusColor === 'green' ? 'text-green-400' :
            statusColor === 'red' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {status}
          </p>

     
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
                  title="PDF Preview"
                />
              </div>
              <GLBView url="/pdf.glb" />
            </div>
          )}

  
          {pdfUrl && (
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                download="webPDF.pdf"
                href={pdfUrl}
                className="bg-emerald-600 hover:bg-emerald-700 transition text-white font-medium py-2 px-4 rounded shadow flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download
              </a>
              
              <button
                onClick={printPDF}
                disabled={isPrinting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition text-white font-medium py-2 px-4 rounded shadow flex items-center gap-2"
              >
                <Printer className="w-5 h-5" /> 
                {isPrinting ? 'Printing...' : 'Print'}
              </button>
              
              <button
                onClick={sharePDF}
                disabled={isSharing}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 transition text-white font-medium py-2 px-4 rounded shadow flex items-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                {isSharing ? 'Sharing...' : 'Share'}
              </button>
            </div>
          )}
        </div>
      </main>


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

