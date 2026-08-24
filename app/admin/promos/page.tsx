'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';
import { useConfirm } from '../../components/ConfirmContext';

interface Promo {
  id: number;
  code: string;
  type: string;
  value: number;
  min_purchase: number;
  is_active: boolean;
}

export default function AdminPromoPage() {
  const { confirm } = useConfirm();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form Tambah Promo
  const [code, setCode] = useState('');
  const [type, setType] = useState('nominal');
  const [value, setValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await api.get('/admin/promos');
      setPromos(res.data.data);
    } catch (error) {
      console.error('Gagal mengambil data promo', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/promos', {
        code: code.toUpperCase(), // Paksa kode promo jadi huruf besar semua
        type,
        value: Number(value),
        min_purchase: Number(minPurchase)
      });
      alert('Promo berhasil dibuat!');
      setCode(''); setValue(''); setMinPurchase('');
      fetchPromos();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membuat promo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Kode Promo',
      message: `Apakah Anda yakin ingin menghapus kode promo "${code}"? Pelanggan tidak akan dapat menggunakan kode promo ini lagi.`,
      confirmText: 'Hapus Promo',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (isConfirmed) {
      try {
        await api.delete(`/admin/promos/${id}`);
        fetchPromos();
      } catch (error) {
        alert('Gagal menghapus promo');
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Manajemen Promo</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola kode diskon dan potongan harga untuk pelanggan Anda.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Buat Promo (Kolom Kiri) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold mb-5 flex items-center gap-2">
            <span className="text-emerald-500">🏷️</span> Buat Promo Baru
          </h3>
          <form onSubmit={handleCreatePromo} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Kode Promo</label>
              <input 
                type="text" required value={code} onChange={e => setCode(e.target.value)} 
                placeholder="Contoh: MERDEKA" 
                className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-black uppercase text-sm font-bold" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tipe Diskon</label>
              <select 
                value={type} onChange={e => setType(e.target.value)} 
                className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-black text-sm"
              >
                <option value="nominal">Nominal (Potongan Rupiah)</option>
                <option value="persen">Persentase (Potongan %)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Nilai Diskon</label>
              <input 
                type="number" required value={value} onChange={e => setValue(e.target.value)} 
                placeholder={type === 'persen' ? "Contoh: 10 (Untuk 10%)" : "Contoh: 50000"} 
                className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-black text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Minimal Belanja (Rp)</label>
              <input 
                type="number" required value={minPurchase} onChange={e => setMinPurchase(e.target.value)} 
                placeholder="Contoh: 100000" 
                className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-black text-sm" 
              />
            </div>
            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 mt-2 transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Promo'}
            </button>
          </form>
        </div>

        {/* Tabel Promo Aktif (Kolom Kanan) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold">Daftar Kode Promo Aktif</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Memuat data promo...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-sm text-gray-600 border-b border-gray-100">
                    <th className="p-4 font-bold">Kode Promo</th>
                    <th className="p-4 font-bold">Nilai Diskon</th>
                    <th className="p-4 font-bold">Min. Belanja</th>
                    <th className="p-4 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {promos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">Belum ada promo yang dibuat.</td>
                    </tr>
                  ) : (
                    promos.map(promo => (
                      <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md font-black tracking-wider text-sm border border-emerald-200">
                            {promo.code}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-semibold text-gray-900">
                          {promo.type === 'persen' 
                            ? `${promo.value}%` 
                            : `Rp ${new Intl.NumberFormat('id-ID').format(promo.value)}`
                          }
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          Rp {new Intl.NumberFormat('id-ID').format(promo.min_purchase)}
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDelete(promo.id, promo.code)} 
                            className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-1 rounded-lg transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}