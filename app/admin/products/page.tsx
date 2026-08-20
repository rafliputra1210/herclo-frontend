'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: string | number;
  stock_quantity: number;
  description?: string;
  image_path?: string;
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
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/categories')
      ]);
      
      setProducts(prodRes.data.data || prodRes.data);
      setCategories(catRes.data.data || catRes.data);
    } catch (error) {
      console.error('Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === 'true') {
        setIsFormOpen(true);
      }
    }
  }, []);

  const handleAddClick = () => {
    setEditingId(null);
    setName(''); setCategoryId(''); setPrice(''); setStock(''); setDescription(''); setImage(null);
    setImagePreview(null);
    setExistingImagePath(null);
    setIsFormOpen(!isFormOpen);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategoryId(String(product.category_id));
    setPrice(String(product.price));
    setStock(String(product.stock_quantity));
    setDescription(product.description || '');
    setImage(null);
    setImagePreview(null);
    setExistingImagePath(product.image_path || null);
    setIsFormOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('product-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('stock_quantity', stock);
    formData.append('description', description);
    
    if (image) {
      formData.append('image', image);
    }
    
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
      setImagePreview(null);
      setExistingImagePath(null);
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

  const displayImageSrc = imagePreview || (existingImagePath ? (existingImagePath.startsWith('http') ? existingImagePath : `${BACKEND_URL}${existingImagePath}`) : null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-500 text-sm">Manajemen katalog, harga, stok, dan gambar produk.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          {isFormOpen && !editingId ? 'Batal Tambah' : '+ Tambah Produk'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
             <h3 className="font-semibold text-lg">{editingId ? 'Edit Produk' : 'Detail Produk Baru'}</h3>
             <button onClick={() => setIsFormOpen(false)} className="text-red-500 text-sm hover:underline">Tutup Form</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nama Produk</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:border-black outline-none" placeholder="Contoh: Herclo Black Hoodie" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Kategori</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:border-black outline-none bg-white">
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" className="w-full border border-gray-300 p-2.5 rounded-lg focus:border-black outline-none" placeholder="250000" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Stok Awal</label>
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" className="w-full border border-gray-300 p-2.5 rounded-lg focus:border-black outline-none" placeholder="50" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Deskripsi Produk</label>
                    <textarea 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                      rows={3}
                      className="w-full border border-gray-300 p-2.5 rounded-lg focus:border-black outline-none resize-none text-sm"
                      placeholder="Tulis detail bahan, fitur, dan spesifikasi produk..."
                    />
                </div>

                {/* --- AREA UPLOAD & PREVIEW GAMBAR --- */}
                <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium">Gambar Produk</label>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      {displayImageSrc ? (
                        <div className="relative w-32 h-40 bg-gray-200 rounded-lg overflow-hidden border shadow-sm shrink-0">
                          <img src={displayImageSrc} alt="Preview Produk" className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {imagePreview ? 'Pratinjau Baru' : 'Gambar Saat Ini'}
                          </span>
                        </div>
                      ) : (
                        <div className="w-32 h-40 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 border border-dashed shrink-0">
                          <span className="text-2xl mb-1">🖼️</span>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-center px-2">Belum ada gambar</span>
                        </div>
                      )}

                      <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                        <input 
                          id="product-image"
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange} 
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-black file:text-lime-400 hover:file:bg-gray-800 cursor-pointer" 
                        />
                        <p className="text-xs text-gray-500">
                          Maksimal 3MB (Format: JPG, PNG, WEBP). <br />
                          {editingId ? 'Pilih file baru jika ingin mengganti gambar produk.' : 'Pilih gambar terbaik untuk produk Anda.'}
                        </p>

                        {imagePreview && (
                          <button 
                            type="button" 
                            onClick={handleClearImage}
                            className="text-xs text-red-600 font-bold hover:underline inline-block mt-1"
                          >
                            ✕ Hapus Pilihan Gambar Baru
                          </button>
                        )}
                      </div>
                    </div>
                </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-lime-400 py-3 rounded-lg font-bold uppercase tracking-widest text-xs mt-4 disabled:bg-gray-400 hover:bg-gray-900 transition-colors shadow-md"
            >
              {isSubmitting ? 'Menyimpan...' : (editingId ? 'Perbarui Produk' : 'Simpan Produk Baru')}
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
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                        <div className="w-12 h-16 rounded bg-gray-100 flex-shrink-0 overflow-hidden border">
                          {product.image_path ? (
                            <img 
                              src={product.image_path.startsWith('http') ? product.image_path : `${BACKEND_URL}${product.image_path}`} 
                              alt={product.name} 
                              className="w-full h-full object-cover" 
                            />
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
                      <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:underline mr-3 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline text-sm font-medium">Hapus</button>
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