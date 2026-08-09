'use client';

export default function CustomersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Customer</h1>
        <p className="text-gray-500 text-sm">Daftar pelanggan terdaftar di platform HERCLO.</p>
      </div>
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
        <div className="text-4xl mb-3">👥</div>
        <h3 className="font-semibold text-lg text-gray-800">Modul Data Customer</h3>
        <p className="text-gray-500 text-sm mt-1">Kelola informasi pelanggan, alamat, dan riwayat pesanan.</p>
      </div>
    </div>
  );
}
