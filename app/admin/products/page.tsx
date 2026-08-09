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
  price: number;
  stock_quantity: number;
  description: string;
  category_id: number;
  category?: Category;
}

export default function ProductCrud() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null); // Menyimpan ID produk yang sedang diedit
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    stock_quantity: '',
    description: 'Deskripsi standar produk HERCLO.'
  });

  const fetchData = async () => {
    try {
      const [productRes, categoryRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(productRes.data.data);
      setCategories(categoryRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Membuka form untuk Edit data
  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category_id: product.category_id.toString(),
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      description: product.description || 'Deskripsi standar produk HERCLO.',
    });
    setIsFormOpen(true);
  };

  // Membuka form untuk Tambah data (Reset form)
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ name: '', category_id: '', price: '', stock_quantity: '', description: 'Deskripsi standar produk HERCLO.' });
    setIsFormOpen(!isFormOpen);
  };

  // Menyimpan data (Create atau Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Mode Edit (PUT request)
        await api.put(`/admin/products/${editingId}`, formData);
        alert('Produk berhasil diperbarui!');
      } else {
        // Mode Tambah (POST request)
        await api.post('/admin/products', formData);
        alert('Produk berhasil ditambahkan!');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Gagal simpan produk:', error);
      alert('Gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan.'));
    }
  };

  // Menghapus data
  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        alert('Produk dihapus.');
        fetchData(); // Refresh tabel
      } catch (error) {
        console.error('Gagal hapus produk:', error);
        alert('Gagal menghapus produk.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-500 text-sm">Manajemen katalog, harga, dan stok.</p>
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
             <h3 className="font-semibold text-lg">{editingId ? 'Edit Detail Produk' : 'Detail Produk Baru'}</h3>
             <button onClick={() => setIsFormOpen(false)} className="text-red-500 text-sm hover:underline">Tutup Form</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Produk</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select name="category_id" value={formData.category_id} onChange={handleInputChange} required className="w-full border p-2 rounded bg-white">
                <option value="">-- Pilih Kategori --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stok Awal</label>
              <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange} required className="w-full border p-2 rounded" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-black text-white py-2 rounded font-medium mt-2">
                {editingId ? 'Simpan Perubahan' : 'Simpan ke Database'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Memuat katalog...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-semibold text-gray-600">ID</th>
                <th className="p-4 font-semibold text-gray-600">Nama Produk</th>
                <th className="p-4 font-semibold text-gray-600">Kategori</th>
                <th className="p-4 font-semibold text-gray-600">Harga</th>
                <th className="p-4 font-semibold text-gray-600">Stok</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-500">{product.id}</td>
                  <td className="p-4 font-medium text-gray-900">{product.name}</td>
                  <td className="p-4 text-gray-500">{product.category?.name || '-'}</td>
                  <td className="p-4 font-medium">Rp {new Intl.NumberFormat('id-ID').format(product.price)}</td>
                  <td className="p-4">{product.stock_quantity}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleEditClick(product)}
                      className="text-blue-600 hover:underline mr-3 text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}