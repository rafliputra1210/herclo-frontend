'use client';

import { useEffect, useState } from 'react';
import api from '../lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicHeader from './components/PublicHeader';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

// --- Definisi Tipe Data ---
interface Product { id: number; name: string; price: string | number; stock_quantity?: number; description?: string; image_path?: string; category?: { name: string; }; }
interface Gallery { id: number; title: string; category: string; image_path: string; }
interface Article { id: number; title: string; slug: string; content: string; created_at: string; }
interface Testimonial { id: number; customer_name: string; content: string; rating: number; is_featured: boolean; }
interface Banner { id: number; title: string; image_path: string; link_url: string; is_active: boolean; type?: 'hero' | 'sub'; }

export default function Home() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  
  // State Interaksi
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState({ size: 'M', color: 'Hitam', qty: 1 });

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

  const heroBanners = banners.filter(b => (b.type || 'hero') === 'hero');
  const subBanners = banners.filter(b => b.type === 'sub');

  useEffect(() => {
    if (heroBanners.length > 1) {
      const interval = setInterval(() => setCurrentBanner((prev) => (prev + 1) % heroBanners.length), 5000);
      return () => clearInterval(interval);
    }
  }, [heroBanners.length]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    alert('Terima kasih! Voucher diskon 10% telah dikirimkan ke email Anda.');
    setEmailInput('');
  };

  // Animasi Scroll Variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-4xl font-black tracking-tighter text-white">
          HERCLO<span className="text-lime-400">.</span>
        </motion.div>
        <div className="w-8 h-8 border-2 border-white/20 border-t-lime-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 selection:bg-lime-400 selection:text-black">
      
      {/* --- PUBLIC HEADER --- */}
      <PublicHeader />

      {/* --- HERO SECTION (BANNER UTAMA SLIDER) --- */}
      {heroBanners.length > 0 ? (
        <section className="relative w-full h-[75vh] md:h-[92vh] overflow-hidden bg-black">
          {heroBanners.map((banner, index) => (
            <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={`${BACKEND_URL}${banner.image_path}`} alt={banner.title} className="object-cover w-full h-full opacity-65 scale-105 transition-transform duration-10000" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20 flex flex-col items-center justify-center text-white text-center px-6">
                <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-lime-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] rounded-full mb-6">
                  HERCLO Premium Apparel
                </span>
                
                <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl sm:text-7xl md:text-8xl font-black mb-6 tracking-tighter uppercase leading-none max-w-5xl">
                  {banner.title}
                </motion.h2>

                {banner.link_url && (
                  <motion.a 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ delay: 0.4 }} 
                    href={banner.link_url} 
                    className="px-10 py-4 bg-lime-400 text-black font-black uppercase tracking-widest rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_0_25px_rgba(163,230,53,0.5)] text-xs md:text-sm flex items-center gap-2"
                  >
                    <span>Eksplorasi Koleksi</span>
                    <span>↗</span>
                  </motion.a>
                )}
              </div>
            </div>
          ))}

          {/* Indicators dots jika banner > 1 */}
          {heroBanners.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
              {heroBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBanner(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentBanner ? 'w-10 bg-lime-400' : 'w-2 bg-white/40 hover:bg-white'}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="bg-black text-white h-[75vh] md:h-[92vh] flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
          <div className="absolute w-[600px] h-[600px] bg-lime-400/15 rounded-full blur-[120px] -top-20 -left-20 pointer-events-none"></div>
          <div className="absolute w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -bottom-20 -right-20 pointer-events-none"></div>
          
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-lime-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mb-6 relative z-10 rounded-full">
            Urban Streetwear Redefined
          </span>
          
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-none relative z-10 uppercase">
            SHOW MORE <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-white to-gray-400">
              BE MORE.
            </span>
          </h1>

          <div className="flex gap-4 relative z-10">
            <a 
              href="#koleksi" 
              className="px-10 py-4 bg-lime-400 text-black font-black uppercase tracking-widest rounded-full hover:bg-white hover:scale-105 transition-all text-xs shadow-[0_0_25px_rgba(163,230,53,0.4)]"
            >
              Belanja Sekarang ↗
            </a>
          </div>
        </section>
      )}

      {/* --- RUNNING MARQUEE TICKER BAR --- */}
      <div className="bg-black text-lime-400 py-3.5 border-y border-white/10 overflow-hidden select-none">
        <div className="flex whitespace-nowrap animate-marquee gap-8 font-black text-xs uppercase tracking-[0.25em]">
          <span>✦ FREE EXPRESS SHIPPING OVER RP 500K</span>
          <span>✦ 100% PREMIUM HEAVYWEIGHT COTTON</span>
          <span>✦ ORIGINAL HERCLO AUTHENTIC GUARANTEE</span>
          <span>✦ NEW SEASON ARRIVALS 2026</span>
          <span>✦ FREE EXPRESS SHIPPING OVER RP 500K</span>
          <span>✦ 100% PREMIUM HEAVYWEIGHT COTTON</span>
          <span>✦ ORIGINAL HERCLO AUTHENTIC GUARANTEE</span>
          <span>✦ NEW SEASON ARRIVALS 2026</span>
        </div>
      </div>

      {/* --- KONTEN UTAMA --- */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-12 md:space-y-16">

        {/* --- BRAND ADVANTAGES GRID (4 PILAR KEUNGGULAN) --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 border-b border-gray-100 pb-12">
          <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 hover:border-black/20 transition-all hover:shadow-md">
            <span className="text-2xl mb-3 block">🚚</span>
            <h4 className="font-black text-xs md:text-sm uppercase tracking-widest text-black mb-1">Pengiriman Kilat</h4>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">Proses cepat & kirim ke seluruh pelosok Indonesia.</p>
          </div>
          <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 hover:border-black/20 transition-all hover:shadow-md">
            <span className="text-2xl mb-3 block">🧵</span>
            <h4 className="font-black text-xs md:text-sm uppercase tracking-widest text-black mb-1">Bahan Premium 100%</h4>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">Katun heavyweight terbaik untuk kenyamanan maksimal.</p>
          </div>
          <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 hover:border-black/20 transition-all hover:shadow-md">
            <span className="text-2xl mb-3 block">🛡️</span>
            <h4 className="font-black text-xs md:text-sm uppercase tracking-widest text-black mb-1">Garansi Original</h4>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">100% Produk asli dan autentik Herclo Studio.</p>
          </div>
          <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 hover:border-black/20 transition-all hover:shadow-md">
            <span className="text-2xl mb-3 block">🔄</span>
            <h4 className="font-black text-xs md:text-sm uppercase tracking-widest text-black mb-1">Tukar Ukuran</h4>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">Garansi tukar size mudah jika kurang pas di badan.</p>
          </div>
        </motion.section>

        {/* --- KOLEKSI PRODUK TERBARU --- */}
        <motion.section id="koleksi" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-3 border-b border-gray-200 pb-4 md:pb-6">
            <div>
              <span className="text-lime-600 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
                New Arrivals 2026
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mt-1.5 text-black uppercase">
                Koleksi Terbaru<span className="text-lime-500">.</span>
              </h2>
            </div>
            <Link href="/collection" className="text-xs md:text-sm font-black text-gray-500 hover:text-black transition-colors uppercase tracking-widest border-b border-transparent hover:border-black pb-0.5 w-fit">
              Lihat Semua Koleksi ↗
            </Link>
          </div>

          {/* GRID PRODUK */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {products.slice(0, 8).map((product) => (
              <motion.div key={product.id} whileHover={{ y: -6 }} className="bg-white group cursor-pointer flex flex-col h-full rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                
                {/* CONTAINER GAMBAR PRODUK */}
                <div className="aspect-[3/4] w-full bg-gray-100 relative overflow-hidden">
                  {product.image_path ? (
                    <img 
                      src={`${BACKEND_URL}${product.image_path}`} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px] md:text-xs font-bold uppercase tracking-widest">No Image</div>
                  )}

                  {/* Badge Stok / Status */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="bg-black/80 backdrop-blur-md text-lime-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border border-lime-400/30">
                      {product.category?.name || 'Streetwear'}
                    </span>
                  </div>
                  
                  {/* Quick Add Overlay (PC) */}
                  <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 items-center justify-center p-4 backdrop-blur-[2px]">
                    <button 
                      onClick={() => openModal(product)} 
                      className="w-full bg-lime-400 text-black py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-colors shadow-lg"
                    >
                      + Quick Add
                    </button>
                  </div>
                </div>
                
                {/* TEKS DETAIL PRODUK */}
                <div className="p-4 flex-1 flex flex-col bg-white">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                      Herclo Official
                    </span>
                    <span className={`text-[9px] font-bold ${
                      (product.stock_quantity ?? 0) > 0 ? 'text-emerald-600' : 'text-red-500 font-black'
                    }`}>
                      {(product.stock_quantity ?? 0) > 0 ? `Stok: ${product.stock_quantity}` : 'Stok Habis'}
                    </span>
                  </div>
                  
                  <h3 className="text-sm md:text-base font-black text-black line-clamp-2 leading-tight group-hover:text-lime-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-3 flex flex-col gap-2 border-t border-gray-50">
                    <p className="font-black text-black text-sm md:text-base">
                      Rp {new Intl.NumberFormat('id-ID').format(Number(product.price))}
                    </p>
                    
                    {/* Tombol Beli Mobile */}
                    <button 
                      onClick={() => openModal(product)} 
                      disabled={(product.stock_quantity ?? 0) <= 0}
                      className={`md:hidden w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                        (product.stock_quantity ?? 0) > 0
                          ? 'bg-black text-lime-400 active:bg-lime-400 active:text-black'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {(product.stock_quantity ?? 0) > 0 ? 'Beli Sekarang' : 'Habis'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* TOMBOL UTAMA KE KATALOG */}
          <div className="mt-12 md:mt-16 text-center">
            <Link
              href="/collection"
              className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white text-xs md:text-sm font-black uppercase tracking-widest rounded-full hover:bg-lime-400 hover:text-black transition-all duration-300 shadow-xl hover:scale-105 group"
            >
              <span>Eksplorasi Semua Koleksi</span>
              <span className="text-lime-400 group-hover:text-black transition-colors text-base">↗</span>
            </Link>
          </div>
        </motion.section>

        {/* --- CARD ABU-ABU PROMO / SPECIAL HIGHLIGHT --- */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp}
          className="w-full bg-gradient-to-r from-gray-950 via-black to-gray-900 border border-white/10 rounded-2xl md:rounded-3xl p-8 md:p-14 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Glowing Accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block px-3.5 py-1 bg-lime-400 text-black text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full">
                ★ Special Highlight
              </span>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                Kenyamanan Maksimal, <br />
                <span className="text-lime-400">Gaya Tanpa Batas.</span>
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-400 font-medium leading-relaxed">
                Koleksi streetwear eksklusif HERCLO dirancang menggunakan bahan katun terunggul untuk daya tahan tinggi dan estetika modern sepanjang hari.
              </p>
            </div>

            <div className="shrink-0 pt-2 md:pt-0">
              <Link 
                href="/collection" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-lime-400 text-black hover:bg-white font-black text-xs uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(163,230,53,0.4)] hover:scale-105 group"
              >
                <span>Lihat Promo</span>
                <span className="transition-transform group-hover:translate-x-1">↗</span>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* --- SUB BANNER GAMBAR EKSKLUSIF (1280 x 420 px) --- */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-50px" }} 
          variants={fadeUp}
          className="w-full max-w-[1280px] h-64 sm:h-80 md:h-[420px] mx-auto relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group border border-white/10 bg-black"
        >
          {subBanners.length > 0 ? (
            <img 
              src={subBanners[0].image_path.startsWith('http') ? subBanners[0].image_path : `${BACKEND_URL}${subBanners[0].image_path}`} 
              alt={subBanners[0].title || "HERCLO Sub Banner"} 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90" 
            />
          ) : (
            <img 
              src="/herclo_middle_banner.jpg" 
              alt="HERCLO Streetwear Banner" 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 md:p-14">
            <span className="text-lime-400 text-xs font-black uppercase tracking-[0.3em] mb-2">HERCLO Campaign 2026</span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">
              {subBanners.length > 0 && subBanners[0].title ? subBanners[0].title : "Urban Streetwear Collection"}
            </h2>
            <div>
              <Link 
                href={subBanners.length > 0 && subBanners[0].link_url ? subBanners[0].link_url : "/collection"} 
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-lime-400 text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:scale-105"
              >
                <span>Jelajahi Sekarang</span>
                <span>↗</span>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* --- LOOKBOOK GALERI --- */}
        {galleries.length > 0 && (
          <motion.section id="galeri" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-gray-900 text-white rounded-3xl p-8 md:p-14 border border-white/10">
            <div className="text-center mb-12">
              <span className="text-lime-400 text-xs font-black uppercase tracking-[0.3em] mb-2 block">HERCLO Lookbook</span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Inspirasi Gaya.</h2>
              <p className="text-gray-400 mt-3 text-xs md:text-sm font-medium">Inspirasi gaya streetwear modern dan dailywear pilihan.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleries.slice(0, 4).map((img) => (
                <div key={img.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden group bg-gray-800 border border-white/10">
                  <img src={img.image_path.startsWith('http') ? img.image_path : `${BACKEND_URL}${img.image_path}`} alt={img.title} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold text-sm md:text-base">{img.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* --- NEWSLETTER INSIDER SECTION --- */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-black text-white rounded-3xl p-8 md:p-14 text-center relative overflow-hidden border border-white/10">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-lime-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <span className="text-lime-400 text-xs font-black uppercase tracking-[0.3em] mb-3 block">HERCLO Insider</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">
            Dapatkan Voucher Diskon 10%
          </h2>
          <p className="text-gray-400 text-xs md:text-sm font-medium max-w-xl mx-auto mb-8">
            Daftarkan email Anda untuk mendapatkan kabar rilis produk terbatas, promo eksklusif, dan penawaran khusus Herclo.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Masukkan alamat email Anda..." 
              required
              className="flex-1 bg-white/10 border border-white/20 px-5 py-3.5 rounded-full text-xs font-medium focus:outline-none focus:border-lime-400 text-white placeholder:text-gray-500"
            />
            <button 
              type="submit"
              className="px-8 py-3.5 bg-lime-400 text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-white transition-all shadow-md shrink-0"
            >
              Langganan
            </button>
          </form>
        </motion.section>

      </div>

      {/* --- FOOTER ELEGAN --- */}
      <footer className="bg-black text-white pt-20 pb-12 border-t-4 border-lime-400 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-white mb-4">HERCLO<span className="text-lime-400">.</span></h2>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-medium">
                Mendefinisikan ulang batas kenyamanan dan gaya. Premium streetwear & daily wear untuk mereka yang berani tampil beda.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lime-400 uppercase tracking-widest mb-6 text-xs">Navigasi Utama</h4>
              <ul className="space-y-3 text-xs text-gray-400 font-bold uppercase tracking-wider">
                <li><Link href="/#koleksi" className="hover:text-lime-400 transition-colors">Koleksi Terbaru</Link></li>
                <li><Link href="/collection" className="hover:text-lime-400 transition-colors">Katalog Lengkap</Link></li>
                <li><Link href="/gallery" className="hover:text-lime-400 transition-colors">Lookbook Galeri</Link></li>
                <li><Link href="/articles" className="hover:text-lime-400 transition-colors">Journal Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lime-400 uppercase tracking-widest mb-6 text-xs">Layanan Pelanggan</h4>
              <ul className="space-y-3 text-xs text-gray-400 font-bold uppercase tracking-wider">
                <li><Link href="/faq" className="hover:text-lime-400 transition-colors">Pertanyaan Umum (FAQ)</Link></li>
                <li><Link href="/contact" className="hover:text-lime-400 transition-colors">Hubungi Kami</Link></li>
                <li><Link href="/cart" className="hover:text-lime-400 transition-colors">Keranjang Belanja</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lime-400 uppercase tracking-widest mb-6 text-xs">Lokasi & Kontak</h4>
              <ul className="space-y-3 text-xs text-gray-400 font-medium">
                <li>📍 Surabaya, Jawa Timur, Indonesia</li>
                <li>✉️ hello@herclo.co.id</li>
                <li>📞 +62 812-3456-7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">&copy; {new Date().getFullYear()} HERCLO STUDIO. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <span className="hover:text-lime-400 cursor-pointer transition-colors">Instagram</span>
              <span className="hover:text-lime-400 cursor-pointer transition-colors">TikTok</span>
              <span className="hover:text-lime-400 cursor-pointer transition-colors">WhatsApp</span>
            </div>
          </div>
        </div>
      </footer>

      {/* --- POPUP MODAL VARIAN --- */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-100 flex items-end md:items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="bg-white w-full max-w-md p-8 relative rounded-3xl shadow-2xl border border-gray-100">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-black hover:text-lime-500 font-black text-2xl">&times;</button>
              
              <div className="flex gap-6 mb-8 border-b border-gray-100 pb-6">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                   {selectedProduct.image_path ? (
                     <img src={`${BACKEND_URL}${selectedProduct.image_path}`} alt={selectedProduct.name} className="w-full h-full object-cover" />
                   ) : (<span className="text-[10px] text-gray-400 flex items-center justify-center h-full">No Image</span>)}
                </div>
                <div>
                  <h3 className="font-black text-xl mb-1 text-black leading-tight line-clamp-2">{selectedProduct.name}</h3>
                  <p className="text-lg font-bold text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(Number(selectedProduct.price))}</p>
                  <p className={`text-xs font-bold mt-1 ${ (selectedProduct.stock_quantity ?? 0) > 0 ? 'text-emerald-600' : 'text-red-500 font-black' }`}>
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
                      <button key={s} onClick={() => setVariant({...variant, size: s})} className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${variant.size === s ? 'bg-black text-lime-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Warna</label>
                  <div className="flex gap-3">
                    {['Hitam', 'Putih', 'Abu'].map(c => (
                      <button key={c} onClick={() => setVariant({...variant, color: c})} className={`px-5 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${variant.color === c ? 'bg-black text-lime-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{c}</button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-t border-gray-100 mt-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Jumlah</span>
                  <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
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
                  className={`flex-1 py-4 font-black uppercase text-xs tracking-widest rounded-xl transition-colors ${
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
                  className={`flex-1 py-4 font-black uppercase text-xs tracking-widest rounded-xl transition-colors ${
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