'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: string | number;
  stock_quantity: number;
  image_path?: string; // <-- Tambahkan ini
  category_id: number;
  category?: { name: string; };
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // State Input
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState<File | null>(null); // State khusus untuk File Gambar
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/categories') // <-- UBAH BAGIAN INI (Hapus /admin)
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();  
  }, []);

  const handleAddClick = () => {
    setEditingId(null);
    setName(''); setCategoryId(''); setPrice(''); setStock(''); setImage(null);
    setIsFormOpen(!isFormOpen);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategoryId(String(product.category_id));
    setPrice(String(product.price));
    setStock(String(product.stock_quantity));
    setImage(null); // Kosongkan file input saat edit
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Karena ada file gambar, kita WAJIB menggunakan FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('stock_quantity', stock);
    
    // Jika ada gambar baru yang dipilih, masukkan ke form
    if (image) {
      formData.append('image', image);
    }
    
    // Jika edit, metode PUT di Laravel membutuhkan trick khusus via POST + _method
    if (editingId) {
      formData.append('_method', 'PUT');
    }

    try {
      if (editingId) {
        await api.post(`/admin/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Produk berhasil diperbarui!');
      } else {
        await api.post('/admin/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Produk berhasil ditambahkan!');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error: any) {
      alert('Gagal menyimpan produk: ' + (error.response?.data?.message || 'Pastikan semua kolom terisi.'));
    } finally {
      setIsSubmitting(false);
      const fileInput = document.getElementById('product-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        fetchData();
      } catch (error) {
        alert('Gagal menghapus produk.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-500 text-sm">Manajemen katalog, harga, stok, dan gambar.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
        >
          {isFormOpen && !editingId ? 'Batal Tambah' : '+ Tambah Produk'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-lg">{editingId ? 'Edit Produk' : 'Detail Produk Baru'}</h3>
             <button onClick={() => setIsFormOpen(false)} className="text-red-500 text-sm hover:underline">Tutup Form</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nama Produk</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 p-2 rounded focus:border-black outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full border border-gray-300 p-2 rounded focus:border-black outline-none bg-white">
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map(cat => (
                           <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" className="w-full border border-gray-300 p-2 rounded focus:border-black outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Stok Awal</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" className="w-full border border-gray-300 p-2 rounded focus:border-black outline-none" />
                </div>
                {/* TAMBAHAN KOLOM GAMBAR */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Gambar Produk</label>
                    <input 
                      id="product-image"
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} 
                      className="w-full border border-gray-300 p-2 rounded bg-gray-50 text-sm" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Maksimal 3MB (Format: JPG, PNG, WEBP). {editingId && 'Biarkan kosong jika tidak ingin mengubah gambar.'}</p>
                </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white py-2.5 rounded font-medium mt-4 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan ke Database'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Memuat data produk...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-semibold text-gray-600">Produk</th>
                <th className="p-4 font-semibold text-gray-600">Kategori</th>
                <th className="p-4 font-semibold text-gray-600">Harga</th>
                <th className="p-4 font-semibold text-gray-600">Stok</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada produk.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-4">
                        {/* TAMPILAN THUMBNAIL GAMBAR DI TABEL */}
                        <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border">
                          {product.image_path ? (
                            <img src={`http://127.0.0.1:8000${product.image_path}`} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="flex items-center justify-center h-full text-[10px] text-gray-400">No Img</span>
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{product.category?.name || '-'}</td>
                    <td className="p-4 text-gray-900 font-medium">Rp {new Intl.NumberFormat('id-ID').format(Number(product.price))}</td>
                    <td className="p-4 text-gray-600 text-sm">{product.stock_quantity}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:underline mr-3 text-sm">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline text-sm">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}