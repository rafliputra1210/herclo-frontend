'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/axios';

interface Customer {
  id: number;
  name: string;
  email: string;
  created_at: string;
  orders_count: number;
  orders_sum_total_amount: number | null;
}

export default function CustomerDataPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/admin/customers');
      setCustomers(response.data.data);
    } catch (error) {
      console.error('Gagal mengambil data customer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fitur pencarian sederhana berdasarkan nama atau email
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Data Customer</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar pelanggan terdaftar di platform HERCLO berdasarkan pesanan.</p>
        </div>
        
        {/* Kolom Pencarian */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-medium">Memuat data pelanggan...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                  <th className="p-4 font-bold text-gray-700">Info Pelanggan</th>
                  <th className="p-4 font-bold text-gray-700">Tanggal Bergabung</th>
                  <th className="p-4 font-bold text-gray-700 text-center">Total Pesanan</th>
                  <th className="p-4 font-bold text-gray-700 text-right">Total Belanja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Belum ada data pelanggan yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(customer.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] bg-gray-100 px-2 py-1 rounded-md text-xs font-bold text-gray-700 border border-gray-200">
                          {customer.orders_count}x
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-900">
                        Rp {new Intl.NumberFormat('id-ID').format(customer.orders_sum_total_amount || 0)}
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