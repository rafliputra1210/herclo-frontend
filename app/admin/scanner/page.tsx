'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../../lib/axios';

export default function InventoryScannerPage() {
  const [scanInput, setScanInput] = useState('');
  const [action, setAction] = useState('out'); // Default: Barang Keluar (Terjual)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref untuk memastikan input selalu fokus (siap ditembak scanner)
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [action]);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      const res = await api.post('/admin/inventory/scan', {
        sku: scanInput.toUpperCase(),
        action: action
      });

      setMessage({ text: res.data.message, type: 'success' });
      setLastScanned({
        name: res.data.product_name,
        stock: res.data.current_stock
      });
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Gagal memproses kode', 
        type: 'error' 
      });
    } finally {
      setScanInput(''); // Kosongkan input agar siap untuk scan berikutnya
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* AREA SCANNER BARCODE */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Scanner Gudang</h1>
          <p className="text-gray-500 text-sm mt-1">Gunakan alat Barcode Scanner untuk menembak QR Code Hangtag.</p>
        </div>

        {/* Toggle Mode Masuk / Keluar */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button 
            onClick={() => {setAction('out'); inputRef.current?.focus();}}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${action === 'out' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
          >
            ➖ Barang Keluar (Terjual)
          </button>
          <button 
            onClick={() => {setAction('in'); inputRef.current?.focus();}}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${action === 'in' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}
          >
            ➕ Barang Masuk (Restock)
          </button>
        </div>

        {/* Form Input Rahasia Scanner */}
        <form onSubmit={handleScanSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Input Scanner</label>
            <input 
              ref={inputRef}
              type="text" 
              value={scanInput} 
              onChange={e => setScanInput(e.target.value)}
              disabled={isProcessing}
              placeholder="Tembak Barcode ke sini..."
              className="w-full border-2 border-dashed border-gray-300 p-4 rounded-xl outline-none focus:border-black focus:bg-gray-50 text-center font-mono text-lg uppercase"
              autoFocus
            />
          </div>
          <button type="submit" className="hidden">Submit Hidden</button> {/* Disembunyikan karena scanner otomatis Enter */}
        </form>

        {/* Notifikasi Hasil Scan */}
        <div className="mt-6 h-32">
          {isProcessing && <p className="text-center text-gray-500 font-bold animate-pulse">Memproses...</p>}
          {message && !isProcessing && (
            <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <p className="font-bold">{message.text}</p>
              {lastScanned && message.type === 'success' && (
                <p className="text-sm mt-1">Sisa Stok Sekarang: <span className="font-black text-lg">{lastScanned.stock}</span> pcs</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AREA GENERATOR HANGTAG (Contoh Simulasi Print) */}
      <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-inner flex flex-col items-center justify-center text-center">
        <h3 className="font-black text-lg mb-2">Preview Hangtag HERCLO</h3>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">Ini adalah contoh Hangtag yang akan digantung di produk Anda. Berisi QR Code SKU: PRD-1.</p>
        
        {/* Desain Hangtag Fisik */}
        <div className="w-56 h-80 bg-white border border-gray-200 shadow-xl relative flex flex-col items-center pt-8 pb-4">
          {/* Lubang Tali */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-100 rounded-full border border-gray-300"></div>
          
          <h2 className="font-black tracking-tighter text-2xl mt-4 mb-8">HERCLO.</h2>
          
          {/* Komponen QR Code React */}
          <QRCodeSVG 
            value="PRD-1" // Nilai ini nantinya diganti dinamis sesuai ID produk
            size={120} 
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"M"}
          />
          
          <p className="font-mono text-xs font-bold mt-4 tracking-widest">PRD-1</p>
          <p className="text-[9px] text-gray-400 mt-auto px-4 text-center">Scan at cashier for authentic product registration.</p>
        </div>

        <button onClick={() => window.print()} className="mt-8 bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex gap-2 items-center">
          <span>🖨️</span> Cetak Hangtag Simulasi
        </button>
      </div>

    </div>
  );
}