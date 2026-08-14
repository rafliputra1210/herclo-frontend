'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [code, setCode] = useState('');
  const [type, setType] = useState('nominal');
  const [value, setValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('');

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await api.get('/admin/promos');
      setPromos(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/promos', {
        code: code.toUpperCase(),
        type,
        value: Number(value),
        min_purchase: Number(minPurchase)
      });
      alert('Promo berhasil dibuat!');
      setCode(''); setValue(''); setMinPurchase('');
      fetchPromos();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membuat promo');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus promo ini?')) {
      await api.delete(`/admin/promos/${id}`);
      fetchPromos();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Manajemen Kode Promo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Buat Promo */}
        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
          <h3 className="font-bold mb-4">Buat Promo Baru</h3>
          <form onSubmit={handleCreatePromo} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Kode Promo</label>
              <input type="text" required value={code} onChange={e => setCode(e.target.value)} placeholder="Contoh: MERDEKA" className="w-full border p-2 rounded outline-none uppercase" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tipe Diskon</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border p-2 rounded outline-none">
                <option value="nominal">Nominal (Rupiah)</option>
                <option value="persen">Persentase (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Nilai Diskon</label>
              <input type="number" required value={value} onChange={e => setValue(e.target.value)} placeholder={type === 'persen' ? "Contoh: 10 (Untuk 10%)" : "Contoh: 50000"} className="w-full border p-2 rounded outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Minimal Belanja (Rp)</label>
              <input type="number" required value={minPurchase} onChange={e => setMinPurchase(e.target.value)} placeholder="Contoh: 100000" className="w-full border p-2 rounded outline-none" />
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold py-2 rounded hover:bg-gray-800">Simpan Promo</button>
          </form>
        </div>

        {/* Tabel Promo Aktif */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4">Daftar Kode Promo Aktif</h3>
          {loading ? <p>Memuat...</p> : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-sm">
                  <th className="p-3">Kode</th>
                  <th className="p-3">Tipe & Nilai</th>
                  <th className="p-3">Min. Belanja</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {promos.map(promo => (
                  <tr key={promo.id}>
                    <td className="p-3 font-bold text-emerald-600">{promo.code}</td>
                    <td className="p-3 text-sm">
                      {promo.type === 'persen' ? `${promo.value}%` : `Rp ${new Intl.NumberFormat('id-ID').format(promo.value)}`}
                    </td>
                    <td className="p-3 text-sm">Rp {new Intl.NumberFormat('id-ID').format(promo.min_purchase)}</td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(promo.id)} className="text-red-500 hover:underline text-xs font-bold">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}