'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      router.push(`/collection?search=${encodeURIComponent(searchQuery)}`);
      setIsSidebarOpen(false); 
    }
  };

  return (
    <>
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors focus:outline-none"
            aria-label="Buka Menu Utama"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          
          <Link href="/" className="text-3xl font-black tracking-tight text-gray-900">HERCLO.</Link>
        </div>
        
        {/* Kolom Pencarian (Tampil di Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kaos, kemeja, dll..." 
            className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-5 pr-12 text-sm focus:ring-2 focus:ring-lime-400 outline-none transition-all"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-lime-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </form>

        <div className="flex items-center gap-5 text-sm font-semibold text-gray-600">
          <Link href="/collection" className="hover:text-lime-500 transition-colors hidden md:block">Koleksi</Link>
          <Link href="/articles" className="hover:text-lime-500 transition-colors hidden md:block">Journal</Link>
          <Link href="/faq" className="hover:text-lime-500 transition-colors hidden md:block">FAQ</Link>
          <Link href="/contact" className="hover:text-lime-500 transition-colors hidden md:block">Kontak</Link>
          <Link href="/cart" className="hover:text-lime-500 transition-colors text-xl hidden md:block">🛒</Link>
          <Link href="/login" className="px-5 py-2 bg-lime-400 text-black font-bold rounded-full hover:bg-lime-500 transition-colors hidden md:block shadow-sm">
            Login
          </Link>
        </div>
      </header>

      {/* --- SIDEBAR (SLIDING DRAWER) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col animate-slide-right">
            
            <div className="p-6 border-b flex justify-between items-center">
              <span className="text-2xl font-black tracking-tight">Menu Utama</span>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="text-gray-400 hover:text-black text-3xl leading-none font-bold"
              >
                &times;
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto flex flex-col">
              
              {/* FITUR SEARCH DI PALING ATAS SIDEBAR */}
              <div className="p-6 pb-2">
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk..." 
                    className="w-full bg-gray-100 border-none rounded-lg py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-lime-400 outline-none"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-lime-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                </form>
              </div>

              <div className="p-6 space-y-8">
                {/* Grup Toko */}
                <div className="space-y-5">
                  <div className="border-b border-gray-300 pb-2">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-wider">Toko</p>
                  </div>
                  <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 font-semibold text-gray-800 hover:text-lime-500 transition-colors">
                    <span className="text-xl">🏠</span> Beranda
                  </Link>
                  <Link href="/collection" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 font-semibold text-gray-800 hover:text-lime-500 transition-colors">
                    <span className="text-xl">👕</span> Koleksi Produk
                  </Link>
                  <Link href="/cart" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 font-semibold text-gray-800 hover:text-lime-500 transition-colors md:hidden">
                    <span className="text-xl">🛒</span> Keranjang Belanja
                  </Link>
                </div>
                
                {/* Grup Eksplorasi */}
                <div className="space-y-5">
                  <div className="border-b border-lime-400 pb-2">
                    <p className="text-sm font-black text-lime-600 uppercase tracking-wider">Eksplorasi HERCLO</p>
                  </div>
                  <Link href="/gallery" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 font-semibold text-gray-800 hover:text-lime-500 transition-colors">
                    <span className="text-xl">✨</span> Lookbook & Galeri
                  </Link>
                  <Link href="/articles" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 font-semibold text-gray-800 hover:text-lime-500 transition-colors">
                    <span className="text-xl">📰</span> Blog Fashion
                  </Link>
                  <Link href="/testimonials" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 font-semibold text-gray-800 hover:text-lime-500 transition-colors">
                    <span className="text-xl">⭐</span> Ulasan & Testimoni
                  </Link>
                </div>

                {/* Grup Bantuan */}
                <div className="space-y-5">
                  <div className="border-b border-gray-300 pb-2">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-wider">Bantuan</p>
                  </div>
                  <Link href="/faq" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 font-semibold text-gray-800 hover:text-lime-500 transition-colors">
                    <span className="text-xl">❓</span> FAQ
                  </Link>
                  <Link href="/contact" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 font-semibold text-gray-800 hover:text-lime-500 transition-colors">
                    <span className="text-xl">📞</span> Hubungi Kami
                  </Link>
                </div>
              </div>
            </nav>

            <div className="p-6 border-t bg-gray-50 space-y-3">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="w-full flex justify-center py-3 border-2 border-black text-black font-bold rounded-lg hover:bg-gray-100 transition-colors">
                Dashboard Saya
              </Link>
              <Link href="/login" onClick={() => setIsSidebarOpen(false)} className="w-full flex justify-center py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-500 transition-colors shadow-sm">
                Login / Register
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}