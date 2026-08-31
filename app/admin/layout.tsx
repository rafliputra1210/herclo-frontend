'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import BackButton from '../components/BackButton';
import { ConfirmProvider } from '../components/ConfirmContext';

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

  // Mempertahankan logika autentikasi
  useEffect(() => {
    const token =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('herclo_token') ||
      localStorage.getItem('token');
    if (!token) {
      const timer = setTimeout(() => router.replace('/login'), 0);
      return () => clearTimeout(timer);
    }

    api.get('/user')
      .then((res) => {
        const userData = res.data?.data ?? res.data?.user ?? res.data;
        if (userData?.role !== 'admin' && userData?.role !== 'super_admin') {
          router.replace('/dashboard');
          return;
        }
        setUser(userData);
      })
      .catch((err) => {
        console.error('Session invalid:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('herclo_token');
        localStorage.removeItem('herclo_user');
        localStorage.removeItem('token');
        router.replace('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  // Mempertahankan fungsi logout
  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('herclo_token');
      localStorage.removeItem('herclo_user');
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  const isActive = (path: string) => 
    pathname === path 
      ? 'bg-gray-900 text-white shadow-md' 
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900';

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <img src="/LOGO HERCLO5.png" alt="HERCLO Logo" className="h-16 w-auto object-contain animate-pulse mb-2" />
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-xs tracking-widest uppercase">Menyiapkan Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <ConfirmProvider>
      <div className="flex h-screen bg-[#F8F9FA] font-sans overflow-hidden text-gray-900">
      {/* Sidebar - Tampilan Modern & Clean */}
      <aside className={`bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50">
          <div className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
            <img src="/LOGO HERCLO5.png" alt="HERCLO Logo" className="h-10 w-auto object-contain" />
          </div>
          {!isSidebarOpen && (
            <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-lg text-white font-bold text-sm">H</div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-medium custom-scrollbar">
          
          <div className={`text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3 mt-2 px-3 ${!isSidebarOpen && 'hidden'}`}>Menu Utama</div>
          <Link href="/admin" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin')}`}>
            <span className="text-lg">📊</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Dashboard</span>
          </Link>
          <Link href="/admin/orders" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/orders')}`}>
            <span className="text-lg">📦</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Manajemen Order</span>
          </Link>
          <Link href="/admin/customers" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/customers')}`}>
            <span className="text-lg">👥</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Data Customer</span>
          </Link>
          
          <div className={`text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3 mt-8 px-3 ${!isSidebarOpen && 'hidden'}`}>Katalog & Produk</div>
          <Link href="/admin/products" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/products')}`}>
            <span className="text-lg">👕</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Produk</span>
          </Link>
          <Link href="/admin/scanner" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/scanner')}`}>
            <span className="text-lg">📷</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Scanner Stok</span>
          </Link>
          <Link href="/admin/categories" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/categories')}`}>
            <span className="text-lg">📁</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Kategori</span>
          </Link>
          
          <div className={`text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3 mt-8 px-3 ${!isSidebarOpen && 'hidden'}`}>Marketing & Promo</div>
          <Link href="/admin/banners" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/banners')}`}>
            <span className="text-lg">🖼️</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Banner</span>
          </Link>
          <Link href="/admin/vouchers" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/vouchers')}`}>
            <span className="text-lg">🎟️</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Voucher</span>
          </Link>
          <Link href="/admin/promos" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/promos')}`}>
            <span className="text-lg">🔥</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Promo</span>
          </Link>
          
          <div className={`text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3 mt-8 px-3 ${!isSidebarOpen && 'hidden'}`}>Operasional</div>
          <Link href="/admin/payments" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/payments')}`}>
            <span className="text-lg">💳</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Pembayaran</span>
          </Link>
          <Link href="/admin/shipping" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/shipping')}`}>
            <span className="text-lg">🚚</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Pengiriman</span>
          </Link>
          <Link href="/admin/marketplace" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/marketplace')}`}>
            <span className="text-lg">🔄</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Sinkron Marketplace</span>
          </Link>

          <div className={`text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3 mt-8 px-3 ${!isSidebarOpen && 'hidden'}`}>Konten & Laporan</div>
          <Link href="/admin/company-profile" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/company-profile')}`}>
            <span className="text-lg">🏢</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Profil Perusahaan</span>
          </Link>
          <Link href="/admin/gallery" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/gallery')}`}>
            <span className="text-lg">📸</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Galeri Foto</span>
          </Link>
          <Link href="/admin/articles" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/articles')}`}>
            <span className="text-lg">📝</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Artikel</span>
          </Link>
          <Link href="/admin/testimonials" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/testimonials')}`}>
            <span className="text-lg">⭐</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Testimoni</span>
          </Link>
          <Link href="/admin/team" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/team')}`}>
            <span className="text-lg">🧑‍🤝‍🧑</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Tim Kami</span>
          </Link>
          <Link href="/admin/reports" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/reports')}`}>
            <span className="text-lg">📈</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Laporan</span>
          </Link>
          
          <div className={`text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3 mt-8 px-3 ${!isSidebarOpen && 'hidden'}`}>Sistem</div>
          <Link href="/admin/settings" className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive('/admin/settings')}`}>
            <span className="text-lg">⚙️</span> <span className={!isSidebarOpen ? 'hidden' : ''}>Pengaturan</span>
          </Link>
        </div>

        <div className="p-5 border-t border-gray-100 bg-white">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-3 p-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-sm font-bold transition-all ${!isSidebarOpen && 'p-2'}`}
          >
            <span className="text-lg">🚪</span>
            <span className={!isSidebarOpen ? 'hidden' : ''}>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8F9FA] relative">
        {/* Navbar Atas dengan efek Glassmorphism */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-8 z-10 sticky top-0">
           <div className="flex items-center gap-4">
             <BackButton label="" className="!p-2" />
             <img src="/LOGO HERCLO5.png" alt="HERCLO Logo" className="h-8 w-auto object-contain hidden sm:block mr-2" />
             <div className="text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-sm">
               Admin Mode
             </div>
             <span className="text-sm text-gray-400 font-medium hidden sm:block">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
           </div>
           
           <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900">{user?.name || 'Administrator'}</span>
                <span className="text-xs text-gray-500 font-medium capitalize">{user?.role?.replace('_', ' ') || 'Admin Panel'}</span>
              </div>
              <div className="w-11 h-11 bg-gradient-to-tr from-gray-900 to-gray-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md ring-4 ring-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
           </div>
        </header>

        {/* Konten Halaman Dinamis */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
    </ConfirmProvider>
  );
}