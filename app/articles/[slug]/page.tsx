import ArticleClient from './ArticleClient';

// Required for `output: export` (cPanel). Jika API reachable, prerender semua slug; jika gagal fallback placeholder.
export async function generateStaticParams() {
  const fallback = [{ slug: 'placeholder' }];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.herclo.co.id/api';
    const res = await fetch(`${apiUrl.replace(/\/+$/, '')}/articles`, { next: { revalidate: 60 } });
    if (!res.ok) return fallback;
    const text = await res.text();
    if (text.trim().startsWith('<')) return fallback;
    const data = JSON.parse(text);
    const articles = data.data || data || [];
    if (!Array.isArray(articles) || articles.length === 0) return fallback;
    const params = articles.map((a: any) => a.slug && { slug: String(a.slug) }).filter(Boolean);
    if (params.length === 0) return fallback;
    const hasPlaceholder = params.some((p: any) => p.slug === 'placeholder');
    return hasPlaceholder ? params : [...params, { slug: 'placeholder' }];
  } catch {
    return fallback;
  }
}

export default function SingleArticlePage() {
  return <ArticleClient />;
}
