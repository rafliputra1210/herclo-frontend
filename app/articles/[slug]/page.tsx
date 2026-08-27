'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/axios';
import PublicHeader from '../../components/PublicHeader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default function SingleArticlePage() {
  const { slug } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.get(`/articles/${slug}`)
      .then(res => setArticle(res.data.data || res.data))
      .catch(err => {
        console.error('Artikel tidak ditemukan', err);
        router.push('/articles');
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />
      <div className="flex-1 flex items-center justify-center font-bold text-gray-500">Memuat Jurnal...</div>
    </div>
  );
  if (!article) return null;

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      <PublicHeader />
      {/* HEADER & FOTO ARTIKEL */}
      <header className="relative w-full h-[60vh] bg-gray-100 flex items-end justify-center overflow-hidden">
        {article.image_path ? (
          <img 
            src={`${BACKEND_URL}${article.image_path}`} 
            alt={article.title} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-gray-200">
            HERCLO
          </div>
        )}
        
        {/* Overlay Gelap agar teks terbaca */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-16 text-center text-white">
          <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4">
            {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {article.title}
          </h1>
        </div>
      </header>

      {/* ISI ARTIKEL */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="space-y-6 text-gray-800">
          {(article.content || '')
            .split(/\n\s*\n/)
            .map((paragraphGroup: string, index: number) => {
              const trimmed = paragraphGroup.trim();
              if (!trimmed) return null;
              
              if (trimmed.startsWith('>')) {
                return (
                  <blockquote key={index} className="border-l-4 border-lime-400 pl-5 italic text-gray-800 font-medium py-3 bg-gray-50 rounded-r-2xl my-6">
                    {trimmed.replace(/^>\s*/, '')}
                  </blockquote>
                );
              }
              
              return (
                <p key={index} className="text-base md:text-lg leading-relaxed md:leading-loose text-gray-700 whitespace-pre-line">
                  {trimmed}
                </p>
              );
            })}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap items-center justify-center gap-4 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full transition-all">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Kembali ke Beranda
          </Link>
          <Link href="/articles" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-full transition-all">
            ← Semua Artikel & Jurnal
          </Link>
        </div>
      </article>
    </main>
  );
}