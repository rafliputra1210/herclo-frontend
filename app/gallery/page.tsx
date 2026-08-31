'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { getAssetUrl } from '../../lib/config';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import PublicHeader from '../components/PublicHeader';

interface Gallery {
  id: number;
  title: string;
  category: string;
  image_path: string;
}

export default function PublicGallery() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  
  // State untuk Lightbox (Pop-up Gambar Full Screen)
  const [selectedImage, setSelectedImage] = useState<Gallery | null>(null);

  useEffect(() => {
    api
      .get('/galleries')
      .then((res) => setGalleries(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Semua', ...Array.from(new Set(galleries.map((g) => g.category).filter(Boolean)))];

  const filtered = activeCategory === 'Semua'
    ? galleries
    : galleries.filter((g) => g.category === activeCategory);

  // Animasi Framer Motion untuk grid
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 selection:bg-lime-400 selection:text-black">
      <PublicHeader />

      {/* --- HERO SECTION --- */}
      <section className="relative bg-black text-white py-24 md:py-32 px-6 text-center overflow-hidden border-b-4 border-lime-400">
        <div className="absolute w-[400px] h-[400px] bg-lime-400/10 rounded-full blur-[80px] -top-20 right-0 md:right-1/4 pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-lime-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
            Visual & OOTD
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">
            Lookbook.
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">
            Eksplorasi gaya tanpa batas. Dari *photoshoot* studio hingga momen *streetwear* di luar ruangan, temukan inspirasi gaya terbaik Anda bersama HERCLO.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        
        {/* --- TABS KATEGORI --- */}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-black text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)] scale-105'
                    : 'bg-gray-100 text-gray-500 hover:bg-lime-400 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* --- AREA KONTEN (LOADING, EMPTY, ATAU GRID) --- */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-lime-400 rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Memuat Lookbook...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-50 p-16 rounded-2xl border border-gray-200 text-center text-gray-500 max-w-lg mx-auto">
            <span className="block text-4xl mb-4">📸</span>
            <p className="font-bold tracking-wide uppercase text-sm">
              {activeCategory === 'Semua' ? 'Galeri belum tersedia.' : `Belum ada foto untuk "${activeCategory}".`}
            </p>
          </div>
        ) : (
          /* MASONRY GRID DENGAN ANIMASI */
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
          >
            <AnimatePresence>
              {filtered.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  variants={itemVariant}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedImage(img)}
                  className="break-inside-avoid relative rounded-2xl overflow-hidden group bg-gray-100 cursor-pointer"
                >
                  <img 
                    src={getAssetUrl(img.image_path)}
                    alt={img.title} 
                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    {img.category && (
                      <span className="inline-block px-3 py-1 bg-lime-400 text-black text-[10px] uppercase font-black tracking-widest mb-3 w-max">
                        {img.category}
                      </span>
                    )}
                    <p className="text-white font-bold text-lg leading-tight translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.title}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-black text-white py-12 border-t-2 border-lime-400 text-center">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/" className="inline-block">
            <img src="/LOGO HERCLO3.png" alt="HERCLO Logo" className="h-9 md:h-10 w-auto object-contain mx-auto" />
          </Link>
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mt-4">
            &copy; {new Date().getFullYear()} HERCLO OFFICIAL. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      {/* --- LIGHTBOX (MODAL FULL SCREEN) --- */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-md"
          >
            {/* Tombol Tutup */}
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white hover:text-lime-400 font-black text-4xl z-50 transition-colors"
            >
              &times;
            </button>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-full flex flex-col items-center"
            >
              <img 
                src={getAssetUrl(selectedImage.image_path)} 
                alt={selectedImage.title} 
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="mt-6 text-center">
                <span className="text-lime-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  {selectedImage.category || 'Lookbook'}
                </span>
                <h3 className="text-white text-2xl font-black mt-2">{selectedImage.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}