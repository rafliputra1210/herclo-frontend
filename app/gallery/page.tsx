'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import Link from 'next/link';
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <PublicHeader />

      {/* Page Hero */}
      <div className="bg-black text-white py-16 md:py-24 px-6 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800 inline-block mb-4">
          Lookbook &amp; Visuals
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Galeri Foto HERCLO</h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Eksplorasi gaya tanpa batas — dari photoshoot studio hingga momen outdoor, temukan inspirasi OOTD terbaik Anda.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Filter Tabs */}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeCategory === cat
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-14 rounded-2xl border border-gray-100 text-center text-gray-400 max-w-md mx-auto">
            {activeCategory === 'Semua' ? 'Galeri masih kosong.' : `Tidak ada foto untuk kategori "${activeCategory}".`}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((img) => (
              <div
                key={img.id}
                className="break-inside-avoid relative rounded-2xl overflow-hidden group shadow-sm border border-gray-100 bg-gray-100 mb-4"
              >
                <img 
                  src={`http://127.0.0.1:8000${img.image_path}`} 
                  alt={img.title} 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  {img.category && (
                    <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur text-white text-[10px] uppercase font-bold tracking-wider rounded-md mb-2 w-max border border-white/20">
                      {img.category}
                    </span>
                  )}
                  <p className="text-white font-semibold text-sm leading-tight">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 text-center mt-12">
        <Link href="/" className="text-xl font-black tracking-tight text-gray-900">HERCLO.</Link>
        <p className="text-gray-400 text-xs mt-2">&copy; {new Date().getFullYear()} HERCLO Official. All rights reserved.</p>
      </footer>
    </div>
  );
}