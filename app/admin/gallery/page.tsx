'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';
import { useConfirm } from '../../components/ConfirmContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

interface Gallery {
  id: number;
  title: string;
  category: string;
  image_path: string;
}

export default function GalleryManagement() {
  const { confirm } = useConfirm();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // State Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchGalleries = async () => {
    try {
      const response = await api.get('/admin/galleries');
      setGalleries(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil galeri:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Pilih gambar terlebih dahulu!');

    setIsUploading(true);
    
    // Gunakan FormData untuk mengirim file
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('image', file);

    try {
      await api.post('/admin/galleries', formData);
      alert('Gambar berhasil diunggah!');
      
      // Reset form
      setTitle('');
      setCategory('');
      setFile(null);
      
      // Bersihkan input file (opsional)
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      fetchGalleries();
    } catch (error: any) {
      console.error('Upload gagal:', error);
      const serverMsg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message;
      alert('Gagal mengunggah: ' + (serverMsg || 'Pastikan file adalah gambar berukuran maksimal 10MB.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Hapus Gambar Galeri',
      message: 'Yakin ingin menghapus gambar ini dari galeri?',
      confirmText: 'Hapus Gambar',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (isConfirmed) {
      try {
        await api.delete(`/admin/galleries/${id}`);
        fetchGalleries();
      } catch (error) {
        alert('Gagal menghapus gambar.');
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Galeri Foto Model</h1>
        <p className="text-gray-500 text-sm">Kelola aset visual untuk Dailywear, Sportwear, dan Photoshoot.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form Upload */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-semibold text-lg mb-4">Unggah Foto Baru</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul Foto</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border p-2 rounded" placeholder="Contoh: Photoshoot Summer 2026" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full border p-2 rounded bg-white">
                <option value="">-- Pilih Kategori --</option>
                <option value="Dailywear">Dailywear</option>
                <option value="Sportwear">Sportwear</option>
                <option value="Muslimwear">Muslimwear</option>
                <option value="Photoshoot">Studio & Outdoor Photoshoot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pilih Gambar (Maks 10MB)</label>
              <input 
                id="file-upload"
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
                required 
                className="w-full border p-2 rounded text-sm" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isUploading}
              className="w-full bg-black text-white py-2.5 rounded font-medium disabled:bg-gray-400"
            >
              {isUploading ? 'Mengunggah...' : 'Unggah ke Galeri'}
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Grid Gambar */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center p-10 text-gray-500">Memuat galeri...</div>
          ) : galleries.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
              Belum ada gambar di galeri.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleries.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm group">
                  {/* Gunakan URL base dari backend Laravel */}
                  <div className="h-40 bg-gray-100 relative overflow-hidden">
                    <img 
                      src={item.image_path.startsWith('http') ? item.image_path : `${BACKEND_URL}${item.image_path}`} 
                      alt={item.title} 
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 text-xs font-medium hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}