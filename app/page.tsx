'use client';

import { useEffect, useState } from 'react';
import api from '../lib/axios';
import Link from 'next/link';
import PublicHeader from './components/PublicHeader';
import { useRouter } from 'next/navigation';

// --- Definisi Tipe Data ---
interface Product {
  id: number;
  name: string;
  price: string | number;
  image_path?: string;
  category?: { name: string; };
}

interface Gallery {
  id: number;
  title: string;
  category: string;
  image_path: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

interface Testimonial {
  id: number;
  customer_name: string;
  content: string;
  rating: number;
  is_featured: boolean;
}

interface Banner {
  id: number;
  title: string;
  image_path: string;
  link_url: string;
  is_active: boolean;
}

export default function Home() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  
  // --- State untuk Fitur Video Opening Dinamis ---
  const [useVideoOpening, setUseVideoOpening] = useState(false);

  // --- State untuk Modal Varian (Shopee-style) ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState({ size: 'M', color: 'Hitam', qty: 1 });

  // Fungsi buka popup
  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setVariant({ size: 'M', color: 'Hitam', qty: 1 }); // Default pilihan
  };

  // Fungsi Masukkan Keranjang / Beli Sekarang (Mode Guest / LocalStorage)
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

  const fetchPublicData = async () => {
    try {
      const [productsRes, galleriesRes, articlesRes, testimonialsRes, bannersRes, settingsRes] = await Promise.all([
        api.get('/products'),
        api.get('/galleries'),
        api.get('/articles'),
        api.get('/testimonials'),
        api.get('/banners'),
        api.get('/settings').catch(() => ({ data: { data: {} } })), // Mencegah error jika tabel settings belum dimigrasi
      ]);
      setProducts(productsRes.data?.data || productsRes.data || []);
      setGalleries(galleriesRes.data?.data || galleriesRes.data || []);
      setArticles(articlesRes.data?.data || articlesRes.data || []);
      setTestimonials(testimonialsRes.data?.data || testimonialsRes.data || []);
      setBanners(bannersRes.data?.data || bannersRes.data || []);
      
      // Menerapkan pengaturan video opening dari database Backend
      if (settingsRes?.data?.data?.use_video_opening === 'true') {
        setUseVideoOpening(true);
      } else {
        setUseVideoOpening(false);
      }
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
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans gap-4">
        <div className="text-3xl font-black tracking-tight text-gray-900">HERCLO.</div>
        <div className="w-8 h-8 border-4 border-gray-200 border-t-lime-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* SHARED HEADER */}
      <PublicHeader />

      {/* --- POPUP MODAL VARIAN --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 animate-slide-up relative">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border shrink-0">
                   {selectedProduct.image_path ? (
                     <img src={`http://127.0.0.1:8000${selectedProduct.image_path}`} alt={selectedProduct.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-[10px] text-gray-400">No Image</span>
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1 pr-6">{selectedProduct.name}</h3>
                  <p className="text-xl font-bold text-red-600">Rp {new Intl.NumberFormat('id-ID').format(Number(selectedProduct.price))}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none">&times;</button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Ukuran</label>
                <div className="flex gap-2 flex-wrap">
                  {['S', 'M', 'L', 'XL'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setVariant({...variant, size: s})} 
                      className={`px-4 py-1.5 border rounded-md text-sm font-medium transition-colors ${variant.size === s ? 'border-lime-500 text-black bg-lime-400' : 'border-gray-300 text-gray-600'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Warna</label>
                <div className="flex gap-2 flex-wrap">
                  {['Hitam', 'Putih', 'Navy'].map(c => (
                    <button 
                      key={c} 
                      onClick={() => setVariant({...variant, color: c})} 
                      className={`px-4 py-1.5 border rounded-md text-sm font-medium transition-colors ${variant.color === c ? 'border-lime-500 text-black bg-lime-400' : 'border-gray-300 text-gray-600'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center py-4 border-y border-gray-100 mt-2">
                <span className="font-semibold text-sm">Jumlah</span>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button onClick={() => setVariant({...variant, qty: Math.max(1, variant.qty - 1)})} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-lg leading-none">-</button>
                  <span className="px-4 text-sm font-medium border-x border-gray-300 py-1">{variant.qty}</span>
                  <button onClick={() => setVariant({...variant, qty: variant.qty + 1})} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-lg leading-none">+</button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => handleBuy(false)} 
                className="flex-1 bg-lime-400 text-black py-3 rounded-lg font-bold border-2 border-lime-400 hover:bg-lime-500 transition-colors"
              >
                + Keranjang
              </button>
              <button 
                onClick={() => handleBuy(true)} 
                className="flex-1 bg-black text-white py-3 rounded-lg font-bold border-2 border-black hover:bg-gray-800 transition-colors"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HERO SECTION DINAMIS (VIDEO ATAU BANNER) --- */}
      {useVideoOpening ? (
        
        /* OPSI 1: VIDEO OPENING */
        <section className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60">
            <source src="/herclo-opening.mp4" type="video/mp4" />
          </video>
          <div className="relative z-10 text-center text-white px-6">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 animate-fade-in-up">HERCLO.</h1>
            <p className="text-sm md:text-lg font-semibold tracking-[0.3em] uppercase text-gray-300 mb-10">Elevate Your Everyday Style</p>
            <a href="#koleksi" className="inline-block border-2 border-lime-400 text-lime-400 px-10 py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-lime-400 hover:text-black hover:border-lime-400 transition-all">
              Eksplorasi Koleksi
            </a>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-70">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </section>

      ) : (

        /* OPSI 2: BANNER SLIDER PROMOSI */
        banners.length > 0 ? (
          <section className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-gray-900">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={`http://127.0.0.1:8000${banner.image_path}`}
                  alt={banner.title || 'HERCLO Banner'}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center justify-center text-white text-center p-6">
                  {banner.title && (
                    <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-xl tracking-tight">
                      {banner.title}
                    </h2>
                  )}
                  {banner.link_url && (
                    <a
                      href={banner.link_url}
                      className="mt-6 px-8 py-3 bg-lime-400 text-black font-bold rounded-full hover:bg-lime-500 transition-colors shadow-xl text-sm"
                    >
                      Cek Sekarang →
                    </a>
                  )}
                </div>
              </div>
            ))}
            {banners.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBanner(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentBanner ? 'w-8 bg-lime-400' : 'w-2 bg-white/50 hover:bg-lime-400/80'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="bg-gray-900 text-white h-[60vh] md:h-[85vh] flex flex-col items-center justify-center text-center px-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Dailywear · Sportwear · Muslimwear
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
              Elevate Your Style.
            </h1>
            <p className="text-gray-300 md:text-lg max-w-xl mb-10 leading-relaxed">
              Temukan koleksi premium HERCLO — dibuat untuk tampil percaya diri setiap hari.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              <a href="#koleksi" className="px-8 py-3 bg-lime-400 text-black font-bold rounded-full hover:bg-lime-500 transition-colors text-sm shadow-lg">Belanja Sekarang</a>
              <Link href="/gallery" className="px-8 py-3 border border-white text-white font-bold rounded-full hover:border-lime-400 hover:text-lime-400 transition-colors text-sm">Lihat Lookbook</Link>
            </div>
          </section>
        )
      )}


      {/* --- TENTANG HERCLO (BRAND STORYTELLING) --- */}
      <section className="bg-white py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-[2px] bg-black"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Tentang Brand</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-gray-900">
              Mendefinisikan Ulang <br/> Kepercayaan Diri.
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              HERCLO bukan sekadar merek pakaian. Kami adalah manifestasi dari gaya hidup modern yang memadukan kenyamanan absolut dengan desain estetik yang tak lekang oleh waktu.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Diciptakan dengan ketelitian tingkat tinggi, setiap potongan kain dipilih untuk memastikan Anda tampil maksimal—baik untuk aktivitas harian, olahraga, maupun gaya santun.
            </p>
          </div>
          
          <div className="flex-1 relative">
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative z-10 border border-gray-200 shadow-xl">
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop" alt="HERCLO Studio" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-gray-900 rounded-2xl z-0 hidden md:block"></div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTIONS */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-28">

        {/* KOLEKSI PRODUK */}
        <section id="koleksi">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">New Arrivals</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Koleksi Terbaru</h2>
              <p className="text-gray-500 mt-2">Pilihan produk eksklusif dengan kualitas premium.</p>
            </div>
            <Link
              href="/gallery"
              className="text-sm font-semibold text-lime-600 hover:text-lime-500 hover:underline underline-offset-4 shrink-0"
            >
              Lihat Semua →
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100">
              Belum ada produk dalam katalog.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="h-64 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {product.image_path ? (
                      <img src={`http://127.0.0.1:8000${product.image_path}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <svg className="w-14 h-14 text-gray-300 group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <div className="p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {product.category?.name || 'Tanpa Kategori'}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mt-1 mb-1 truncate">{product.name}</h3>
                    <p className="font-black text-lg text-black mb-4">
                      Rp {new Intl.NumberFormat('id-ID').format(Number(product.price))}
                    </p>
                    <button
                      onClick={() => openModal(product)}
                      className="w-full bg-lime-400 text-black py-2.5 rounded-lg font-medium hover:bg-lime-500 transition-colors shadow-sm"
                    >
                      Beli / + Keranjang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        

        {/* LOOKBOOK GALERI PREVIEW */}
        {galleries.length > 0 && (
          <section id="galeri">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-lime-500">Lookbook</span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Galeri Inspirasi</h2>
                <p className="text-gray-500 mt-2">OOTD pilihan dari koleksi terkini HERCLO.</p>
              </div>
              <Link href="/gallery" className="text-sm font-semibold text-lime-600 hover:text-lime-500 hover:underline underline-offset-4 shrink-0">
                Lihat Semua Galeri →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleries.slice(0, 8).map((img) => (
                <div key={img.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-sm border border-gray-100">
                  <img
                    src={img.image_path.startsWith('http') ? img.image_path : `http://127.0.0.1:8000${img.image_path}`}
                    alt={img.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-white font-semibold text-sm leading-tight">{img.title}</p>
                    {img.category && (
                      <span className="text-[10px] text-white/70 mt-0.5">{img.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ARTIKEL TERBARU PREVIEW */}
        {articles.length > 0 && (
          <section id="artikel">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600">HERCLO Journal</span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Blog Fashion</h2>
                <p className="text-gray-500 mt-2">Tips styling, tren terkini, dan cerita di balik koleksi.</p>
              </div>
              <Link href="/articles" className="text-sm font-semibold text-lime-600 hover:text-lime-500 hover:underline underline-offset-4 shrink-0">
                Baca Semua Artikel →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.slice(0, 3).map((article) => (
                <div key={article.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="h-44 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                    <span className="text-4xl font-black text-amber-200">HERCLO</span>
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
                      {new Date(article.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                    <h3 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-gray-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4">{article.content}</p>
                    <Link href={`/articles/${article.slug}`} className="text-xs font-bold text-black border-b border-black pb-0.5 hover:border-gray-400 hover:text-gray-400 transition-colors">
                      Baca Selengkapnya →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TESTIMONI */}
        <section id="testimoni" className="bg-black text-white rounded-3xl p-10 md:p-16 overflow-hidden relative">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Reviews</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2 mb-2">Apa Kata Mereka?</h2>
              <p className="text-gray-400">Pengalaman nyata dari pelanggan HERCLO.</p>
            </div>

            {testimonials.length === 0 ? (
              <p className="text-center text-gray-500">Belum ada testimoni unggulan.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {testimonials.slice(0, 3).map((testi) => (
                    <div key={testi.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:border-white/30 transition-colors">
                      <div className="text-yellow-400 text-lg tracking-widest mb-3">
                        {renderStars(testi.rating)}
                      </div>
                      <p className="text-gray-300 italic mb-6 leading-relaxed text-sm">
                        &ldquo;{testi.content}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                        <div className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center font-black text-sm shrink-0">
                          {testi.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{testi.customer_name}</p>
                          <p className="text-[10px] text-lime-400 uppercase tracking-wider font-semibold">✓ Verified Buyer</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Link
                    href="/testimonials"
                    className="inline-block border border-lime-400 text-lime-400 px-8 py-3 rounded-full hover:bg-lime-400 hover:text-black transition-all font-semibold text-sm"
                  >
                    Lihat Semua Ulasan →
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* KATEGORI NAVIGASI */}
        <section id="jelajahi">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Explore</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Jelajahi HERCLO</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { href: '/gallery', label: 'Lookbook & Galeri', sub: 'Inspirasi OOTD terkini', color: 'from-lime-400 to-lime-600 text-black', badge: 'Lookbook', badgeColor: 'bg-black/20 text-black' },
              { href: '/articles', label: 'Blog Fashion', sub: 'Tips styling & tren terbaru', color: 'from-gray-800 to-black text-white', badge: 'Journal', badgeColor: 'bg-lime-400/20 text-lime-400' },
              { href: '/testimonials', label: 'Testimoni Pelanggan', sub: 'Ulasan jujur dari pembeli', color: 'from-gray-100 to-gray-200 text-gray-900', badge: 'Reviews', badgeColor: 'bg-lime-400/30 text-lime-700' },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group relative bg-gradient-to-br ${card.color} rounded-2xl p-8 flex flex-col justify-between h-44 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-4 translate-x-4" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${card.badgeColor} px-2.5 py-1 rounded-full w-max`}>
                  {card.badge}
                </span>
                <div className="relative z-10">
                  <h3 className="text-xl font-black leading-tight">{card.label}</h3>
                  <p className="opacity-80 text-sm mt-1 group-hover:opacity-100 transition-opacity">{card.sub} →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Kolom 1: Brand */}
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="text-3xl font-black tracking-tighter text-gray-900">HERCLO.</Link>
              <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                Mendefinisikan ulang kepercayaan diri Anda melalui koleksi Dailywear, Sportwear, dan Muslimwear premium.
              </p>
            </div>

            {/* Kolom 2: Eksplorasi */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Eksplorasi</h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li><Link href="/#koleksi" className="hover:text-black transition-colors">Koleksi Terbaru</Link></li>
                <li><Link href="/gallery" className="hover:text-black transition-colors">Lookbook Galeri</Link></li>
                <li><Link href="/articles" className="hover:text-black transition-colors">Journal & Blog</Link></li>
                <li><Link href="/testimonials" className="hover:text-black transition-colors">Testimoni Pelanggan</Link></li>
              </ul>
            </div>

            {/* Kolom 3: Bantuan */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Bantuan Layanan</h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li><Link href="/faq" className="hover:text-black transition-colors">Tanya Jawab (FAQ)</Link></li>
                <li><Link href="/contact" className="hover:text-black transition-colors">Hubungi Kami</Link></li>
                <li><Link href="/login" className="hover:text-black transition-colors">Lacak Pesanan</Link></li>
              </ul>
            </div>

            {/* Kolom 4: Kontak Cepat */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Kontak</h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li className="flex items-start gap-2">
                  <span>📍</span> Surabaya, Jawa Timur
                </li>
                <li className="flex items-start gap-2">
                  <span>✉️</span> hello@herclo.com
                </li>
                <li className="flex items-start gap-2">
                  <span>📞</span> +62 812-3456-7890
                </li>
              </ul>
            </div>
            
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs font-semibold">
              &copy; {new Date().getFullYear()} HERCLO Official. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
              <span className="hover:text-black cursor-pointer transition-colors">Instagram</span>
              <span className="hover:text-black cursor-pointer transition-colors">TikTok</span>
              <span className="hover:text-black cursor-pointer transition-colors">Shopee</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
