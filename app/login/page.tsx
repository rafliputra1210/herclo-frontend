'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/axios';
import BackButton from '../components/BackButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [dashboardCode, setDashboardCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Kita kirim dashboardCode sebagai 'password' ke backend
      const res = await api.post('/login', { 
        email, 
        password: dashboardCode 
      });
      
      // Simpan token ke localStorage agar sesi tetap aktif
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('herclo_token', res.data.token);
      localStorage.setItem('herclo_user', JSON.stringify(res.data.user));
      
      // Arahkan ke halaman yang sesuai berdasarkan role
      const user = res.data.user;
      if (user?.role === 'admin' || user?.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal masuk. Periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans relative">
      <div className="absolute top-6 left-6">
        <BackButton />
      </div>
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link href="/" className="flex items-center justify-center">
            <img src="/LOGO HERCLO5.png" alt="HERCLO" className="h-12 w-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Lacak Pesanan Anda</h1>
          <p className="text-gray-500 text-sm">Masukkan Email dan Kode Dashboard yang Anda buat saat checkout.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Email Anda</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full border border-gray-300 p-3.5 rounded-lg outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Kode Dashboard</label>
              <input 
                type="password" required value={dashboardCode} onChange={(e) => setDashboardCode(e.target.value)}
                placeholder="Masukkan kode rahasia Anda"
                className="w-full border border-gray-300 p-3.5 rounded-lg outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Memeriksa Data...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}