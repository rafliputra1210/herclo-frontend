'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/axios';
import { getAssetUrl } from '../../lib/config';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import PublicHeader from '../components/PublicHeader';

interface Category { id: number; name: string; }
interface Product { id: number; name: string; price: number; stock_quantity?: number; description?: string; image_path?: string; color?: string; category?: { name: string; }; }

function CollectionContent() {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState({ size: 'M', color: 'Hitam', qty: 1 });

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setVariant({ size: 'M', color: product.color || 'Hitam', qty: 1 });
  };

  const handleBuy = (isDirectBuy: boolean) => {
    if (!selectedProduct) return;
    try {
      const existingCart = JSON.parse(localStorage.getItem('herclo_cart') || '[]');
      
      const existingItemIndex = existingCart.findIndex((item: any) => 
        item.product.id === selectedProduct.id && 
        item.size === variant.size && 
        item.color === variant.color
      );

      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity += variant.qty;
      } else {
        existingCart.push({
          id: Date.now() + Math.random(),
          product: selectedProduct,
          quantity: variant.qty,
          size: variant.size,
          color: variant.color
        });
      }

      localStorage.setItem('herclo_cart', JSON.stringify(existingCart));
      setSelectedProduct(null);
      if (isDirectBuy) {
        router.push('/checkout');
      } else {
        alert('Berhasil dimasukkan ke keranjang!');
      }
    } catch (error) {
      alert('Gagal menyimpan keranjang ke browser.');
    }
  };

  // State untuk Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>(''); // price_asc, price_desc

  // Mengambil daftar Kategori untuk sidebar
  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data)).catch(console.error);
  }, []);

  // Mengambil produk berdasarkan filter
  useEffect(() => {
    setLoading(true);
    let endpoint = `/products?search=${searchKeyword}`;
    if (selectedCategory) endpoint += `&category_id=${selectedCategory}`;
    if (sortOrder) endpoint += `&sort=${sortOrder}`;

    const maxTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    api.get(endpoint)
      .then(res => setProducts(res.data.data))
      .catch(console.error)
      .finally(() => {
        clearTimeout(maxTimer);
        setLoading(false);
      });

    return () => clearTimeout(maxTimer);
  }, [searchKeyword, selectedCategory, sortOrder]);

  // Animasi Framer Motion
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 selection:bg-lime-400 selection:text-black">
      <PublicHeader />

      {/* --- HERO SECTION KATALOG --- */}
      <section className="bg-black text-white py-16 md:py-24 px-6 text-center border-b-4 border-lime-400">
        <span className="text-lime-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
          HERCLO. Archive
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">
          {searchKeyword ? `HASIL: ${searchKeyword}` : 'Koleksi Lengkap.'}
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl mx-auto">
          Temukan produk premium yang dirancang untuk mendefinisikan ulang gaya harian Anda.
        </p>
      </section>

      {/* --- POPUP MODAL VARIAN (Premium Edgy Style) --- */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-100 flex items-end md:items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-white w-full max-w-md p-8 relative shadow-2xl">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-black hover:text-lime-500 font-black text-2xl">&times;</button>
              
              <div className="flex gap-6 mb-8 border-b border-gray-100 pb-6">
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                    {selectedProduct.image_path ? (
                      <img src={getAssetUrl(selectedProduct.image_path)} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (<span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">No Image</span>)}
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1 text-black leading-tight line-clamp-2">{selectedProduct.name}</h3>
                  <p className="text-lg font-bold text-gray-500 mt-2">Rp {new Intl.NumberFormat('id-ID').format(Number(selectedProduct.price))}</p>
                  <p className={`text-xs font-bold mt-1 ${ (selectedProduct.stock_quantity ?? 0) > 0 ? 'text-lime-600' : 'text-red-500 font-black' }`}>
                    {(selectedProduct.stock_quantity ?? 0) > 0 ? `Stok Tersedia: ${selectedProduct.stock_quantity} pcs` : 'Stok Habis'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                {selectedProduct.description && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Deskripsi Produk</label>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 max-h-28 overflow-y-auto">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Ukuran</label>
                  <div className="flex gap-3 flex-wrap">
                    {['S', 'M', 'L', 'XL'].map(s => (
                      <button key={s} onClick={() => setVariant({...variant, size: s})} className={`w-12 h-12 flex items-center justify-center font-bold text-sm transition-all ${variant.size === s ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Warna</label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProduct.color ? (
                      selectedProduct.color.split(',').map((c: string) => {
                        const trimmedColor = c.trim();
                        if (!trimmedColor) return null;
                        const isSelected = variant.color === trimmedColor;
                        return (
                          <button 
                            key={trimmedColor} 
                            type="button"
                            onClick={() => setVariant({ ...variant, color: trimmedColor })} 
                            className={`px-4 h-11 rounded-xl flex items-center gap-2 font-bold text-sm transition-all border ${
                              isSelected 
                                ? 'bg-black text-white border-black shadow-sm' 
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: trimmedColor.toLowerCase() }}></span>
                            {trimmedColor}
                          </button>
                        );
                      })
                    ) : (
                      <button type="button" className="px-4 h-11 bg-black text-white rounded-xl font-bold text-sm">
                        Standard
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-4 border-t border-gray-100 mt-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Jumlah</span>
                  <div className="flex items-center bg-gray-100">
                    <button 
                      onClick={() => setVariant({...variant, qty: Math.max(1, variant.qty - 1)})} 
                      disabled={(selectedProduct.stock_quantity ?? 0) <= 0}
                      className="w-10 h-10 flex items-center justify-center font-black hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-sm">{variant.qty}</span>
                    <button 
                      onClick={() => setVariant({...variant, qty: Math.min(selectedProduct.stock_quantity ?? 1, variant.qty + 1)})} 
                      disabled={(selectedProduct.stock_quantity ?? 0) <= 0 || variant.qty >= (selectedProduct.stock_quantity ?? 1)}
                      className="w-10 h-10 flex items-center justify-center font-black hover:bg-gray-200 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => handleBuy(false)} 
                  disabled={(selectedProduct.stock_quantity ?? 0) <= 0}
                  className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest transition-colors ${
                    (selectedProduct.stock_quantity ?? 0) > 0 
                      ? 'bg-gray-100 text-black hover:bg-gray-200' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  + Keranjang
                </button>
                <button 
                  onClick={() => handleBuy(true)} 
                  disabled={(selectedProduct.stock_quantity ?? 0) <= 0}
                  className={`flex-1 py-4 font-black uppercase text-[10px] tracking-widest transition-colors ${
                    (selectedProduct.stock_quantity ?? 0) > 0 
                      ? 'bg-lime-400 text-black hover:bg-lime-500 shadow-[0_0_15px_rgba(163,230,53,0.5)]' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {(selectedProduct.stock_quantity ?? 0) > 0 ? 'Beli Sekarang' : 'Stok Habis'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        
        {/* --- SIDEBAR FILTER (Edgy Style) --- */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          
          {/* BOX KATEGORI */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-black">
              <span className="font-black text-xs text-black uppercase tracking-widest">Filter Kategori</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <button 
                onClick={() => setSelectedCategory('')}
                className={`flex items-center text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedCategory === '' 
                    ? 'bg-black text-lime-400' 
                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <span className="flex-1">Semua Produk</span>
                {selectedCategory === '' && <span className="text-lime-400">●</span>}
              </button>

              {categories.map(cat => {
                const isSelected = selectedCategory === String(cat.id);
                return (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(String(cat.id))}
                    className={`flex items-center text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                      isSelected 
                        ? 'bg-black text-lime-400' 
                        : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <span className="flex-1">{cat.name}</span>
                    {isSelected && <span className="text-lime-400">●</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BOX URUTKAN */}
          <div>
            <div className="flex items-center gap-3 mb-6 pb-2 border-b-2 border-black">
              <span className="font-black text-xs text-black uppercase tracking-widest">Urutkan</span>
            </div>

            <div className="space-y-1.5">
              {[
                { value: '', label: 'Terbaru' },
                { value: 'price_asc', label: 'Termurah' },
                { value: 'price_desc', label: 'Termahal' },
              ].map(sort => {
                const isSelected = sortOrder === sort.value;
                return (
                  <button
                    key={sort.value}
                    onClick={() => setSortOrder(sort.value)}
                    className={`w-full flex items-center px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                      isSelected 
                        ? 'bg-lime-400 text-black' 
                        : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <span className="flex-1 text-left">{sort.label}</span>
                    {isSelected && <span className="text-black font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* --- DAFTAR PRODUK --- */}
        <section className="flex-1">
          <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl md:text-3xl font-black tracking-tighter text-black uppercase">
              Katalog <span className="text-gray-400">({products.length})</span>
            </h2>
          </div>

          {/* QUICK CATEGORY PILLS (KHUSUS TAMPILAN MOBILE) */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-6 mb-4 no-scrollbar -mx-6 px-6">
            <button 
              onClick={() => setSelectedCategory('')}
              className={`shrink-0 px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === '' ? 'bg-black text-lime-400' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`shrink-0 px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === String(cat.id) ? 'bg-black text-lime-400' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* GRID KONTEN PRODUK */}
          {loading ? (
             <div className="flex flex-col justify-center items-center py-24 gap-4">
               <img src="/LOGO HERCLO5.png" alt="HERCLO" className="h-10 w-auto object-contain animate-pulse mb-1 brightness-0" />
               <div className="w-8 h-8 border-3 border-gray-100 border-t-black rounded-full animate-spin"></div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mengambil Data Katalog...</span>
             </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 bg-gray-50 border border-gray-100">
              <span className="text-4xl mb-4 block">🏴</span>
              <h3 className="font-black text-lg uppercase tracking-widest mb-2">Tidak Ditemukan</h3>
              <p className="text-gray-500 text-sm font-medium">Gunakan kata kunci atau filter yang berbeda.</p>
            </div>
          ) : (
            
            /* PERBAIKAN UTAMA: grid-cols-2 untuk Smartphone, gap responsif */
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
            >
              <AnimatePresence>
                {products.map((product) => (
                  <motion.div 
                    key={product.id} 
                    variants={itemVariant}
                    layout
                    whileHover={{ y: -5 }} 
                    className="bg-white group cursor-pointer flex flex-col h-full border border-transparent hover:border-gray-100 transition-colors"
                  >
                    
                    {/* TINGGI GAMBAR: aspect-[3/4] agar gambar memanjang & tidak terlalu lebar */}
                    <div className="aspect-[3/4] w-full bg-gray-100 relative overflow-hidden mb-3">
                      {product.image_path ? (
                        <img src={getAssetUrl(product.image_path)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] uppercase font-bold tracking-widest">No Image</div>
                      )}
                      
                      {/* Overlay Button: Disembunyikan di HP, Muncul di PC (Hover) */}
                      <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                        <button onClick={() => openModal(product)} className="bg-lime-400 text-black px-6 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-colors">Quick Add</button>
                      </div>
                    </div>
                    
                    {/* KONTEN TEKS & HARGA */}
                    <div className="px-1 md:px-2 flex-1 flex flex-col pb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 line-clamp-1">
                          {product.category?.name || 'Katalog'}
                        </span>
                        <span className={`text-[9px] md:text-[10px] font-bold ${
                          (product.stock_quantity ?? 0) > 0 ? 'text-gray-500' : 'text-red-500 font-black'
                        }`}>
                          {(product.stock_quantity ?? 0) > 0 ? `Stok: ${product.stock_quantity}` : 'Habis'}
                        </span>
                      </div>
                      
                      {/* line-clamp-2 membuat judul max 2 baris lalu titik-titik */}
                      <h3 className="text-[12px] md:text-base font-black text-black mt-1 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>

                      {product.color && (
                        <p className="text-[10px] md:text-xs text-gray-500 font-bold mt-1 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block shrink-0 shadow-xs" style={{ backgroundColor: product.color.toLowerCase() }}></span>
                          <span className="truncate">{product.color}</span>
                        </p>
                      )}
                      
                      <div className="mt-auto pt-2 flex flex-col gap-2">
                        <p className="font-black text-lime-600 md:text-gray-500 text-[13px] md:text-base">
                          Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                        </p>
                        
                        {/* Tombol Beli Mobile: Muncul hanya di HP karena HP tidak ada efek Hover */}
                        <button 
                          onClick={() => openModal(product)} 
                          disabled={(product.stock_quantity ?? 0) <= 0}
                          className={`md:hidden w-full py-2.5 rounded-none text-[9px] font-black uppercase tracking-widest transition-colors ${
                            (product.stock_quantity ?? 0) > 0
                              ? 'bg-black text-white active:bg-lime-400 active:text-black'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {(product.stock_quantity ?? 0) > 0 ? 'Beli / Opsi' : 'Stok Habis'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
      
      {/* --- FOOTER --- */}
      <footer className="bg-black text-white py-12 border-t-2 border-lime-400 text-center mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/" className="inline-block">
            <img src="/LOGO HERCLO3.png" alt="HERCLO Logo" className="h-9 md:h-10 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mt-4">
            &copy; {new Date().getFullYear()} HERCLO OFFICIAL. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-gray-800 border-t-lime-400 rounded-full animate-spin"></div>
      </div>
    }>
      <CollectionContent />
    </Suspense>
  );
}