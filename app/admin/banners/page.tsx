'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

interface Banner {
  id: number;
  title: string;
  image_path: string;
  link_url: string;
  is_active: boolean;
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // State Form
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchBanners = async () => {
    try {
      const response = await api.get('/admin/banners');
      setBanners(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil banner:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Pilih gambar banner terlebih dahulu!');

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('link_url', linkUrl);
    formData.append('image', file);

    try {
      await api.post('/admin/banners', formData);
      alert('Banner promosi berhasil diunggah!');
      
      // Reset form
      setTitle('');
      setLinkUrl('');
      setFile(null);
      const fileInput = document.getElementById('banner-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      fetchBanners();
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

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.put(`/admin/banners/${id}/status`, { is_active: !currentStatus });
      fetchBanners();
    } catch (error) {
      alert('Gagal mengubah status banner.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus banner ini secara permanen?')) {
      try {
        await api.delete(`/admin/banners/${id}`);
        fetchBanners();
      } catch (error) {
        alert('Gagal menghapus banner.');
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Banner</h1>
        <p className="text-gray-500 text-sm">Kelola gambar slide banner utama di halaman beranda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Upload Banner */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit lg:col-span-1">
          <h3 className="font-semibold text-lg mb-4">Upload Banner Baru</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul Banner (Opsional)</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full border border-gray-300 p-2 rounded focus:ring-black focus:border-black" 
                placeholder="Promo Kemerdekaan" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link Tujuan (Opsional)</label>
              <input 
                type="text" 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)} 
                className="w-full border border-gray-300 p-2 rounded focus:ring-black focus:border-black" 
                placeholder="/koleksi/promo" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">File Gambar (Maks 10MB)</label>
              <input 
                id="banner-upload"
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
                required 
                className="w-full border border-gray-300 p-2 rounded text-sm bg-gray-50" 
              />
              <p className="text-xs text-gray-500 mt-1">Rekomendasi rasio: 16:9 (Landscape)</p>
            </div>
            <button 
              type="submit" 
              disabled={isUploading}
              className="w-full bg-black text-white py-2.5 rounded font-medium disabled:bg-gray-400 hover:bg-gray-800 transition-colors"
            >
              {isUploading ? 'Mengunggah...' : 'Upload Banner'}
            </button>
          </form>
        </div>

        {/* Daftar Banner */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center p-10 text-gray-500 bg-white rounded-xl border border-gray-200">Memuat daftar banner...</div>
          ) : banners.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
              Belum ada banner yang diunggah.
            </div>
          ) : (
            <div className="space-y-6">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                  {/* Preview Gambar */}
                  <div className="md:w-1/2 h-48 bg-gray-100 relative">
                    <img 
                      src={`http://127.0.0.1:8000${banner.image_path}`} 
                      alt={banner.title || 'Banner Image'} 
                      className="object-cover w-full h-full"
                    />
                    {!banner.is_active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">TIDAK AKTIF</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Detail & Aksi */}
                  <div className="p-6 md:w-1/2 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{banner.title || 'Tanpa Judul'}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                        Link: {banner.link_url ? <a href={banner.link_url} className="text-blue-600 hover:underline">{banner.link_url}</a> : '-'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <button 
                        onClick={() => handleToggleStatus(banner.id, banner.is_active)}
                        className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${banner.is_active ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                        {banner.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button 
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Hapus Permanen
                      </button>
                    </div>
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