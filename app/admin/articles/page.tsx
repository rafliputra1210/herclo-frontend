'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
  created_at: string;
}

export default function ArticleManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
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
    setIsFormOpen(!isFormOpen);
  };

  const handleEditClick = (article: Article) => {
    setEditingId(article.id);
    setFormData({ title: article.title, content: article.content });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await api.put(`/admin/articles/${editingId}`, formData);
        alert('Artikel berhasil diperbarui!');
      } else {
        await api.post('/admin/articles', formData);
        alert('Artikel berhasil diterbitkan!');
      }
      setIsFormOpen(false);
      fetchArticles();
    } catch (error: any) {
      console.error('Gagal simpan artikel:', error);
      alert('Gagal menyimpan artikel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
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
              className="w-full bg-black text-white py-2 rounded font-medium mt-2 disabled:bg-gray-400"
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
                <th className="p-4 font-semibold text-gray-600 w-16">ID</th>
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
                    <td className="p-4 text-gray-500">{article.id}</td>
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
                        className="text-blue-600 hover:underline mr-3 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:underline text-sm"
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