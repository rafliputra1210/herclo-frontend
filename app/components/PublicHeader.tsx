'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import BackButton from './BackButton';

export default function PublicHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      router.push(`/collection?search=${encodeURIComponent(searchQuery)}`);
      setIsSidebarOpen(false); 
    }
  };

  return (
    <>
      <header className="bg-white border-b px-4 md:px-8 py-3 flex justify-between items-center sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3 md:gap-6">
          {pathname !== '/' && (
            <BackButton label="" className="p-2!" />
          )}
          
          {/* Tombol Hamburger (Khusus Mobile) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors focus:outline-none"
            aria-label="Buka Menu Utama"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          
          <Link href="/" className="flex items-center shrink-0">
            <img src="/LOGO HERCLO5.png" alt="HERCLO" className="h-9 md:h-10 w-auto object-contain" />
          </Link>
        </div>

        {/* METODE NAVIGASI LENGKAP PADA DESKTOP */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs lg:text-sm font-bold text-gray-700">
          <Link href="/" className={`hover:text-lime-500 transition-colors ${pathname === '/' ? 'text-black font-black underline underline-offset-4 decoration-lime-400' : ''}`}>Beranda</Link>
          <Link href="/collection" className={`hover:text-lime-500 transition-colors ${pathname === '/collection' ? 'text-black font-black underline underline-offset-4 decoration-lime-400' : ''}`}>Koleksi</Link>
          <Link href="/gallery" className={`hover:text-lime-500 transition-colors ${pathname === '/gallery' ? 'text-black font-black underline underline-offset-4 decoration-lime-400' : ''}`}>Lookbook</Link>
          <Link href="/articles" className={`hover:text-lime-500 transition-colors ${pathname.startsWith('/articles') ? 'text-black font-black underline underline-offset-4 decoration-lime-400' : ''}`}>Journal</Link>
          <Link href="/testimonials" className={`hover:text-lime-500 transition-colors ${pathname === '/testimonials' ? 'text-black font-black underline underline-offset-4 decoration-lime-400' : ''}`}>Testimoni</Link>
          <Link href="/faq" className={`hover:text-lime-500 transition-colors ${pathname === '/faq' ? 'text-black font-black underline underline-offset-4 decoration-lime-400' : ''}`}>FAQ</Link>
          <Link href="/contact" className={`hover:text-lime-500 transition-colors ${pathname === '/contact' ? 'text-black font-black underline underline-offset-4 decoration-lime-400' : ''}`}>Kontak</Link>
        </nav>
        
        {/* KOLOM PENCARIAN & FITUR KANAN DESKTOP */}
        <div className="flex items-center gap-3 lg:gap-4">
          <form onSubmit={handleSearch} className="hidden xl:flex relative w-48 lg:w-56">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari..." 
              className="w-full bg-gray-100 border-none rounded-full py-1.5 pl-4 pr-10 text-xs focus:ring-2 focus:ring-lime-400 outline-none transition-all"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-lime-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>

          <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative" title="Keranjang Belanja">
            <span className="text-lg">🛒</span>
          </Link>

          <Link href="/login" className="px-4 py-2 bg-lime-400 text-black font-black text-xs uppercase tracking-wider rounded-full hover:bg-lime-500 transition-colors shadow-xs">
            Login
          </Link>
        </div>
      </header>

      {/* --- SIDEBAR (SLIDING DRAWER) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-100 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <div className="relative w-80 bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-right text-slate-100 border-r border-slate-800">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div className="flex flex-col gap-1">
                <img src="/LOGO HERCLO5.png" alt="HERCLO" className="h-8 w-auto object-contain brightness-0 invert" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Menu Utama</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto flex flex-col py-4 custom-scrollbar">
              
              {/* FITUR SEARCH DI PALING ATAS SIDEBAR */}
              <div className="p-4 pb-2">
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk..." 
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-lime-400 outline-none text-white placeholder-slate-450 transition-all"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-lime-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                </form>
              </div>

              <div className="px-4 py-4 space-y-8">
                {/* Grup Toko */}
                <div className="space-y-2">
                  <div className="px-3 pb-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Toko</p>
                  </div>
                  <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200">
                    <svg className="w-5 h-5 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Beranda
                  </Link>
                  <Link href="/collection" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200">
                    <svg className="w-5 h-5 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    Koleksi Produk
                  </Link>
                  <Link href="/cart" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 md:hidden">
                    <svg className="w-5 h-5 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Keranjang Belanja
                  </Link>
                </div>
                
                {/* Grup Eksplorasi */}
                <div className="space-y-2">
                  <div className="px-3 pb-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eksplorasi HERCLO</p>
                  </div>
                  <Link href="/gallery" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200">
                    <svg className="w-5 h-5 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Lookbook & Galeri
                  </Link>
                  <Link href="/articles" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200">
                    <svg className="w-5 h-5 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                    Blog Fashion
                  </Link>
                  <Link href="/testimonials" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200">
                    <svg className="w-5 h-5 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    Ulasan & Testimoni
                  </Link>
                </div>

                {/* Grup Bantuan */}
                <div className="space-y-2">
                  <div className="px-3 pb-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bantuan</p>
                  </div>
                  <Link href="/faq" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200">
                    <svg className="w-5 h-5 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    FAQ
                  </Link>
                  <Link href="/contact" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200">
                    <svg className="w-5 h-5 text-slate-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    Hubungi Kami
                  </Link>
                </div>
              </div>
            </nav>

            <div className="p-6 border-t border-slate-800 bg-slate-950/90 space-y-3">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="w-full flex justify-center py-3 border border-slate-700 hover:border-white text-slate-200 hover:text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]">
                Dashboard Saya
              </Link>
              <Link href="/login" onClick={() => setIsSidebarOpen(false)} className="w-full flex justify-center py-3 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-500 transition-all shadow-md active:scale-[0.98]">
                Login / Register
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}