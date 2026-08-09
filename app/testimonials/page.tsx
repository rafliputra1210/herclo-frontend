'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';

interface Testimonial {
  id: number;
  customer_name: string;
  content: string;
  rating: number;
}

export default function PublicTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/testimonials')
      .then((res) => setTestimonials(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const renderStars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  const avgRating =
    testimonials.length > 0
      ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
      : '0';

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <PublicHeader />

      {/* Page Hero */}
      <div className="relative py-20 md:py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-950/60 px-3 py-1 rounded-full border border-sky-800 inline-block mb-4">
            Reviews &amp; Feedback
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Suara Pelanggan Kami
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Kami berkomitmen memberikan kualitas terbaik. Lihat pengalaman langsung dari para pembeli produk HERCLO.
          </p>

          {/* Rating Summary */}
          {!loading && testimonials.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-5xl font-black text-yellow-400">{avgRating}</div>
                <div className="text-yellow-400 text-lg mt-1">{'★'.repeat(Math.round(parseFloat(avgRating)))}</div>
                <div className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Rating Rata-rata</div>
              </div>
              <div className="w-px h-12 bg-gray-700 hidden md:block" />
              <div className="text-center">
                <div className="text-5xl font-black text-white">{testimonials.length}</div>
                <div className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Total Ulasan</div>
              </div>
              <div className="w-px h-12 bg-gray-700 hidden md:block" />
              <div className="text-center">
                <div className="text-5xl font-black text-emerald-400">
                  {testimonials.filter((t) => t.rating >= 4).length}
                </div>
                <div className="text-gray-400 text-xs mt-1 uppercase tracking-widest">Ulasan Positif</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-gray-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 p-14 rounded-2xl text-center text-gray-400 max-w-md mx-auto">
            Belum ada ulasan.
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
            {testimonials.map((testi) => (
              <div
                key={testi.id}
                className="break-inside-avoid bg-gray-900 border border-gray-800 p-7 rounded-2xl hover:border-gray-600 hover:bg-gray-800/60 transition-all duration-300 flex flex-col justify-between mb-5"
              >
                <div>
                  <div className="text-yellow-400 text-2xl tracking-widest mb-4">
                    {renderStars(testi.rating)}
                  </div>
                  <p className="text-gray-300 italic leading-relaxed text-base mb-6">
                    &ldquo;{testi.content}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                  <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-black text-sm shrink-0">
                    {testi.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{testi.customer_name}</p>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">✓ Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 text-center">
        <Link href="/" className="text-xl font-black tracking-tight text-white">HERCLO.</Link>
        <p className="text-gray-600 text-xs mt-2">&copy; {new Date().getFullYear()} HERCLO Official. All rights reserved.</p>
      </footer>
    </div>
  );
}