'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';
import Barcode from 'react-barcode';
import { useConfirm } from '../../components/ConfirmContext';
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
  size?: string;
  color?: string;
  items?: any[];
}

export default function ProductManagement() {
  const { confirm } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [printProduct, setPrintProduct] = useState<any | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // State Input Utama
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [size, setSize] = useState('M, L');
  const [color, setColor] = useState('Jet Black');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null);

  // Quick Size Stock Matrix
  const [sizeStocks, setSizeStocks] = useState<{ [key: string]: number }>({
    S: 0,
    M: 10,
    L: 10,
    XL: 0,
    'ALL SIZE': 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSizeStockChange = (sz: string, val: number) => {
    const updated = { ...sizeStocks, [sz]: Math.max(0, val) };
    setSizeStocks(updated);

    const activeSizes = Object.entries(updated)
      .filter(([_, qty]) => qty > 0)
      .map(([s]) => s);

    const total = Object.values(updated).reduce((acc, curr) => acc + curr, 0);
    setStock(String(total));
    setSize(activeSizes.length > 0 ? activeSizes.join(', ') : 'ALL SIZE');
  };

  const fetchData = async () => {
    try {
      try {
        const prodRes = await api.get('/admin/products');
        setProducts(prodRes.data.data || prodRes.data || []);
      } catch (err) {
        console.error('Gagal mengambil data produk:', err);
      }

      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data.data || catRes.data || []);
      } catch (err) {
        console.error('Gagal mengambil data kategori:', err);
      }
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
    setName(''); setCategoryId(''); setPrice(''); setStock('20'); setSize('M, L'); setColor('Jet Black');
    setSizeStocks({ S: 0, M: 10, L: 10, XL: 0, 'ALL SIZE': 0 });
    setDescription(''); setImage(null); setImagePreview(null); setExistingImagePath(null);
    setIsFormOpen(!isFormOpen);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategoryId(String(product.category_id));
    setPrice(String(product.price));
    setStock(String(product.stock_quantity));
    setSize(product.size || 'ALL SIZE');
    setColor(product.color || 'Jet Black');
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

    const finalStock = Math.max(1, parseInt(stock) || 1);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('stock_quantity', String(finalStock));
    formData.append('size', size || 'ALL SIZE');
    formData.append('color', color || 'Standard');
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
      const serverMessage = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join('\n') 
        : null;
      alert('Gagal menyimpan produk:\n' + (validationErrors || serverMessage || 'Pastikan semua kolom terisi dengan benar.'));
    } finally {
      setIsSubmitting(false);
      const fileInput = document.getElementById('product-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Hapus Produk',
      message: 'Apakah Anda yakin ingin menghapus produk ini? Semua data varian dan stok terkait juga akan terhapus.',
      confirmText: 'Hapus Produk',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (isConfirmed) {
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
          <p className="text-gray-500 text-sm">Manajemen katalog, harga, varian warna/ukuran, dan stok.</p>
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">Nama Produk</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="Contoh: Herclo Oversized Hoodie" />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">Kategori</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white">
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1">Harga Satuan (Rp)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="250000" />
                </div>

                {/* --- MATRIX WARNA & STOK UKURAN CEPAT --- */}
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Atur Warna & Stok per Ukuran (Cepat)</h4>
                      <p className="text-xs text-gray-500">Isi jumlah stok pada setiap ukuran yang ingin diproduksi.</p>
                    </div>
                    <div className="bg-lime-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs">
                      Total Stok: {stock || 0} Pcs
                    </div>
                  </div>

                  {/* Input Warna dengan Preset Cepat */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Warna Produk</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input 
                        type="text" 
                        required
                        value={color} 
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1 bg-white border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-black text-sm"
                        placeholder="Contoh: Jet Black, Sage Green, Oversized White..."
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['Hitam', 'Abu-abu', 'Putih', 'Navy'].map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setColor(preset)}
                            className="px-2.5 py-1.5 bg-gray-200 hover:bg-black hover:text-white rounded text-[11px] font-bold transition-all"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Grid Input Stok per Ukuran (S, M, L, XL, ALL SIZE) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Input Stok per Ukuran</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {['S', 'M', 'L', 'XL', 'ALL SIZE'].map((sz) => (
                        <div key={sz} className="bg-white p-2.5 rounded-lg border border-gray-200 text-center shadow-xs">
                          <span className="block text-xs font-black text-gray-700 mb-1">{sz}</span>
                          <input
                            type="number"
                            min="0"
                            value={sizeStocks[sz] ?? 0}
                            onChange={(e) => handleSizeStockChange(sz, parseInt(e.target.value) || 0)}
                            className="w-full text-center font-bold text-sm border border-gray-300 rounded p-1.5 focus:ring-2 focus:ring-black outline-none"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
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
                <th className="p-4 font-semibold text-gray-600">Warna</th>
                <th className="p-4 font-semibold text-gray-600">Harga</th>
                <th className="p-4 font-semibold text-gray-600">Stok Total</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Belum ada produk.</td>
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
                        <div>
                          <span className="font-bold text-gray-900 block">{product.name}</span>
                          <span className="text-xs text-gray-500">Size: {product.size || 'ALL SIZE'}</span>
                        </div>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{product.category?.name || '-'}</td>
                    <td className="p-4 text-gray-700 text-sm font-semibold">{product.color || '-'}</td>
                    <td className="p-4 text-gray-900 font-medium">Rp {new Intl.NumberFormat('id-ID').format(Number(product.price))}</td>
                    <td className="p-4 text-gray-700 text-sm font-bold">{product.stock_quantity} pcs</td>
                    <td className="p-4 text-right space-x-3">
                      {/* Tombol Cetak Hangtag */}
                      <button 
                        onClick={() => setPrintProduct(product)}
                        className="text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                      >
                        Cetak Hangtag
                      </button>
                      <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline text-sm font-medium">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {printProduct && (() => {
        const itemsToPrint = printProduct.items && printProduct.items.length > 0 
          ? printProduct.items 
          : Array.from({ length: Math.max(1, Number(printProduct.stock_quantity) || 1) }, (_, index) => ({
              serial_number: `HRC-${String(printProduct.id || '0').padStart(4, '0')}-${String(index + 1).padStart(3, '0')}`,
              size: printProduct.size || 'ALL SIZE'
            }));

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 print:bg-white print:static print:inset-auto print:p-0 print:m-0 print:overflow-visible">
            
            <div className="min-h-screen p-8 flex flex-col items-center print:min-h-0 print:p-0 print:m-0 print:block">
              
              <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl text-center mb-8 print:hidden">
                <h3 className="font-bold text-xl mb-2">Cetak {itemsToPrint.length} Stiker Barcode (2 Kolom Sejajar)</h3>
                <p className="text-sm text-gray-500 mb-6">Siapkan printer thermal (RPN02N). Sistem akan mencetak 2 stiker sejajar per baris.</p>
                
                <div className="flex justify-center gap-4">
                  <button onClick={() => setPrintProduct(null)} className="px-6 py-2 rounded-lg bg-gray-200 font-bold hover:bg-gray-300">Batal</button>
                  <button onClick={() => window.print()} className="bg-black text-white px-8 py-2 rounded-lg font-bold hover:bg-gray-800 flex gap-2 items-center">
                    <span>🖨️</span> Mulai Mencetak
                  </button>
                </div>
              </div>

              {/* AREA RENDER STIKER MASSAL 2 KOLOM SEJAJAR (Khusus Print Thermal RPN02N) */}
              <div className="print-area grid grid-cols-2 gap-3 print:grid print:grid-cols-2 print:gap-x-[2mm] print:gap-y-[1.5mm] print:w-full print:p-0 print:m-0">
                {itemsToPrint.map((item: any, idx: number) => (
                  
                  /* Desain 1 Stiker Thermal 2 Sisi Sejajar (Format RPN02N) */
                  <div 
                    key={item.serial_number || idx} 
                    className="w-[32mm] sm:w-[33mm] h-[19mm] bg-white border border-dashed border-gray-300 rounded p-1 flex flex-col justify-between items-center text-black print:page-break-inside-avoid print:border-none print:shadow-none print:m-0 print:p-0.5 overflow-hidden box-border"
                  >
                    {/* Baris 1: Nama Produk */}
                    <p className="w-full text-center text-[7.5px] font-semibold uppercase leading-tight truncate px-0.5">
                      {printProduct.name}
                    </p>

                    {/* Baris 2: Ukuran (Kiri) & Harga (Kanan) */}
                    <div className="w-full flex justify-between items-center text-[8px] font-bold leading-none px-0.5 my-0.5">
                      <span>Size: {item.size || printProduct.size || 'ALL SIZE'}</span>
                      <span>Rp {new Intl.NumberFormat('id-ID').format(Number(printProduct.price))}</span>
                    </div>

                    {/* Baris 3: 1D Barcode Centered */}
                    <div className="w-full flex justify-center items-center leading-none">
                      <Barcode 
                        value={item.serial_number || `HRC-${printProduct.id}-${idx + 1}`} 
                        width={0.8}      
                        height={16}      
                        fontSize={7.5}    
                        margin={0}
                        background="#ffffff"
                        lineColor="#000000"
                      />
                    </div>

                  </div>

                ))}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}