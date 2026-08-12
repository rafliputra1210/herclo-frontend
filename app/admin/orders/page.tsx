'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

interface User {
  name: string;
  email: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  size: string;
  color: string;
  product: {
    name: string;
  };
}

interface Order {
  id: number;
  total_amount: string;
  status: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  user?: User;
  order_items?: OrderItem[];
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); 
      alert('Status pesanan berhasil diperbarui!');
    } catch (error) {
      console.error('Gagal update status:', error);
      alert('Terjadi kesalahan saat memperbarui status.');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dibayar': return 'bg-blue-100 text-blue-800';
      case 'dikirim': return 'bg-purple-100 text-purple-800';
      case 'selesai': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fungsi memisahkan Nama Penerima dan Alamat (dari format yang kita buat sebelumnya)
  const formatAddress = (fullAddress: string) => {
    if (fullAddress.includes(' | ')) {
      const parts = fullAddress.split(' | ');
      return { name: parts[0], address: parts[1] };
    }
    return { name: 'Customer', address: fullAddress };
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Order</h1>
        <p className="text-gray-500 text-sm">Pantau pesanan pelanggan, proses pembayaran, dan pengiriman barang.</p>
      </div>

      {/* --- MODAL DETAIL PESANAN --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Detail Pesanan #{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500">{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-black text-2xl font-bold">&times;</button>
            </div>
            
            {/* Body Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Informasi Pengiriman</p>
                  <p className="font-semibold text-gray-900">{formatAddress(selectedOrder.shipping_address).name}</p>
                  <p className="text-sm text-gray-600 mt-1">{formatAddress(selectedOrder.shipping_address).address}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pembayaran</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.payment_method || 'Transfer Bank'}</p>
                  <p className="text-sm mt-1">
                    Status: <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status.toUpperCase()}</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Daftar Barang Dibeli</p>
                <div className="space-y-4">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{item.product?.name || 'Produk Dihapus'}</p>
                        <p className="text-xs text-gray-500">
                          Varian: {item.size} - {item.color} | Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">Rp {new Intl.NumberFormat('id-ID').format(Number(item.price) * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
              <span className="font-bold text-gray-600">Total Pembayaran</span>
              <span className="text-xl font-black text-gray-900">Rp {new Intl.NumberFormat('id-ID').format(Number(selectedOrder.total_amount))}</span>
            </div>
          </div>
        </div>
      )}
      {/* --- END MODAL --- */}

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
                  <th className="p-4 font-semibold text-gray-600 text-right">Aksi</th>
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
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">#ORD-{order.id}</td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900 text-sm">{order.user?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{order.user?.email || '-'}</p>
                      </td>
                      <td className="p-4 font-medium text-sm">
                        Rp {new Intl.NumberFormat('id-ID').format(Number(order.total_amount))}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end items-center gap-3">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                        >
                          Lihat Detail
                        </button>
                        <select 
                          className="text-xs border border-gray-300 rounded-md p-1.5 outline-none bg-white font-medium cursor-pointer focus:ring-1 focus:ring-black"
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