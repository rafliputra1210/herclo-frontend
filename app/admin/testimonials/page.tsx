'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/axios';

interface Testimonial {
  id: number;
  customer_name: string;
  content: string;
  rating: number;
  is_featured: boolean;
}

export default function TestimonialManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    customer_name: '', 
    content: '',
    rating: 5,
    is_featured: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const response = await api.get('/admin/testimonials');
      setTestimonials(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil testimoni:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ customer_name: '', content: '', rating: 5, is_featured: true });
    setIsFormOpen(!isFormOpen);
  };

  const handleEditClick = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({ 
        customer_name: testimonial.customer_name, 
        content: testimonial.content,
        rating: testimonial.rating,
        is_featured: Boolean(testimonial.is_featured)
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await api.put(`/admin/testimonials/${editingId}`, formData);
        alert('Testimoni berhasil diperbarui!');
      } else {
        await api.post('/admin/testimonials', formData);
        alert('Testimoni berhasil ditambahkan!');
      }
      setIsFormOpen(false);
      fetchTestimonials();
    } catch (error: any) {
      console.error('Gagal simpan testimoni:', error);
      alert('Gagal menyimpan testimoni.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
      try {
        await api.delete(`/admin/testimonials/${id}`);
        fetchTestimonials();
      } catch (error) {
        alert('Gagal menghapus testimoni.');
      }
    }
  };

  // Helper render bintang
  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Testimoni</h1>
          <p className="text-gray-500 text-sm">Tambahkan ulasan pelanggan untuk ditampilkan di Landing Page.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
        >
          {isFormOpen && !editingId ? 'Batal Tambah' : '+ Tambah Testimoni'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-lg">{editingId ? 'Edit Testimoni' : 'Testimoni Baru'}</h3>
             <button onClick={() => setIsFormOpen(false)} className="text-red-500 text-sm hover:underline">Tutup Form</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nama Customer</label>
                    <input 
                        type="text" 
                        name="customer_name" 
                        value={formData.customer_name} 
                        onChange={handleInputChange} 
                        required 
                        className="w-full border p-2 rounded" 
                        placeholder="Contoh: Budi Santoso"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                    <select 
                        name="rating" 
                        value={formData.rating} 
                        onChange={handleInputChange} 
                        className="w-full border p-2 rounded bg-white"
                    >
                        <option value={5}>5 Bintang</option>
                        <option value={4}>4 Bintang</option>
                        <option value={3}>3 Bintang</option>
                        <option value={2}>2 Bintang</option>
                        <option value={1}>1 Bintang</option>
                    </select>
                </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Isi Ulasan</label>
              <textarea 
                name="content" 
                value={formData.content} 
                onChange={handleInputChange} 
                required 
                rows={3}
                className="w-full border p-2 rounded resize-y"
                placeholder="Tulis ulasan customer di sini..."
              ></textarea>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                name="is_featured" 
                id="is_featured"
                checked={formData.is_featured} 
                onChange={handleInputChange} 
                className="mr-2"
              />
              <label htmlFor="is_featured" className="text-sm">Tampilkan di Landing Page</label>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white py-2 rounded font-medium mt-2 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Testimoni')}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Memuat data testimoni...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-semibold text-gray-600">Nama Customer</th>
                <th className="p-4 font-semibold text-gray-600">Isi Ulasan</th>
                <th className="p-4 font-semibold text-gray-600">Rating</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Belum ada testimoni yang ditambahkan.</td>
                </tr>
              ) : (
                testimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">
                        {testimonial.customer_name}
                        {testimonial.is_featured && <span className="ml-2 inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Tampil</span>}
                    </td>
                    <td className="p-4 text-gray-600 text-sm max-w-xs truncate">
                        "{testimonial.content}"
                    </td>
                    <td className="p-4 text-yellow-500 text-lg">
                        {renderStars(testimonial.rating)}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEditClick(testimonial)}
                        className="text-blue-600 hover:underline mr-3 text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(testimonial.id)}
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