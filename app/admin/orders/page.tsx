'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

interface User {
  name: string;
  email: string;
}

interface Order {
  id: number;
  total_amount: string;
  status: string;
  shipping_address: string;
  created_at: string;
  user?: User;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data pesanan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Fungsi untuk mengubah status pesanan (Resi/Pengiriman)
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Refresh tabel agar status terbaru muncul
      alert('Status pesanan berhasil diperbarui!');
    } catch (error) {
      console.error('Gagal update status:', error);
      alert('Terjadi kesalahan saat memperbarui status.');
    }
  };

  // Fungsi helper untuk warna badge status
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dibayar': return 'bg-blue-100 text-blue-800';
      case 'dikirim': return 'bg-purple-100 text-purple-800';
      case 'selesai': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Order</h1>
        <p className="text-gray-500 text-sm">Pantau pesanan pelanggan, proses pembayaran, dan pengiriman barang.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Memuat data pesanan...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                  <th className="p-4 font-semibold text-gray-600">ID Pesanan</th>
                  <th className="p-4 font-semibold text-gray-600">Tanggal</th>
                  <th className="p-4 font-semibold text-gray-600">Customer</th>
                  <th className="p-4 font-semibold text-gray-600">Total Belanja</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Aksi (Ubah Status)</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Belum ada pesanan masuk.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">#ORD-{order.id}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">{order.user?.name || 'Customer'}</p>
                        <p className="text-xs text-gray-500">{order.user?.email || '-'}</p>
                      </td>
                      <td className="p-4 font-medium">
                        Rp {new Intl.NumberFormat('id-ID').format(Number(order.total_amount))}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select 
                          className="text-sm border border-gray-300 rounded-md p-1 outline-none mr-2 bg-white"
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="dibayar">Dibayar</option>
                          <option value="dikirim">Dikirim</option>
                          <option value="selesai">Selesai</option>
                        </select>
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
  );
}