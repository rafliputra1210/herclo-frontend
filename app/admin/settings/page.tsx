'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

export default function SettingsManagement() {
  const [useVideoOpening, setUseVideoOpening] = useState('false');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ambil data pengaturan saat ini
  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        if (res.data.data.use_video_opening) {
          setUseVideoOpening(res.data.data.use_video_opening);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/settings', { use_video_opening: useVideoOpening });
      alert('Pengaturan tampilan berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-gray-500">Memuat pengaturan...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Tampilan</h1>
        <p className="text-gray-500 text-sm">Atur bagaimana halaman utama website Anda ditampilkan kepada pelanggan.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
        <form onSubmit={handleSave}>
          <div className="mb-6 border-b pb-6">
            <h3 className="font-bold text-lg mb-4">Hero Section (Bagian Paling Atas Beranda)</h3>
            
            <label className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 mb-3 transition-colors">
              <input 
                type="radio" 
                name="heroMode" 
                value="true" 
                checked={useVideoOpening === 'true'} 
                onChange={() => setUseVideoOpening('true')}
                className="mt-1 w-4 h-4 text-black focus:ring-black" 
              />
              <div>
                <p className="font-bold text-gray-900">Gunakan Video Opening</p>
                <p className="text-sm text-gray-500">Menampilkan video sinematik layar penuh (cocok untuk branding dan peluncuran produk baru).</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input 
                type="radio" 
                name="heroMode" 
                value="false" 
                checked={useVideoOpening === 'false'} 
                onChange={() => setUseVideoOpening('false')}
                className="mt-1 w-4 h-4 text-black focus:ring-black" 
              />
              <div>
                <p className="font-bold text-gray-900">Gunakan Banner Promosi (Slider)</p>
                <p className="text-sm text-gray-500">Menampilkan kumpulan gambar promo yang bisa digeser (cocok untuk event diskon atau flash sale).</p>
              </div>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </div>
    </div>
  );
}