'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/axios';
import PublicHeader from '../../components/PublicHeader';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_path?: string;
  created_at: string;
}

export default function ArticleReadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug; // Menangkap slug dari URL

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      // Mengambil data artikel dari backend berdasarkan slug
      api.get(`/articles/${slug}`)
        .then(res => {
          setArticle(res.data.data);
        })
        .catch(error => {
          console.error('Gagal mengambil artikel:', error);
          // Jika artikel tidak ditemukan (404), kembalikan ke beranda
          if (error.response?.status === 404) {
             router.push('/');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans gap-4">
        <div className="text-3xl font-black tracking-tight text-gray-900">HERCLO.</div>
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) return null; // Jika data kosong dan bukan loading, cegah error layar putih

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-black selection:text-white">
      <PublicHeader />

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        
        {/* Tombol Kembali */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-10 transition-colors"
        >
          <span>←</span> Kembali ke Beranda
        </Link>

        {/* Header Artikel */}
        <header className="mb-12 text-center md:text-left">
          <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-4">
            {new Date(article.created_at).toLocaleDateString('id-ID', {
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric'
            })}
          </p>
          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
            {article.title}
          </h1>
          <div className="w-20 h-1 bg-black mx-auto md:mx-0"></div>
        </header>

        {/* Gambar Cover Artikel (Jika Ada) */}
        {article.image_path && (
          <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-12 shadow-md">
            <img 
              src={`http://127.0.0.1:8000${article.image_path}`} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Konten Artikel */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
          {/* 
            Catatan: Jika konten artikel dari database berupa HTML (misal dari CKEditor), 
            gunakan dangerouslySetInnerHTML. 
            Jika hanya teks biasa, kita pecah berdasarkan paragraf (baris baru).
          */}
          {article.content.split('\n').map((paragraph, index) => (
            paragraph.trim() !== '' && (
              <p key={index} className="mb-6 text-lg">
                {paragraph}
              </p>
            )
          ))}
        </div>

        {/* Footer Artikel (Share & Tags) */}
        <footer className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-bold text-gray-400">Bagikan artikel ini:</p>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
              F
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
              T
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Tautan berhasil disalin!');
              }}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
              title="Salin Tautan"
            >
              🔗
            </button>
          </div>
        </footer>

      </article>
    </main>
  );
}