'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReceiptPage() {
  const [receipt, setReceipt] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Ambil data struk yang disimpan saat Midtrans sukses tadi
    const savedReceipt = localStorage.getItem('herclo_receipt');
    if (savedReceipt) {
      setReceipt(JSON.parse(savedReceipt));
    } else {
      router.push('/'); // Jika tidak ada data, kembalikan ke beranda
    }
  }, [router]);

  if (!receipt) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Struk */}
        <div className="bg-emerald-500 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl text-emerald-500">✓</span>
          </div>
          <h1 className="text-2xl font-black mb-1">Pembayaran Berhasil!</h1>
          <p className="opacity-90 text-sm">Terima kasih telah berbelanja di HERCLO.</p>
        </div>

        {/* Detail Struk */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between border-b pb-4">
            <span className="text-gray-500">ID Pesanan</span>
            <span className="font-bold text-gray-900">{receipt.orderId}</span>
          </div>
          <div className="flex justify-between border-b pb-4">
            <span className="text-gray-500">Total Dibayar</span>
            <span className="font-bold text-gray-900 text-xl">Rp {new Intl.NumberFormat('id-ID').format(receipt.total)}</span>
          </div>

          {/* KOTAK AKSES DASHBOARD */}
          <div className="bg-gray-900 text-white p-6 rounded-xl relative overflow-hidden mt-8">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <h3 className="font-bold text-lg mb-4 text-emerald-400">Akses Dashboard Anda</h3>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Kami telah membuatkan akses khusus untuk Anda melacak status pengiriman barang. Silakan login ke Dashboard menggunakan data berikut:
            </p>
            <div className="bg-black/50 p-4 rounded-lg space-y-2 border border-white/10 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-semibold">{receipt.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kode Dashboard (Password):</span>
                <span className="font-semibold text-emerald-400 tracking-wider">{receipt.dashboardCode}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-4 text-center">Harap simpan kode ini (Screenshot halaman ini jika perlu).</p>
          </div>
        </div>

        {/* Footer Tombol */}
        <div className="p-6 bg-gray-50 border-t flex gap-4">
          <Link href="/login" onClick={() => localStorage.removeItem('herclo_receipt')} className="flex-1 text-center py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors">
            Masuk ke Dashboard Sekarang
          </Link>
        </div>

      </div>
    </main>
  );
}