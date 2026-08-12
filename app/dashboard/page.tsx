'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  size: string;
  color: string;
  product: { name: string; };
}

interface Order {
  id: number;
  total_amount: string;
  status: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  order_items?: OrderItem[];
}

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const response = await api.get('/my-orders');
        setOrders(response.data.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          router.push('/login');
        } else {
          console.error('Gagal mengambil riwayat pesanan', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [router]);

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Menunggu Pembayaran</span>;
      case 'dibayar': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Diproses</span>;
      case 'dikirim': return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Sedang Dikirim</span>;
      case 'selesai': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Selesai</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat data Anda...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <Link href="/" className="text-2xl font-black tracking-tight">HERCLO.</Link>
        <div className="flex gap-4">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black mt-1">Belanja Lagi</Link>
          <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700">Keluar</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Dashboard Saya</h1>
          <p className="text-gray-500">Pantau status pesanan dan riwayat belanja Anda di sini.</p>
        </div>

        {/* --- MODAL DETAIL PESANAN --- */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-slide-up relative">
              <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-5 text-gray-400 hover:text-black text-2xl font-bold">&times;</button>
              
              <div className="p-6 border-b text-center">
                <p className="text-xs text-gray-500 mb-1">Detail Pesanan</p>
                <h2 className="text-xl font-black">#ORD-{selectedOrder.id}</h2>
                <div className="mt-3">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Informasi Pengiriman</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border">{selectedOrder.shipping_address.replace(' | ', ' - ')}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Daftar Produk</p>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center border-b border-dashed pb-3">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.product?.name || 'Produk Dihapus'}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {item.size} | {item.color} (x{item.quantity})
                          </p>
                        </div>
                        <p className="font-bold text-sm">Rp {new Intl.NumberFormat('id-ID').format(Number(item.price) * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between text-sm mb-2 text-gray-600">
                    <span>Metode Pembayaran</span>
                    <span className="font-semibold">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-gray-900 border-t pt-2">
                    <span>Total Tagihan</span>
                    <span>Rp {new Intl.NumberFormat('id-ID').format(Number(selectedOrder.total_amount))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* --- END MODAL --- */}

        {orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🛍️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Belum ada pesanan</h3>
            <p className="text-gray-500 mb-6">Anda belum pernah melakukan transaksi di HERCLO.</p>
            <Link href="/" className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-center gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center min-w-[100px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="font-black text-gray-900">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="mb-1">{getStatusBadge(order.status)}</div>
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      Total: Rp {new Intl.NumberFormat('id-ID').format(Number(order.total_amount))}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 md:flex-col lg:flex-row items-center border-t md:border-t-0 pt-4 md:pt-0">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="w-full md:w-auto px-6 py-2 border-2 border-black text-black font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Lihat Detail
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}