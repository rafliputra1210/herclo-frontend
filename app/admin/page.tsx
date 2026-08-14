'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mempertahankan logika pengambilan data statistik
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [prodRes, catRes, orderRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/categories'),
          api.get('/admin/orders'),
        ]);

        const productCount = prodRes.status === 'fulfilled' ? (prodRes.value.data.data?.length || 0) : 0;
        const categoryCount = catRes.status === 'fulfilled' ? (catRes.value.data.data?.length || 0) : 0;
        const ordersData = orderRes.status === 'fulfilled' ? (orderRes.value.data.data || []) : [];
        const orderCount = ordersData.length;
        
        const totalRev = ordersData.reduce((acc: number, curr: any) => {
          return acc + (Number(curr.total_amount) || 0);
        }, 0);

        setStats({
          products: productCount,
          categories: categoryCount,
          orders: orderCount,
          revenue: totalRev,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div>
      {/* Header Halaman */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ikhtisar Bisnis</h1>
          <p className="text-gray-500 mt-2 font-medium text-sm">Pantau performa dan matrik toko HERCLO secara real-time.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            Unduh Laporan
          </button>
          <Link href="/admin/products?add=true" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 hover:shadow-lg transition-all shadow-md flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Tambah Produk
          </Link>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {/* Card 1: Pendapatan */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-gray-200 transition-colors">
          <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rotate-12">💰</div>
          <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Total Pendapatan</p>
          <div className="h-10 flex items-center">
            {loading ? (
              <div className="h-8 w-40 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : (
              <p className="text-3xl font-black text-gray-900 tracking-tighter">
                Rp {new Intl.NumberFormat('id-ID').format(stats.revenue)}
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg flex items-center gap-1 border border-green-100">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              Akumulasi Sukses
            </span>
          </div>
        </div>

        {/* Card 2: Pesanan */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-gray-200 transition-colors">
          <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rotate-12">📦</div>
          <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Total Pesanan</p>
          <div className="h-10 flex items-center">
            {loading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : (
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.orders}</p>
            )}
          </div>
          <Link href="/admin/orders" className="text-sm text-gray-600 font-bold hover:text-gray-900 mt-5 inline-flex items-center gap-1.5 transition-colors">
            Kelola Pesanan <span className="text-lg leading-none">→</span>
          </Link>
        </div>

        {/* Card 3: Produk */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-gray-200 transition-colors">
          <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rotate-12">👕</div>
          <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Katalog Produk</p>
          <div className="h-10 flex items-center">
            {loading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : (
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.products}</p>
            )}
          </div>
          <Link href="/admin/products" className="text-sm text-gray-600 font-bold hover:text-gray-900 mt-5 inline-flex items-center gap-1.5 transition-colors">
            Kelola Produk <span className="text-lg leading-none">→</span>
          </Link>
        </div>

        {/* Card 4: Kategori */}
        <div className="bg-white p-7 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-gray-200 transition-colors">
          <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rotate-12">📁</div>
          <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Kategori Aktif</p>
          <div className="h-10 flex items-center">
            {loading ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : (
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.categories}</p>
            )}
          </div>
          <Link href="/admin/categories" className="text-sm text-gray-600 font-bold hover:text-gray-900 mt-5 inline-flex items-center gap-1.5 transition-colors">
            Kelola Kategori <span className="text-lg leading-none">→</span>
          </Link>
        </div>
      </div>

      {/* Akses Cepat */}
      <div className="mb-10">
        <h2 className="text-lg font-black text-gray-900 mb-5">Akses Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/products" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-gray-900 transition-colors">
              <span className="group-hover:scale-110 transition-transform">👕</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-lg">Manajemen Produk</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">Tambah barang baru, atur varian harga, dan pantau pembaruan stok secara instan.</p>
            </div>
          </Link>
          
          <Link href="/admin/categories" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-gray-900 transition-colors">
              <span className="group-hover:scale-110 transition-transform">📁</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-lg">Kategori Toko</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">Kelola etalase dan struktur pengelompokan produk untuk navigasi pelanggan.</p>
            </div>
          </Link>
          
          <Link href="/admin/orders" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-gray-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-gray-900 transition-colors">
              <span className="group-hover:scale-110 transition-transform">📦</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1.5 text-lg">Pusat Pesanan</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">Proses pesanan masuk, perbarui resi pengiriman, dan lacak status pembayaran.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Seksi Visualisasi / Info Sistem */}
      <div className="bg-gray-900 p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h3 className="font-bold text-white mb-1.5 text-lg">Status Operasional HERCLO</h3>
          <p className="text-sm text-gray-400 font-medium">Sistem backend Laravel dan API berjalan optimal.</p>
        </div>
        <div className="relative z-10 flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-5 py-3 rounded-2xl border border-gray-700">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="text-sm font-bold text-green-400 tracking-wide">API Sanctum Terhubung</span>
        </div>
      </div>
    </div>
  );
}