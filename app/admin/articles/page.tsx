'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';
import { useConfirm } from '../../components/ConfirmContext';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  image_path?: string; // Menambahkan kolom image
  is_published: boolean;
  created_at: string;
}

export default function ArticleManagement() {
  const { confirm } = useConfirm();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  
  // State khusus untuk menampung file gambar
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchArticles = async () => {
    try {
      const response = await api.get('/admin/articles');
      setArticles(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil artikel:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ title: '', content: '' });
    setImageFile(null); // Reset gambar
    setIsFormOpen(!isFormOpen);
  };

  const handleEditClick = (article: Article) => {
    setEditingId(article.id);
    setFormData({ title: article.title, content: article.content });
    setImageFile(null); // Kosongkan state file (tidak me-load file lama)
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Gunakan FormData karena kita mengirim file (bukan JSON biasa)
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('content', formData.content);
    
    // Masukkan gambar jika admin memilih file
    if (imageFile) {
      submitData.append('image', imageFile);
    }
    
    try {
      if (editingId) {
        // Trik Laravel: Update file harus pakai POST dan ditambahkan _method = PUT
        submitData.append('_method', 'PUT');
        await api.post(`/admin/articles/${editingId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Artikel berhasil diperbarui!');
      } else {
        await api.post('/admin/articles', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Artikel berhasil diterbitkan!');
      }
      setIsFormOpen(false);
      fetchArticles();
    } catch (error: any) {
      console.error('Gagal simpan artikel:', error);
      alert('Gagal menyimpan artikel. Pastikan ukuran gambar tidak terlalu besar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Hapus Artikel',
      message: 'Apakah Anda yakin ingin menghapus artikel ini? Artikel yang sudah dihapus tidak dapat dipulihkan.',
      confirmText: 'Hapus Artikel',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (isConfirmed) {
      try {
        await api.delete(`/admin/articles/${id}`);
        fetchArticles();
      } catch (error) {
        alert('Gagal menghapus artikel.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Artikel</h1>
          <p className="text-gray-500 text-sm">Tulis blog fashion, tips styling, atau berita HERCLO.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
        >
          {isFormOpen && !editingId ? 'Batal Tulis' : '+ Tulis Artikel'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-lg">{editingId ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h3>
             <button onClick={() => setIsFormOpen(false)} className="text-red-500 text-sm hover:underline">Tutup Form</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul Artikel</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                required 
                className="w-full border p-2 rounded" 
                placeholder="Contoh: 5 Tips Mix & Match Oversized Tee"
              />
            </div>
            
            {/* TAMBAHAN INPUT UNTUK FOTO/GAMBAR */}
            <div>
              <label className="block text-sm font-medium mb-1">Gambar Utama (Thumbnail)</label>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full border p-2 rounded bg-white text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: JPG, PNG, WEBP. Maksimal 3MB. {editingId && '(Kosongkan jika tidak ingin mengubah gambar)'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Konten Artikel</label>
              <textarea 
                name="content" 
                value={formData.content} 
                onChange={handleInputChange} 
                required 
                rows={8}
                className="w-full border p-2 rounded resize-y"
                placeholder="Tulis isi artikel di sini..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 rounded-lg font-medium mt-2 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Terbitkan Artikel')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Memuat data artikel...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-semibold text-gray-600 w-16">Foto</th>
                <th className="p-4 font-semibold text-gray-600">Judul Artikel</th>
                <th className="p-4 font-semibold text-gray-600">Tanggal Dibuat</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Belum ada artikel yang diterbitkan.</td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-gray-500">
                      {article.image_path ? (
                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden">
                          <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${article.image_path}`} alt="Thumb" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                          No Pic
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {article.title}
                      <span className="block text-xs text-gray-400 mt-1">/blog/{article.slug}</span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(article.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEditClick(article)}
                        className="text-blue-600 hover:underline mr-3 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >
                        Hapus
                      </button>
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