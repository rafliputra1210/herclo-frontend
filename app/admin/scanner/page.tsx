'use client';

import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Barcode from 'react-barcode';
import api from '../../../lib/axios';

export default function InventoryScannerPage() {
  const [scanInput, setScanInput] = useState('');
  const [action, setAction] = useState('out'); // 'in' = Masuk, 'out' = Keluar
  const [scanMode, setScanMode] = useState<'fisik' | 'kamera'>('fisik');
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);
  isProcessingRef.current = isProcessing;

  // Fokuskan input jika menggunakan mode fisik
  useEffect(() => {
    if (scanMode === 'fisik') {
      inputRef.current?.focus();
    }
  }, [action, scanMode]);

  // Inisialisasi Kamera Scanner (Auto Start langsung tanpa tombol tersembunyi)
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isCancelled = false;

    if (scanMode === 'kamera') {
      setCameraLoading(true);
      setCameraError(null);

      const startScanner = async () => {
        try {
          // Tunggu DOM elemen #reader siap
          await new Promise((r) => setTimeout(r, 100));
          if (isCancelled) return;

          const readerElem = document.getElementById('reader');
          if (!readerElem) return;

          html5QrCode = new Html5Qrcode('reader');

          await html5QrCode.start(
            { facingMode: 'environment' },
            {
              fps: 15,
              qrbox: { width: 280, height: 120 },
              aspectRatio: 1.333333,
            },
            (decodedText) => {
              if (!isProcessingRef.current) {
                setScanInput(decodedText);
                processScanApi(decodedText);
              }
            },
            () => {
              // Ignore scan frame search noise
            }
          );

          if (!isCancelled) {
            setCameraLoading(false);
          }
        } catch (err: any) {
          if (!isCancelled) {
            console.error('Kamera error:', err);
            setCameraLoading(false);
            setCameraError(
              err?.name === 'NotAllowedError' || err?.message?.includes('Permission')
                ? 'Izin kamera ditolak. Silakan izinkan akses kamera di browser Anda lalu klik Coba Lagi.'
                : 'Kamera tidak dapat diakses atau sedang digunakan oleh aplikasi lain.'
            );
          }
        }
      };

      startScanner();
    }

    return () => {
      isCancelled = true;
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            try { html5QrCode?.clear(); } catch {}
          }).catch(() => {});
        } else {
          try { html5QrCode.clear(); } catch {}
        }
      }
    };
  }, [scanMode, retryCount]);

  // Fungsi Pemroses API (Digunakan oleh Kamera & Form Manual)
  const processScanApi = async (skuCode: string) => {
    if (!skuCode.trim() || isProcessing) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await api.post('/admin/inventory/scan', {
        sku: skuCode.toUpperCase(),
        action: action
      });

      // Mainkan suara 'Beep' sukses (Opsional)
      const audio = new Audio('/success-beep.mp3'); 
      audio.play().catch(() => {});

      setMessage({ text: res.data.message, type: 'success' });
      setLastScanned({
        name: res.data.product_name,
        stock: res.data.current_stock,
        sku: skuCode.toUpperCase()
      });
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Gagal memproses kode / Produk tidak ditemukan', 
        type: 'error' 
      });
    } finally {
      setScanInput(''); 
      setIsProcessing(false);
      if (scanMode === 'fisik') inputRef.current?.focus();
    }
  };

  // Handler Submit untuk Scanner Fisik
  const handlePhysicalScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScanApi(scanInput);
  };

  return (
    <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* AREA SCANNER UTAMA */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Scanner Gudang</h1>
            <p className="text-gray-500 text-sm mt-1">Pindai Barcode Hangtag untuk update stok.</p>
          </div>
        </div>

        {/* Toggle Mode IN / OUT */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button 
            onClick={() => setAction('out')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${action === 'out' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
          >
            ➖ Barang Keluar
          </button>
          <button 
            onClick={() => setAction('in')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${action === 'in' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}
          >
            ➕ Barang Masuk
          </button>
        </div>

        {/* Toggle Mode Alat Scanner */}
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input type="radio" name="mode" checked={scanMode === 'fisik'} onChange={() => setScanMode('fisik')} className="w-4 h-4 accent-black" />
            Scanner Fisik / Keyboard
          </label>
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input type="radio" name="mode" checked={scanMode === 'kamera'} onChange={() => setScanMode('kamera')} className="w-4 h-4 accent-black" />
            Kamera HP / Laptop
          </label>
        </div>

        {/* INPUT FISIK */}
        {scanMode === 'fisik' && (
          <form onSubmit={handlePhysicalScanSubmit} className="space-y-4">
            <div>
              <input 
                ref={inputRef}
                type="text" 
                value={scanInput} 
                onChange={e => setScanInput(e.target.value)}
                disabled={isProcessing}
                placeholder="Tembak Barcode ke sini..."
                className="w-full border-2 border-dashed border-gray-300 p-4 rounded-xl outline-none focus:border-black focus:bg-gray-50 text-center font-mono text-lg uppercase"
              />
            </div>
            <button type="submit" className="hidden">Submit</button>
          </form>
        )}

        {/* INPUT KAMERA */}
        {scanMode === 'kamera' && (
          <div className="space-y-3">
            <div className="relative w-full overflow-hidden rounded-xl border-2 border-zinc-900 bg-zinc-950 min-h-[260px] flex items-center justify-center">
              {/* Tempat kamera akan dirender oleh html5-qrcode */}
              <div id="reader" className="w-full h-full [&_video]:w-full [&_video]:h-auto [&_video]:object-cover [&_video]:rounded-lg"></div>

              {/* Status Loading Kamera */}
              {cameraLoading && !cameraError && (
                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center text-white p-4 text-center z-10">
                  <div className="w-8 h-8 border-3 border-lime-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-sm font-bold text-zinc-200">Menghubungkan ke Kamera...</p>
                  <p className="text-xs text-zinc-400 mt-1">Harap izinkan akses kamera jika browser memintanya.</p>
                </div>
              )}

              {/* Status Error Izin Kamera */}
              {cameraError && (
                <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center text-white p-6 text-center z-10">
                  <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-3 text-xl font-black">
                    📷
                  </div>
                  <p className="text-sm font-bold text-white mb-1">Akses Kamera Bermasalah</p>
                  <p className="text-xs text-zinc-400 max-w-xs mb-4">{cameraError}</p>
                  <button
                    onClick={() => setRetryCount(c => c + 1)}
                    className="px-4 py-2 bg-lime-400 text-black font-bold text-xs rounded-lg hover:bg-lime-300 transition-colors cursor-pointer"
                  >
                    🔄 Coba Buka Kamera Lagi
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 text-center font-medium">
              💡 Pastikan pencahayaan cukup dan posisikan barcode di tengah kotak kamera.
            </p>
          </div>
        )}

        {/* NOTIFIKASI HASIL */}
        <div className="mt-6 h-36">
          {isProcessing && <p className="text-center text-gray-500 font-bold animate-pulse">Memproses...</p>}
          {message && !isProcessing && (
            <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <p className="font-bold">{message.text}</p>
              {lastScanned && message.type === 'success' && (
                <div className="mt-2 text-sm flex justify-between items-end border-t border-emerald-200/50 pt-2">
                  <div>
                    <p className="font-mono font-bold text-xs">{lastScanned.sku}</p>
                    <p className="font-medium">{lastScanned.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider">Sisa Stok Induk</p>
                    <p className="font-black text-xl leading-none">{lastScanned.stock}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AREA PREVIEW STIKER */}
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-inner flex flex-col items-center justify-center text-center">
        <h3 className="font-black text-lg mb-2">Simulasi Barcode Hangtag</h3>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">Gunakan mode "Barang Keluar", lalu arahkan kamera ke barcode di bawah ini untuk mencoba sistem.</p>
        
        {/* Stiker Dummy untuk Dites Kamera */}
        <div className="w-[6cm] h-[3.5cm] bg-white border border-dashed border-gray-400 flex flex-col justify-center px-3 py-2 text-black shadow-lg transform scale-110">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">MEN'S SPORTS</p>
          <p className="text-[11px] font-medium leading-tight truncate uppercase mb-1">
            Herclo Basic Polo
          </p>
          <p className="text-[11px] font-bold leading-tight mb-2">
            Size: XL &nbsp;&nbsp; Rp 150.000
          </p>
          <div className="flex justify-start">
            <Barcode 
              value="HRC-0016-003" 
              width={1.2}      
              height={30}      
              fontSize={11}    
              margin={0}
              background="#ffffff"
              lineColor="#000000"
            />
          </div>
        </div>

      </div>
    </div>
  );
}