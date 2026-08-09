'use client';

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
        <p className="text-gray-500 text-sm">Analisis dan grafik performa bisnis toko HERCLO.</p>
      </div>
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
        <div className="text-4xl mb-3">📈</div>
        <h3 className="font-semibold text-lg text-gray-800">Modul Laporan & Statistik</h3>
        <p className="text-gray-500 text-sm mt-1">Unduh laporan omset, keuangan, dan analisis produk terlaris.</p>
      </div>
    </div>
  );
}
