'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
}

export default function PublicArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/articles')
      .then((res) => setArticles(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <PublicHeader />

      {/* Page Hero */}
      <div className="bg-linear-to-br from-amber-50 to-orange-50 border-b border-amber-100 py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 inline-block mb-4">
            HERCLO Journal
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
            Blog &amp; Fashion Articles
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Tips styling, tren pakaian terbaru, dan cerita eksklusif di balik produksi koleksi HERCLO.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-gray-50 p-14 rounded-2xl border border-gray-100 text-center text-gray-400 max-w-md mx-auto">
            Belum ada artikel yang diterbitkan.
          </div>
        ) : (
          <div className="space-y-10">
            {articles.map((article, index) => (
              <article
                key={article.id}
                className={`group flex flex-col ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } gap-8 items-center bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300`}
              >
                {/* Thumbnail Placeholder */}
                <div className="w-full md:w-72 shrink-0 h-52 md:h-full min-h-52 bg-linear-to-br from-amber-50 to-orange-100 flex items-center justify-center">
                  <span className="text-5xl font-black text-amber-200 group-hover:scale-110 transition-transform duration-500">
                    HERCLO
                  </span>
                </div>
                {/* Content */}
                <div className="p-6 md:p-8 flex-1">
                  <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">
                    {new Date(article.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-amber-700 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6">{article.content}</p>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all">
                    Baca Selengkapnya
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-10 text-center mt-8">
        <Link href="/" className="text-xl font-black tracking-tight text-gray-900">HERCLO.</Link>
        <p className="text-gray-400 text-xs mt-2">&copy; {new Date().getFullYear()} HERCLO Official. All rights reserved.</p>
      </footer>
    </div>
  );
}