'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import Link from 'next/link';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Mengecek apakah ada token
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
            // Jika tidak ada token, tendang kembali ke halaman login
            router.push('/login');
            return;
        }

        // Jika ada token, ambil data profil user dari Laravel
        api.get('/user')
            .then((response) => {
                const userData = response.data;
                setUser(userData);
                
                // Jika user adalah admin, alihkan otomatis ke Admin Panel
                if (userData?.role === 'admin' || userData?.role === 'super_admin') {
                    router.push('/admin');
                    return;
                }
                
                setLoading(false);
            })
            .catch((error) => {
                console.error("Sesi tidak valid:", error);
                localStorage.removeItem('auth_token');
                router.push('/login');
            });
    }, [router]);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            localStorage.removeItem('auth_token');
            router.push('/login');
        } catch (error) {
            console.error("Gagal logout:", error);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Memuat dasbor...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Sederhana */}
            <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">HERCLO.</h2>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded mt-2 inline-block uppercase font-semibold">
                        {user?.role} Panel
                    </span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="block p-3 bg-black text-white rounded-lg">Ringkasan</Link>
                    <Link href="/dashboard/orders" className="block p-3 hover:bg-gray-100 rounded-lg">Riwayat Pesanan</Link>
                    {/* Jika user adalah admin, tampilkan menu ekstra */}
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <Link href="/admin/products" className="block p-3 hover:bg-gray-100 rounded-lg text-blue-600 font-medium">
                            ⚙️ Kelola Produk
                        </Link>
                    )}
                </nav>
                <div className="p-4 border-t">
                    <button 
                        onClick={handleLogout}
                        className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                    >
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Konten Utama */}
            <main className="flex-1 p-10">
                <h1 className="text-3xl font-bold mb-2">Selamat datang, {user?.name}!</h1>
                <p className="text-gray-600 mb-8">Ini adalah pusat kendali akun Anda.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-gray-500 font-medium mb-1">Total Belanja</h3>
                        <p className="text-3xl font-bold">Rp 0</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-gray-500 font-medium mb-1">Pesanan Aktif</h3>
                        <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-gray-500 font-medium mb-1">Voucher Tersedia</h3>
                        <p className="text-3xl font-bold">0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}