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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Penjualan</h1>
        <p className="text-gray-500 mt-1">Ringkasan performa toko HERCLO real-time.</p>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Pendapatan</p>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? '...' : `Rp ${new Intl.NumberFormat('id-ID').format(stats.revenue)}`}
          </p>
          <p className="text-sm text-green-600 mt-2 font-medium">↑ Dari akumulasi order</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Pesanan</p>
          <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.orders}</p>
          <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline mt-2 inline-block font-medium">
            Kelola Pesanan &rarr;
          </Link>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Katalog Produk</p>
          <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.products}</p>
          <Link href="/admin/products" className="text-xs text-blue-600 hover:underline mt-2 inline-block font-medium">
            Kelola Produk &rarr;
          </Link>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Kategori Aktif</p>
          <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.categories}</p>
          <Link href="/admin/categories" className="text-xs text-blue-600 hover:underline mt-2 inline-block font-medium">
            Kelola Kategori &rarr;
          </Link>
        </div>
      </div>

      {/* Akses Cepat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/products" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-black transition-all group">
          <div className="text-2xl mb-2">👕</div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-black">CRUD Produk</h3>
          <p className="text-sm text-gray-500 mt-1">Tambah produk baru, atur harga, dan perbarui stok barang.</p>
        </Link>
        <Link href="/admin/categories" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-black transition-all group">
          <div className="text-2xl mb-2">📁</div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-black">CRUD Kategori</h3>
          <p className="text-sm text-gray-500 mt-1">Kelola pengelompokan produk untuk mempermudah navigasi toko.</p>
        </Link>
        <Link href="/admin/orders" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-black transition-all group">
          <div className="text-2xl mb-2">📦</div>
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-black">Manajemen Order</h3>
          <p className="text-sm text-gray-500 mt-1">Cek pesanan masuk, atur status pembayaran dan nomor resi pengiriman.</p>
        </Link>
      </div>

      {/* Seksi Visualisasi / Info Sistem */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-2">Status Operasional HERCLO Backend</h3>
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
          Server Laravel & API Sanctum terhubung secara aktif.
        </div>
      </div>
    </div>
  );
}