'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../../lib/axios';
import PublicHeader from '../components/PublicHeader';

interface Category { id: number; name: string; }
interface Product { id: number; name: string; price: number; image_path?: string; category?: { name: string; }; }

export default function CollectionPage() {
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState({ size: 'M', color: 'Hitam', qty: 1 });

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setVariant({ size: 'M', color: 'Hitam', qty: 1 });
  };

  const handleBuy = (isDirectBuy: boolean) => {
    if (!selectedProduct) return;
    try {
      const existingCart = JSON.parse(localStorage.getItem('herclo_cart') || '[]');
      
      const existingItemIndex = existingCart.findIndex((item: any) => 
        item.product.id === selectedProduct.id && 
        item.size === variant.size && 
        item.color === variant.color
      );

      if (existingItemIndex >= 0) {
        existingCart[existingItemIndex].quantity += variant.qty;
      } else {
        existingCart.push({
          id: Date.now() + Math.random(),
          product: selectedProduct,
          quantity: variant.qty,
          size: variant.size,
          color: variant.color
        });
      }

      localStorage.setItem('herclo_cart', JSON.stringify(existingCart));
      setSelectedProduct(null);
      if (isDirectBuy) {
        router.push('/checkout');
      } else {
        alert('Berhasil dimasukkan ke keranjang!');
      }
    } catch (error) {
      alert('Gagal menyimpan keranjang ke browser.');
    }
  };

  // State untuk Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>(''); // price_asc, price_desc

  // Mengambil daftar Kategori untuk sidebar
  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data)).catch(console.error);
  }, []);

  // Mengambil produk berdasarkan filter
  useEffect(() => {
    setLoading(true);
    let endpoint = `/products?search=${searchKeyword}`;
    if (selectedCategory) endpoint += `&category_id=${selectedCategory}`;
    if (sortOrder) endpoint += `&sort=${sortOrder}`;

    api.get(endpoint)
      .then(res => setProducts(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchKeyword, selectedCategory, sortOrder]);

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <PublicHeader />

      {/* --- POPUP MODAL VARIAN --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl md:rounded-2xl p-6 animate-slide-up relative">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                   {selectedProduct.image_path ? (
                     <img src={`http://127.0.0.1:8000${selectedProduct.image_path}`} alt={selectedProduct.name} className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xs text-gray-400">Produk</span>
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1 pr-6">{selectedProduct.name}</h3>
                  <p className="text-xl font-bold text-red-600">Rp {new Intl.NumberFormat('id-ID').format(Number(selectedProduct.price))}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-2xl leading-none">&times;</button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Ukuran</label>
                <div className="flex gap-2 flex-wrap">
                  {['S', 'M', 'L', 'XL'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setVariant({...variant, size: s})} 
                      className={`px-4 py-1.5 border rounded-md text-sm font-medium transition-colors ${variant.size === s ? 'border-black text-black bg-gray-100' : 'border-gray-300 text-gray-600'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Warna</label>
                <div className="flex gap-2 flex-wrap">
                  {['Hitam', 'Putih', 'Navy'].map(c => (
                    <button 
                      key={c} 
                      onClick={() => setVariant({...variant, color: c})} 
                      className={`px-4 py-1.5 border rounded-md text-sm font-medium transition-colors ${variant.color === c ? 'border-black text-black bg-gray-100' : 'border-gray-300 text-gray-600'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center py-4 border-y border-gray-100 mt-2">
                <span className="font-semibold text-sm">Jumlah</span>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button onClick={() => setVariant({...variant, qty: Math.max(1, variant.qty - 1)})} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-lg leading-none">-</button>
                  <span className="px-4 text-sm font-medium border-x border-gray-300 py-1">{variant.qty}</span>
                  <button onClick={() => setVariant({...variant, qty: variant.qty + 1})} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-lg leading-none">+</button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => handleBuy(false)} 
                className="flex-1 bg-white text-black py-3 rounded-lg font-bold border-2 border-black hover:bg-gray-50 transition-colors"
              >
                + Keranjang
              </button>
              <button 
                onClick={() => handleBuy(true)} 
                className="flex-1 bg-black text-white py-3 rounded-lg font-bold border-2 border-black hover:bg-gray-800 transition-colors"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">
        
        {/* SIDEBAR FILTER */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Kategori</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="category" checked={selectedCategory === ''} onChange={() => setSelectedCategory('')} className="w-4 h-4 text-black focus:ring-black" />
                <span className={`${selectedCategory === '' ? 'font-bold' : 'text-gray-600'}`}>Semua Produk</span>
              </label>
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="category" checked={selectedCategory === String(cat.id)} onChange={() => setSelectedCategory(String(cat.id))} className="w-4 h-4 text-black focus:ring-black" />
                  <span className={`${selectedCategory === String(cat.id) ? 'font-bold' : 'text-gray-600'}`}>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Urutkan Harga</h3>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black text-sm"
            >
              <option value="">Paling Sesuai / Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>
        </aside>

        {/* DAFTAR PRODUK */}
        <section className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2">
              {searchKeyword ? `Hasil pencarian untuk "${searchKeyword}"` : 'Semua Koleksi'}
            </h1>
            <p className="text-gray-500">Menampilkan {products.length} produk.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="font-bold text-xl mb-2">Produk tidak ditemukan</h3>
              <p className="text-gray-500">Coba gunakan kata kunci lain atau hapus filter Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                  <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image_path ? (
                      <img src={`http://127.0.0.1:8000${product.image_path}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-gray-400">Gambar Produk</span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{product.category?.name || '-'}</span>
                    <h3 className="text-base font-bold mt-1 mb-2 truncate">{product.name}</h3>
                    <p className="font-black text-lg">Rp {new Intl.NumberFormat('id-ID').format(product.price)}</p>
                    <button
                      onClick={() => openModal(product)}
                      className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors mt-4"
                    >
                      Beli / + Keranjang
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}