'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

export default function AdminCompanyProfile() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil data profil saat ini
  useEffect(() => {
    api.get('/company-profile')
      .then(res => {
        const data = res.data.data;
        setTitle(data.title || '');
        setDescription(data.description || '');
        setCurrentImage(data.image_path || '');
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await api.post('/admin/company-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profil berhasil diperbarui!');
      // Reload halaman untuk melihat gambar baru
      window.location.reload(); 
    } catch (error) {
      alert('Gagal memperbarui profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Memuat form...</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Profil Utama Perusahaan</h1>
        <p className="text-gray-500 text-sm mt-1">Ubah judul, deskripsi, dan gambar utama yang tampil di halaman Profil (About Us).</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        
        {/* Input Judul */}
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">Judul Utama (Headline)</label>
          <input 
            type="text" 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-black text-lg font-bold"
            placeholder="Contoh: Mendefinisikan Ulang Gaya."
          />
        </div>

        {/* Input Deskripsi */}
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">Deskripsi / Sub-judul</label>
          <textarea 
            required 
            rows={4}
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-black resize-y"
            placeholder="Tuliskan cerita singkat tentang HERCLO di sini..."
          ></textarea>
        </div>

        {/* Input Foto */}
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">Foto Profil (Hero Image)</label>
          {currentImage && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Gambar saat ini:</p>
              <img src={`http://127.0.0.1:8000${currentImage}`} alt="Current Hero" className="h-40 rounded-lg object-cover border" />
            </div>
          )}
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-2">Biarkan kosong jika tidak ingin mengganti gambar. Rekomendasi: Orientasi Portrait (4:5).</p>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting ? 'Menyimpan Perubahan...' : 'Simpan Profil Utama'}
        </button>

      </form>
    </div>
  );
}