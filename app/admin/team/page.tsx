'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';
import { useConfirm } from '../../components/ConfirmContext';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image_path?: string;
}

export default function AdminTeamPage() {
  const { confirm } = useConfirm();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/team');
      setMembers(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data tim', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddClick = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setImageFile(null);
    setIsFormOpen(!isFormOpen);
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingId(member.id);
    setName(member.name);
    setRole(member.role);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append('name', name);
    submitData.append('role', role);
    if (imageFile) submitData.append('image', imageFile);
    
    try {
      if (editingId) {
        submitData.append('_method', 'PUT'); // Spoofing method untuk Laravel
        await api.post(`/admin/team/${editingId}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Data berhasil diperbarui!');
      } else {
        await api.post('/admin/team', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Anggota tim berhasil ditambahkan!');
      }
      setIsFormOpen(false);
      fetchMembers();
    } catch (error: any) {
      alert('Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Hapus Anggota Tim',
      message: 'Yakin ingin menghapus anggota tim ini dari daftar?',
      confirmText: 'Hapus Anggota',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (isConfirmed) {
      try {
        await api.delete(`/admin/team/${id}`);
        fetchMembers();
      } catch (error) {
        alert('Gagal menghapus data.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Tim</h1>
          <p className="text-gray-500 text-sm">Manajemen profil anggota tim di balik layar.</p>
        </div>
        <button 
          onClick={handleAddClick}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          {isFormOpen && !editingId ? 'Batal Tambah' : '+ Tambah Anggota'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
          <h3 className="font-semibold text-lg mb-4">{editingId ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Rafli Putra" className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jabatan / Role</label>
                <input type="text" required value={role} onChange={e => setRole(e.target.value)} placeholder="Contoh: Founder & Creative Director" className="w-full border p-2 rounded" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Foto Profil</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded bg-white text-sm" />
              <p className="text-xs text-gray-500 mt-1">Maksimal 2MB. Format: JPG, PNG. {editingId && '(Kosongkan jika tidak ingin mengubah foto)'}</p>
            </div>

            <button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-white px-6 py-2 rounded font-medium mt-2 disabled:bg-gray-400 hover:bg-emerald-700">
              {isSubmitting ? 'Menyimpan...' : 'Simpan ke Database'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Memuat data tim...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                <th className="p-4 font-semibold text-gray-600 w-16">Foto</th>
                <th className="p-4 font-semibold text-gray-600">Identitas</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={3} className="p-8 text-center text-gray-500">Belum ada data anggota tim.</td></tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      {member.image_path ? (
                        <img src={`http://127.0.0.1:8000${member.image_path}`} alt="Profil" className="w-12 h-12 rounded-full object-cover border" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">No Pic</div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{member.name}</p>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">{member.role}</p>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEditClick(member)} className="text-blue-600 hover:underline mr-4 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:underline text-sm font-medium">Hapus</button>
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