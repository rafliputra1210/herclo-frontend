'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/user')
      .then((res) => {
        const userData = res.data;
        if (userData?.role !== 'admin' && userData?.role !== 'super_admin') {
          router.push('/dashboard');
          return;
        }
        setUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Session invalid:', err);
        localStorage.removeItem('auth_token');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('herclo_token');
      localStorage.removeItem('herclo_user');
      router.push('/login');
    }
  };

  const isActive = (path: string) => pathname === path ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100';

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-700 font-medium">Memuat Admin Panel...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden text-gray-900">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <h2 className={`font-bold text-xl tracking-tight text-gray-900 ${!isSidebarOpen && 'hidden'}`}>HERCLO. Admin</h2>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 text-gray-700">
            ☰
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-medium">
          <div className={`text-xs text-gray-400 uppercase tracking-wider mb-2 mt-4 ${!isSidebarOpen && 'hidden'}`}>Menu Utama</div>
          <Link href="/admin" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin')}`}>📊 Dashboard Penjualan</Link>
          <Link href="/admin/orders" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/orders')}`}>📦 Manajemen Order</Link>
          <Link href="/admin/customers" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/customers')}`}>👥 Data Customer</Link>
          
          <div className={`text-xs text-gray-400 uppercase tracking-wider mb-2 mt-6 ${!isSidebarOpen && 'hidden'}`}>Katalog & Produk</div>
          <Link href="/admin/products" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/products')}`}>👕 CRUD Produk</Link>
          <Link href="/admin/categories" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/categories')}`}>📁 CRUD Kategori</Link>
          
          <div className={`text-xs text-gray-400 uppercase tracking-wider mb-2 mt-6 ${!isSidebarOpen && 'hidden'}`}>Marketing & Promo</div>
          <Link href="/admin/banners" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/banners')}`}>🖼️ Banner</Link>
          <Link href="/admin/vouchers" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/vouchers')}`}>🎟️ Voucher</Link>
          <Link href="/admin/promos" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/promos')}`}>🔥 Promo</Link>
          
          <div className={`text-xs text-gray-400 uppercase tracking-wider mb-2 mt-6 ${!isSidebarOpen && 'hidden'}`}>Operasional</div>
          <Link href="/admin/payments" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/payments')}`}>💳 Pembayaran</Link>
          <Link href="/admin/shipping" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/shipping')}`}>🚚 Pengiriman</Link>
          <Link href="/admin/marketplace" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/marketplace')}`}>🔄 Sinkron Marketplace</Link>

          <div className={`text-xs text-gray-400 uppercase tracking-wider mb-2 mt-6 ${!isSidebarOpen && 'hidden'}`}>Konten & Laporan</div>
          <Link href="/admin/gallery" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/gallery')}`}>📸 Galeri Foto</Link>
          <Link href="/admin/articles" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/articles')}`}>📝 Artikel</Link>
          <Link href="/admin/testimonials" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/testimonials')}`}>⭐ Testimoni</Link>
          <Link href="/admin/reports" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/reports')}`}>📈 Laporan</Link>
          
          <div className={`text-xs text-gray-400 uppercase tracking-wider mb-2 mt-6 ${!isSidebarOpen && 'hidden'}`}>Sistem</div>
          <Link href="/admin/settings" className={`block px-3 py-2.5 rounded-lg ${isActive('/admin/settings')}`}>⚙️ Pengaturan</Link>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            <span>🚪</span>
            <span className={!isSidebarOpen ? 'hidden' : ''}>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar Atas */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
           <div className="text-xs font-semibold uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded">
             Admin Mode
           </div>
           <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-800">{user?.name || 'Admin Herclo'}</span>
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
           </div>
        </header>

        {/* Konten Halaman Dinamis */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}