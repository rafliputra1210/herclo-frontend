'use client';

import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { getAssetUrl } from '../lib/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicHeader from './components/PublicHeader';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- Definisi Tipe Data ---
interface Product { id: number; name: string; price: string | number; stock_quantity?: number; description?: string; image_path?: string; color?: string; category?: { name: string; }; }
interface Gallery { id: number; title: string; category: string; image_path: string; }
interface Article { id: number; title: string; slug: string; content: string; image_path?: string; created_at: string; }
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
    // Fast parallel fetch without blocking loading screen for too long
    Promise.allSettled([
      api.get('/products').then(res => setProducts(res.data?.data || res.data || [])),
      api.get('/banners').then(res => setBanners(res.data?.data || res.data || [])),
      api.get('/galleries').then(res => setGalleries(res.data?.data || res.data || [])),
      api.get('/articles').then(res => setArticles(res.data?.data || res.data || [])),
      api.get('/testimonials').then(res => setTestimonials(res.data?.data || res.data || [])),
    ]).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPublicData();
    // Safety timer cap: maksimal 1.5 detik loading langsung selesai
    const maxTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(maxTimer);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-5">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
          <img src="/LOGO HERCLO5.png" alt="HERCLO" className="h-12 md:h-16 w-auto object-contain animate-pulse mb-2" />
        </motion.div>
        <div className="w-7 h-7 border-2 border-white/20 border-t-lime-400 rounded-full animate-spin"></div>
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
              <img src={getAssetUrl(banner.image_path)} alt={banner.title} className="object-cover w-full h-full scale-105 transition-transform duration-10000" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
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
            Do MORE <br/> 
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
                      src={getAssetUrl(product.image_path)} 
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
              src={getAssetUrl(subBanners[0].image_path)} 
              alt={subBanners[0].title || "HERCLO Sub Banner"} 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
            />
          ) : (
            <img 
              src="/herclo_middle_banner.jpg" 
              alt="HERCLO Streetwear Banner" 
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
            />
          )}

          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-14">
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
                  <img src={getAssetUrl(img.image_path)} alt={img.title} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold text-sm md:text-base">{img.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
        {/* --- SECTION ARTIKEL / JOURNAL (3 GRID CARD) --- */}
        {articles.length > 0 && (
          <motion.section 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeUp} 
            className="pt-4"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 border-b border-gray-200 pb-4">
              <div>
                <span className="text-lime-600 text-xs font-black uppercase tracking-[0.3em] block mb-1">
                  HERCLO JOURNAL
                </span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-black">
                  Artikel & Tips Style<span className="text-lime-500">.</span>
                </h2>
              </div>
              <Link 
                href="/articles" 
                className="text-xs md:text-sm font-black text-gray-500 hover:text-black transition-colors uppercase tracking-widest mt-2 md:mt-0"
              >
                Lihat Semua Artikel ↗
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.slice(0, 3).map((article) => (
                <div 
                  key={article.id} 
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col group"
                >
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {article.image_path ? (
                      <img 
                        src={getAssetUrl(article.image_path)} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-2xl text-gray-300">
                        HERCLO
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                        {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className="text-lg font-black text-black mb-2 line-clamp-2 leading-snug group-hover:text-lime-600 transition-colors">
                        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                      </h3>
                      <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed mb-4">
                        {article.content}
                      </p>
                    </div>

                    <Link 
                      href={`/articles/${article.slug}`} 
                      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-black hover:text-lime-600 transition-colors"
                    >
                      <span>Baca Selengkapnya</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

      </div>

      {/* --- FOOTER ELEGAN & MODERN --- */}
      <footer className="bg-black text-white pt-16 pb-12 border-t-2 border-lime-400 mt-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-14">
            
            {/* Kolom 1: Brand Info & Sosmed */}
            <div className="space-y-4">
              <Link href="/">
                <img src="/LOGO HERCLO3.png" alt="HERCLO Logo" className="h-9 md:h-10 w-auto object-contain cursor-pointer" />
              </Link>
              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-normal max-w-sm">
                Mendefinisikan ulang batas kenyamanan dan gaya. Premium streetwear & daily wear untuk mereka yang berani tampil beda.
              </p>
            </div>

            {/* Kolom 2: Navigasi Utama */}
            <div>
              <h4 className="font-black text-lime-400 uppercase tracking-[0.2em] mb-5 text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block"></span>
                Navigasi Utama
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                <li><Link href="/#koleksi" className="hover:text-lime-400 transition-colors flex items-center gap-1.5"><span>›</span> Koleksi Terbaru</Link></li>
                <li><Link href="/collection" className="hover:text-lime-400 transition-colors flex items-center gap-1.5"><span>›</span> Katalog Lengkap</Link></li>
                <li><Link href="/gallery" className="hover:text-lime-400 transition-colors flex items-center gap-1.5"><span>›</span> Lookbook Galeri</Link></li>
                <li><Link href="/articles" className="hover:text-lime-400 transition-colors flex items-center gap-1.5"><span>›</span> Journal Blog</Link></li>
              </ul>
            </div>

            {/* Kolom 3: Layanan Pelanggan */}
            <div>
              <h4 className="font-black text-lime-400 uppercase tracking-[0.2em] mb-5 text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block"></span>
                Layanan Pelanggan
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                <li><Link href="/faq" className="hover:text-lime-400 transition-colors flex items-center gap-1.5"><span>›</span> Pertanyaan Umum (FAQ)</Link></li>
                <li><Link href="/contact" className="hover:text-lime-400 transition-colors flex items-center gap-1.5"><span>›</span> Hubungi Kami</Link></li>
                <li><Link href="/cart" className="hover:text-lime-400 transition-colors flex items-center gap-1.5"><span>›</span> Keranjang Belanja</Link></li>
                <li><Link href="/profile" className="hover:text-lime-400 transition-colors flex items-center gap-1.5"><span>›</span> Profil Perusahaan</Link></li>
              </ul>
            </div>

            {/* Kolom 4: Lokasi & Kontak */}
            <div>
              <h4 className="font-black text-lime-400 uppercase tracking-[0.2em] mb-5 text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 inline-block"></span>
                Lokasi & Kontak
              </h4>
              <ul className="space-y-3 text-xs text-zinc-400 font-normal">
                <li className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>Cakung, Jakarta Timur, Indonesia</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-lime-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <a href="mailto:hello@herclo.com" className="hover:text-lime-400 transition-colors">hello@herclo.com</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-lime-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span>+62 812-3456-7890</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar / Copyright */}
          <div className="border-t border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-[11px] font-bold tracking-widest uppercase text-center sm:text-left">
              &copy; {new Date().getFullYear()} HERCLO OFFICIAL. ALL RIGHTS RESERVED.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 hover:text-lime-400 transition-colors uppercase tracking-wider group cursor-pointer"
            >
              <span>Kembali Ke Atas</span>
              <span className="w-6 h-6 rounded-full bg-zinc-900 group-hover:bg-lime-400 group-hover:text-black border border-zinc-800 flex items-center justify-center text-lime-400 text-xs transition-all">↑</span>
            </button>
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
                      <img src={getAssetUrl(selectedProduct.image_path)} alt={selectedProduct.name} className="w-full h-full object-cover" />
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
                                ? 'bg-black text-lime-400 border-black shadow-sm' 
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <span className="w-3 h-3 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: trimmedColor.toLowerCase() }}></span>
                            {trimmedColor}
                          </button>
                        );
                      })
                    ) : (
                      <button type="button" className="px-4 h-11 bg-black text-lime-400 rounded-xl font-bold text-sm">
                        Standard
                      </button>
                    )}
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