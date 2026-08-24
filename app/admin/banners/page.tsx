'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';
import { useConfirm } from '../../components/ConfirmContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
const MAX_BANNERS = 10;

interface Banner {
  id: number;
  title: string;
  image_path: string;
  link_url: string;
  is_active: boolean;
  type?: 'hero' | 'sub';
}

export default function BannerManagement() {
  const { confirm } = useConfirm();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Tab yang aktif: 'hero' (Banner Utama Atas) atau 'sub' (Sub Banner Sebelum Footer)
  const [activeTab, setActiveTab] = useState<'hero' | 'sub'>('hero');

  // State Form Input
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleTabChange = (tab: 'hero' | 'sub') => {
    setActiveTab(tab);
    setTitle('');
    setLinkUrl('');
    setFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('banner-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleClearImage = () => {
    setFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('banner-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const currentTabBanners = banners.filter(b => (b.type || 'hero') === activeTab);
  const isLimitReached = currentTabBanners.length >= MAX_BANNERS;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      return alert(`Batas maksimal ${MAX_BANNERS} banner untuk kategori ini telah tercapai! Hapus banner lama terlebih dahulu.`);
    }
    if (!file) return alert('Pilih gambar banner terlebih dahulu!');

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('link_url', linkUrl);
    formData.append('type', activeTab);
    formData.append('image', file);

    try {
      await api.post('/admin/banners', formData);
      alert(`Banner (${activeTab === 'hero' ? 'Banner Utama' : 'Sub Banner 1280x420'}) berhasil diunggah!`);
      
      // Reset form
      setTitle('');
      setLinkUrl('');
      setFile(null);
      setImagePreview(null);
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
    const isConfirmed = await confirm({
      title: 'Hapus Banner',
      message: 'Apakah Anda yakin ingin menghapus banner ini secara permanen? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Hapus Banner',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (isConfirmed) {
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
      {/* HEADER PAGE */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Banner Beranda</h1>
        <p className="text-gray-500 text-sm">Kelola slide Banner Utama (Hero Slider Atas) dan Sub Banner (1280x420 Sebelum Footer).</p>
      </div>

      {/* TABS SEPARATOR BANNER UTAMA VS SUB BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 mb-8 pb-1">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange('hero')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-widest rounded-t-xl transition-all border-b-2 ${
              activeTab === 'hero'
                ? 'bg-black text-lime-400 border-lime-400 shadow-md'
                : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
            }`}
          >
            📌 1. Banner Utama (Hero Atas)
          </button>
          <button
            onClick={() => handleTabChange('sub')}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-widest rounded-t-xl transition-all border-b-2 ${
              activeTab === 'sub'
                ? 'bg-black text-lime-400 border-lime-400 shadow-md'
                : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
            }`}
          >
            🖼️ 2. Sub Banner (1280 x 420 px)
          </button>
        </div>

        {/* Counter Indikator Batas 10 Banner */}
        <div className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          isLimitReached 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : currentTabBanners.length >= 8 
            ? 'bg-amber-50 border-amber-200 text-amber-700' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <span>Kapasitas {activeTab === 'hero' ? 'Banner Utama' : 'Sub Banner'}:</span>
          <span className="text-sm font-black">{currentTabBanners.length} / {MAX_BANNERS}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Upload Banner */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit lg:col-span-1">
          <div className="mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-lg text-black">
              Upload {activeTab === 'hero' ? 'Banner Utama (Hero Atas)' : 'Sub Banner (1280 x 420)'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Rekomendasi ukuran: <strong className="text-black">{activeTab === 'hero' ? '1920 x 1080 px (16:9 Landscape)' : '1280 x 420 px (Landscape)'}</strong>
            </p>
          </div>

          {isLimitReached && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-lg font-medium">
              ⚠️ Batas maksimal <strong>10 Gambar</strong> untuk kategori ini telah tercapai. Hapus banner lama untuk mengunggah baru.
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul Banner (Opsional)</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                disabled={isLimitReached}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-black focus:border-black text-sm disabled:bg-gray-100" 
                placeholder={activeTab === 'hero' ? "Contoh: SHOW MORE BE MORE" : "Contoh: Urban Streetwear Campaign"} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link Tujuan saat Diklik (Opsional)</label>
              <input 
                type="text" 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)} 
                disabled={isLimitReached}
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-black focus:border-black text-sm disabled:bg-gray-100" 
                placeholder="/collection" 
              />
            </div>

            {/* --- PREVIEW GAMBAR DEPENDING ON TAB --- */}
            <div>
              <label className="block text-sm font-medium mb-1">File Gambar Banner</label>
              
              {imagePreview ? (
                <div className={`relative w-full ${activeTab === 'hero' ? 'aspect-video' : 'aspect-[1280/420]'} bg-black rounded-lg overflow-hidden border mb-2 shadow-sm`}>
                  <img src={imagePreview} alt="Preview Banner" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow hover:bg-red-700 transition-colors"
                  >
                    ✕ Hapus
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/70 text-lime-400 text-[10px] font-bold px-2 py-0.5 rounded">
                    Pratinjau {activeTab === 'hero' ? '16:9 Hero' : '1280 x 420'}
                  </span>
                </div>
              ) : (
                <div className={`w-full ${activeTab === 'hero' ? 'aspect-video' : 'aspect-[1280/420]'} bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 text-center mb-2`}>
                  <span className="text-3xl mb-1">🖼️</span>
                  <span className="text-xs font-bold text-gray-600">Pilih File Banner ({activeTab === 'hero' ? 'Hero Atas' : '1280 x 420 px'})</span>
                  <span className="text-[10px] text-gray-400">Maksimal 10MB (JPG, PNG, WEBP)</span>
                </div>
              )}

              <input 
                id="banner-upload"
                type="file" 
                accept="image/*"
                onChange={handleFileChange} 
                disabled={isLimitReached}
                required 
                className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-gray-50 disabled:bg-gray-100 cursor-pointer" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isUploading || isLimitReached}
              className="w-full bg-black text-lime-400 py-3 rounded-lg font-bold uppercase tracking-widest text-xs disabled:bg-gray-300 disabled:text-gray-500 hover:bg-gray-900 transition-colors shadow-md"
            >
              {isUploading ? 'Mengunggah...' : isLimitReached ? 'Kapasitas (10) Penuh' : `Upload ${activeTab === 'hero' ? 'Banner Utama' : 'Sub Banner'}`}
            </button>
          </form>
        </div>

        {/* Daftar Banner Terfilter per Kategori */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center p-10 text-gray-500 bg-white rounded-xl border border-gray-200">Memuat daftar banner...</div>
          ) : currentTabBanners.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
              Belum ada {activeTab === 'hero' ? 'Banner Utama Atas' : 'Sub Banner 1280x420'} yang diunggah.
            </div>
          ) : (
            <div className="space-y-6">
              {currentTabBanners.map((banner) => (
                <div key={banner.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                  {/* Preview Gambar Banner */}
                  <div className={`md:w-1/2 ${activeTab === 'hero' ? 'aspect-video' : 'aspect-[1280/420]'} md:h-auto bg-gray-900 relative`}>
                    <img 
                      src={banner.image_path.startsWith('http') ? banner.image_path : `${BACKEND_URL}${banner.image_path}`} 
                      alt={banner.title || 'Banner Image'} 
                      className="object-cover w-full h-full"
                    />
                    {!banner.is_active && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">TIDAK AKTIF</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Detail & Aksi */}
                  <div className="p-6 md:w-1/2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-lime-600 bg-lime-50 px-2 py-0.5 rounded border border-lime-200">
                          {banner.type === 'sub' ? 'Sub Banner (1280x420)' : 'Banner Utama (Hero Atas)'}
                        </span>
                        <span className={`text-xs font-bold ${banner.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          {banner.is_active ? '● Aktif' : '○ Non-Aktif'}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-1">{banner.title || 'Tanpa Judul'}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                        Link: {banner.link_url ? <a href={banner.link_url} className="text-blue-600 hover:underline">{banner.link_url}</a> : '-'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => handleToggleStatus(banner.id, banner.is_active)}
                        className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${banner.is_active ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
                      >
                        {banner.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button 
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
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