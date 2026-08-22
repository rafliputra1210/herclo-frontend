'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default function ArticleClient() {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">Memuat Jurnal...</div>;
  if (!article) return null;

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 pb-20">
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
        <div className="prose prose-lg prose-gray max-w-none">
          {(article.content || '').split('\n').map((paragraph: string, index: number) => (
            <p key={index} className="mb-6 leading-relaxed text-gray-600 text-lg">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-bold hover:text-emerald-600 transition-colors">
            ← Kembali ke Semua Jurnal
          </Link>
        </div>
      </article>
    </main>
  );
}
