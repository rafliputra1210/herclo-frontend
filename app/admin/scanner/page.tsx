'use client';

import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Barcode from 'react-barcode';
import api from '../../../lib/axios';

export default function InventoryScannerPage() {
  const [scanInput, setScanInput] = useState('');
  const [action, setAction] = useState('out'); // 'in' = Masuk, 'out' = Keluar
  const [scanMode, setScanMode] = useState<'fisik' | 'kamera'>('fisik');
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Fokuskan input jika menggunakan mode fisik
  useEffect(() => {
    if (scanMode === 'fisik') {
      inputRef.current?.focus();
    }
  }, [action, scanMode]);

  // Inisialisasi Kamera Scanner
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scanMode === 'kamera') {
      // Setup scanner (Mendukung 1D Barcode & QR Code)
      scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 300, height: 100 } // Bentuk kotak memanjang (ideal untuk Barcode 1D)
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Ketika barcode berhasil terbaca oleh kamera
          if (!isProcessing) {
            setScanInput(decodedText);
            processScanApi(decodedText);
            
            // Jeda sejenak agar kamera tidak membaca barcode yang sama berkali-kali
            scanner?.pause(true);
            setTimeout(() => {
              scanner?.resume();
            }, 2000); 
          }
        },
        (error) => {
          // Abaikan error saat kamera sedang mencari barcode
        }
      );
    }

    // Bersihkan memori kamera saat komponen ditutup atau ganti mode
    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Gagal mematikan kamera", error));
      }
    };
  }, [scanMode, action]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <div className="w-full overflow-hidden rounded-xl border-2 border-black bg-black">
            {/* Tempat kamera akan dirender oleh html5-qrcode */}
            <div id="reader" className="w-full"></div>
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