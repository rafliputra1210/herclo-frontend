'use client';

export default function VouchersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Voucher Diskon</h1>
        <p className="text-gray-500 text-sm">Buat kode kupon diskon dan potongan harga untuk pelanggan.</p>
      </div>
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
        <div className="text-4xl mb-3">🎟️</div>
        <h3 className="font-semibold text-lg text-gray-800">Modul Kode Voucher</h3>
        <p className="text-gray-500 text-sm mt-1">Atur besaran diskon, minimum pembelian, dan batas penggunaan voucher.</p>
      </div>
    </div>
  );
}
