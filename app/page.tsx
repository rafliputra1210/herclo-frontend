'use client';

import { useEffect, useState } from 'react';
import api from '../lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicHeader from './components/PublicHeader';
import { motion, AnimatePresence, Variants } from 'framer-motion'; // Ditambahkan Variants untuk TS

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

// --- Definisi Tipe Data ---
interface Product { id: number; name: string; price: string | number; stock_quantity?: number; description?: string; image_path?: string; category?: { name: string; }; }
interface Gallery { id: number; title: string; category: string; image_path: string; }
interface Article { id: number; title: string; slug: string; content: string; created_at: string; }
interface Testimonial { id: number; customer_name: string; content: string; rating: number; is_featured: boolean; }
interface Banner { id: number; title: string; image_path: string; link_url: string; is_active: boolean; }

export default function Home() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  
  // State Interaksi
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState({ size: 'M', color: 'Hitam', qty: 1 });
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setVariant({ size: 'M', color: 'Hitam', qty: 1 });
  };

  const handleBuy = (isDirectBuy: boolean) => {
    if (!selectedProduct) return;
    try {
      const existingCart = JSON.parse(localStorage.getItem('herclo_cart') || '[]');
      const existingItemIndex = existingCart.findIndex((item: any) => 
        item.product.id === selectedProduct.id && item.size === variant.size && item.color === variant.color
      );
      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity += variant.qty;
      } else {
        existingCart.push({ id: Date.now() + Math.random(), product: selectedProduct, quantity: variant.qty, size: variant.size, color: variant.color });
      }
      localStorage.setItem('herclo_cart', JSON.stringify(existingCart));
      setSelectedProduct(null);
      
      if (isDirectBuy) router.push('/checkout');
      else alert('Berhasil dimasukkan ke keranjang!');
    } catch (error) {
      alert('Gagal menyimpan keranjang.');
    }
  };

  const fetchPublicData = async () => {
    try {
      const [productsRes, galleriesRes, articlesRes, testimonialsRes, bannersRes] = await Promise.all([
        api.get('/products'), api.get('/galleries'), api.get('/articles'), api.get('/testimonials'), api.get('/banners'),
      ]);
      setProducts(productsRes.data?.data || productsRes.data || []);
      setGalleries(galleriesRes.data?.data || galleriesRes.data || []);
      setArticles(articlesRes.data?.data || articlesRes.data || []);
      setTestimonials(testimonialsRes.data?.data || testimonialsRes.data || []);
      setBanners(bannersRes.data?.data || bannersRes.data || []);
    } catch (error) {
      console.error('Gagal memuat data publik:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => setCurrentBanner((prev) => (prev + 1) % banners.length), 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Animasi Scroll Variants dengan Tipe Data Variants untuk mengatasi error TypeScript
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-4xl font-black tracking-tighter text-black">HERCLO.</motion.div>
        <div className="w-10 h-10 border-4 border-gray-100 border-t-lime-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 selection:bg-lime-400 selection:text-black">
      
      {/* --- PUBLIC HEADER --- */}
      <PublicHeader />

      {/* --- HERO SECTION --- */}
      {banners.length > 0 ? (
        <section className="relative w-full h-[70vh] md:h-[90vh] overflow-hidden bg-black">
          {banners.map((banner, index) => (
            <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={`${BACKEND_URL}${banner.image_path}`} alt={banner.title} className="object-cover w-full h-full opacity-70" />
              {/* bg-linear-to-t disesuaikan dengan rekomendasi Tailwind v4 */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent flex flex-col items-center justify-center text-white text-center p-6">
                <motion.h2 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-none">
                  {banner.title}
                </motion.h2>
                {banner.link_url && (
                  <motion.a initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} href={banner.link_url} className="px-10 py-4 bg-lime-400 text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-colors shadow-[0_0_20px_rgba(163,230,53,0.4)] text-sm">
                    Eksplorasi Sekarang
                  </motion.a>
                )}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="bg-black text-white h-[70vh] md:h-[90vh] flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
          <div className="absolute w-[500px] h-[500px] bg-lime-400/20 rounded-full blur-[100px] -top-20 -left-20"></div>
          <span className="text-lime-400 text-xs font-bold uppercase tracking-[0.3em] mb-6 relative z-10">Premium Comfort</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none relative z-10">SHOW MORE <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-lime-400 to-white">BE MORE.</span></h1>
          <div className="flex gap-4 relative z-10">
            <a href="#koleksi" className="px-8 py-3 bg-lime-400 text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-colors text-xs">Belanja</a>
          </div>
        </section>
      )}

      {/* --- KONTEN GULIR (SCROLL ANIMATIONS) --- */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">

        {/* KOLEKSI PRODUK */}
        <motion.section id="koleksi" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-3 border-b border-gray-200 pb-4 md:pb-6">
            <div>
              <span className="text-lime-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">New Arrivals</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mt-1 md:mt-2 text-black">Koleksi Terbaru.</h2>
            </div>
            <Link href="/collection" className="text-xs md:text-sm font-bold text-gray-500 hover:text-lime-500 transition-colors uppercase tracking-widest">Lihat Semua ↗</Link>
          </div>

          {/* GRID PRODUK TERBATAS (4-8 PRODUK) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {products.slice(0, 8).map((product) => (
              <motion.div key={product.id} whileHover={{ y: -5 }} className="bg-white group cursor-pointer flex flex-col h-full">
                
                {/* TINGGI GAMBAR: h-48 di HP agar tidak terlalu panjang, h-80 di Desktop */}
                <div className="h-48 sm:h-64 md:h-80 bg-gray-100 relative overflow-hidden mb-2 md:mb-4 rounded-xl md:rounded-none">
                  {product.image_path ? (
                    <img src={`${BACKEND_URL}${product.image_path}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] md:text-xs">No Image</div>
                  )}
                  
                  {/* Overlay Button: Disembunyikan di layar sentuh (HP), Muncul saat di-hover di PC */}
                  <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                    <button onClick={() => openModal(product)} className="bg-lime-400 text-black px-6 py-3 font-black uppercase text-xs tracking-widest hover:bg-white transition-colors">Quick Add</button>
                  </div>
                </div>
                
                {/* KONTEN TEKS: Ukuran font dinamis & Line Clamp agar rapi */}
                <div className="px-1 md:px-0 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-400 line-clamp-1">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                    <span className={`text-[9px] md:text-[10px] font-bold ${
                      (product.stock_quantity ?? 0) > 0 ? 'text-gray-500' : 'text-red-500 font-black'
                    }`}>
                      {(product.stock_quantity ?? 0) > 0 ? `Stok: ${product.stock_quantity}` : 'Stok Habis'}
                    </span>
                  </div>
                  
                  {/* line-clamp-2 membuat judul maksimal 2 baris lalu ditambahkan titik-titik (...) */}
                  <h3 className="text-[13px] md:text-lg font-black text-black mt-1 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-2 flex flex-col gap-2">
                    <p className="font-black text-lime-600 md:text-gray-600 text-sm md:text-base">
                      Rp {new Intl.NumberFormat('id-ID').format(Number(product.price))}
                    </p>
                    
                    {/* Tombol Beli Mobile: Muncul khusus di HP karena efek hover tidak bekerja di layar sentuh */}
                    <button 
                      onClick={() => openModal(product)} 
                      disabled={(product.stock_quantity ?? 0) <= 0}
                      className={`md:hidden w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        (product.stock_quantity ?? 0) > 0
                          ? 'bg-black text-white active:bg-lime-400 active:text-black'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {(product.stock_quantity ?? 0) > 0 ? 'Beli' : 'Habis'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* TOMBOL UTAMA KE HALAMAN KOLEKSI LENGKAP */}
          <div className="mt-12 md:mt-16 text-center">
            <Link
              href="/collection"
              className="inline-flex items-center gap-3 px-8 md:px-12 py-4 bg-black text-white text-xs md:text-sm font-black uppercase tracking-widest rounded-full hover:bg-lime-400 hover:text-black transition-all duration-300 shadow-xl hover:shadow-lime-400/30 hover:scale-105 group"
            >
              <span>Eksplorasi Semua Koleksi</span>
              <span className="text-lime-400 group-hover:text-black transition-colors text-base">↗</span>
            </Link>
          </div>
        </motion.section>

        {/* LOOKBOOK GALERI */}
        {galleries.length > 0 && (
          <motion.section id="galeri" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-gray-50 -mx-6 px-6 py-24 md:-mx-20 md:px-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-black uppercase">Lookbook</h2>
              <p className="text-gray-500 mt-4 font-medium">Inspirasi gaya jalanan hingga gaya santun terkini.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleries.slice(0, 4).map((img) => (
                <div key={img.id} className="relative aspect-3/4 overflow-hidden group bg-gray-200">
                  <img src={img.image_path.startsWith('http') ? img.image_path : `${BACKEND_URL}${img.image_path}`} alt={img.title} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold text-lg">{img.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* FOOTER ELEGAN */}
      <footer className="bg-black text-white pt-24 pb-12 border-t-4 border-lime-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-white mb-6">HERCLO.</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Mendefinisikan ulang batas kenyamanan dan gaya. Premium streetwear & daily wear untuk mereka yang berani tampil beda.</p>
            </div>
            <div>
              <h4 className="font-bold text-lime-400 uppercase tracking-widest mb-6 text-xs">Navigasi</h4>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li><Link href="/#koleksi" className="hover:text-lime-400 transition-colors">Koleksi Terbaru</Link></li>
                <li><Link href="/gallery" className="hover:text-lime-400 transition-colors">Lookbook</Link></li>
                <li><Link href="/articles" className="hover:text-lime-400 transition-colors">Journal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lime-400 uppercase tracking-widest mb-6 text-xs">Kontak</h4>
              <ul className="space-y-3 text-sm text-gray-400 font-medium">
                <li>Surabaya, Indonesia</li>
                <li>hello@herclo.com</li>
                <li>+62 812-3456-7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">&copy; {new Date().getFullYear()} HERCLO. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <span className="hover:text-lime-400 cursor-pointer transition-colors">Instagram</span>
              <span className="hover:text-lime-400 cursor-pointer transition-colors">TikTok</span>
            </div>
          </div>
        </div>
      </footer>

      {/* --- POPUP MODAL VARIAN --- */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-100 flex items-end md:items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-white w-full max-w-md p-8 relative shadow-2xl">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-black hover:text-lime-500 font-black text-2xl">&times;</button>
              
              <div className="flex gap-6 mb-8 border-b border-gray-100 pb-6">
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                   {selectedProduct.image_path ? (
                     <img src={`${BACKEND_URL}${selectedProduct.image_path}`} alt={selectedProduct.name} className="w-full h-full object-cover" />
                   ) : (<span className="text-[10px] text-gray-400">No Image</span>)}
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1 text-black">{selectedProduct.name}</h3>
                  <p className="text-lg font-bold text-gray-500">Rp {new Intl.NumberFormat('id-ID').format(Number(selectedProduct.price))}</p>
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
                  <div className="flex gap-3">
                    {['S', 'M', 'L', 'XL'].map(s => (
                      <button key={s} onClick={() => setVariant({...variant, size: s})} className={`w-12 h-12 flex items-center justify-center font-bold text-sm transition-all ${variant.size === s ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Warna</label>
                  <div className="flex gap-3">
                    {['Hitam', 'Putih', 'Abu'].map(c => (
                      <button key={c} onClick={() => setVariant({...variant, color: c})} className={`px-4 h-12 flex items-center justify-center font-bold text-sm transition-all ${variant.color === c ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{c}</button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-gray-100 mt-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Jumlah</span>
                  <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
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
                  className={`flex-1 py-4 font-black uppercase text-xs tracking-widest transition-colors ${
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
                  className={`flex-1 py-4 font-black uppercase text-xs tracking-widest transition-colors ${
                    (selectedProduct.stock_quantity ?? 0) > 0 
                      ? 'bg-lime-400 text-black hover:bg-lime-500 shadow-[0_0_15px_rgba(163,230,53,0.5)]' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {(selectedProduct.stock_quantity ?? 0) > 0 ? 'Checkout' : 'Stok Habis'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}