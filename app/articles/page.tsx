'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../lib/axios';
import PublicHeader from '../components/PublicHeader';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_path?: string;
  is_published: boolean;
  created_at: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/articles')
      .then((res) => {
        setArticles(res.data.data || res.data);
      })
      .catch((err) => {
        console.error('Gagal mengambil data artikel:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <PublicHeader />
      
      {/* Banner / Header */}
      <section className="bg-black text-white py-14 px-6 text-center relative">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-start sm:justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-full transition-all hover:border-lime-400 active:scale-95 shadow-sm"
            >
              <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Kembali ke Beranda
            </Link>
          </div>
          <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-lime-400 mb-2">
            HERCLO JOURNAL
          </p>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            Artikel & Tips Fashion
          </h1>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Temukan inspirasi style, tips outfit terkini, serta berita terbaru seputar koleksi HERCLO.
          </p>
        </div>
      </section>

      {/* Main Content / List Artikel */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20 font-bold text-gray-500">
            Memuat Artikel...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">Belum ada artikel yang dipublikasikan.</p>
            <p className="text-sm mt-1">Kembali lagi nanti untuk update artikel terbaru!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                  {article.image_path ? (
                    <img
                      src={`${BACKEND_URL}${article.image_path}`}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-2xl text-gray-300">
                      HERCLO
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-2 font-medium">
                      {new Date(article.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-emerald-600 transition-colors">
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">
                      {article.content}
                    </p>
                  </div>

                  <Link
                    href={`/articles/${article.slug}`}
                    className="inline-flex items-center text-sm font-bold text-black hover:text-emerald-600 transition-colors mt-2"
                  >
                    Baca Selengkapnya →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
