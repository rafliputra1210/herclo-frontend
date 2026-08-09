'use client';

import { useEffect, useState } from 'react';
import api from '../lib/axios';
import Link from 'next/link';
import PublicHeader from './components/PublicHeader';

// --- Definisi Tipe Data ---
interface Product {
  id: number;
  name: string;
  price: string | number;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        // Gunakan Promise.allSettled agar satu endpoint gagal tidak memblokir yang lain
        const [prodRes, galRes, artRes, testRes, bannerRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/galleries'),
          api.get('/articles'),
          api.get('/testimonials'),
          api.get('/banners'),
        ]);

        if (prodRes.status === 'fulfilled') setProducts(prodRes.value.data.data ?? []);
        if (galRes.status === 'fulfilled') setGalleries(galRes.value.data.data ?? []);
        if (artRes.status === 'fulfilled') setArticles(artRes.value.data.data ?? []);
        if (testRes.status === 'fulfilled') {
          const featured = (testRes.value.data.data ?? []).filter((t: Testimonial) => t.is_featured);
          setTestimonials(featured);
        }
        if (bannerRes.status === 'fulfilled') {
          const active = (bannerRes.value.data.data ?? []).filter((b: Banner) => b.is_active);
          setBanners(active);
        }
      } catch (error) {
        console.error('Gagal mengambil data publik:', error);
      } finally {
        setLoading(false);
      }
    };
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
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* SHARED HEADER */}
      <PublicHeader />

      {/* HERO BANNER */}
      {banners.length > 0 ? (
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
                    className="mt-6 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors shadow-xl text-sm"
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
                    idx === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
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
            <a
              href="#koleksi"
              className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors text-sm"
            >
              Belanja Sekarang
            </a>
            <Link
              href="/gallery"
              className="px-8 py-3 border border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors text-sm"
            >
              Lihat Lookbook
            </Link>
          </div>
        </section>
      )}

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
              className="text-sm font-semibold text-black hover:underline underline-offset-4 shrink-0"
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
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                    <svg className="w-14 h-14 text-gray-300 group-hover:scale-110 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
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
                    <button className="w-full bg-black text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 active:scale-95 transition-all">
                      + Tambah Keranjang
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
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Lookbook</span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Galeri Inspirasi</h2>
                <p className="text-gray-500 mt-2">OOTD pilihan dari koleksi terkini HERCLO.</p>
              </div>
              <Link href="/gallery" className="text-sm font-semibold text-black hover:underline underline-offset-4 shrink-0">
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
              <Link href="/articles" className="text-sm font-semibold text-black hover:underline underline-offset-4 shrink-0">
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
                    <span className="text-xs font-bold text-black border-b border-black pb-0.5 hover:border-gray-400 hover:text-gray-400 transition-colors cursor-pointer">
                      Baca Selengkapnya →
                    </span>
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
                          <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">✓ Verified Buyer</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <Link
                    href="/testimonials"
                    className="inline-block border border-white/40 text-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all font-semibold text-sm"
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
              { href: '/gallery', label: 'Lookbook & Galeri', sub: 'Inspirasi OOTD terkini', color: 'from-emerald-500 to-teal-600', badge: 'Lookbook' },
              { href: '/articles', label: 'Blog Fashion', sub: 'Tips styling & tren terbaru', color: 'from-amber-500 to-orange-600', badge: 'Journal' },
              { href: '/testimonials', label: 'Testimoni Pelanggan', sub: 'Ulasan jujur dari pembeli', color: 'from-sky-500 to-blue-600', badge: 'Reviews' },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group relative bg-gradient-to-br ${card.color} text-white rounded-2xl p-8 flex flex-col justify-between h-44 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-4 translate-x-4" />
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full w-max text-white/90">
                  {card.badge}
                </span>
                <div className="relative z-10">
                  <h3 className="text-xl font-black leading-tight">{card.label}</h3>
                  <p className="text-white/80 text-sm mt-1 group-hover:text-white transition-colors">{card.sub} →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center">
        <Link href="/" className="text-2xl font-black tracking-tight text-gray-900">HERCLO.</Link>
        <p className="text-gray-400 text-sm mt-2 mb-6">Dailywear · Sportwear · Muslimwear</p>
        <div className="flex justify-center gap-6 text-sm font-semibold text-gray-500 mb-6">
          <Link href="/gallery" className="hover:text-black transition-colors">Lookbook</Link>
          <Link href="/articles" className="hover:text-black transition-colors">Blog</Link>
          <Link href="/testimonials" className="hover:text-black transition-colors">Testimoni</Link>
          <Link href="/login" className="hover:text-black transition-colors">Login</Link>
        </div>
        <p className="text-gray-300 text-xs">&copy; {new Date().getFullYear()} HERCLO Official. All rights reserved.</p>
      </footer>
    </main>
  );
}