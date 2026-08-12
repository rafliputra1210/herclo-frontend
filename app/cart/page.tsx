'use client';

import { useEffect, useState } from 'react';
import api from '../../lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  quantity: number;
  size?: string;
  color?: string;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCart = () => {
    const localCart = JSON.parse(localStorage.getItem('herclo_cart') || '[]');
    setCartItems(localCart);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('herclo_cart', JSON.stringify(updatedCart));
  };

  // Menghitung total harga
  const totalAmount = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat keranjang...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-10 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 mb-4">Keranjang Anda masih kosong.</p>
            <Link href="/" className="inline-block bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{item.product.name}</h3>
                    <p className="text-gray-500 text-sm">Varian: {item.size || '-'} - {item.color || '-'}</p>
                    <p className="text-gray-500 text-sm">Jumlah: {item.quantity}</p>
                    <p className="font-bold mt-1">Rp {new Intl.NumberFormat('id-ID').format(item.product.price)}</p>
                  </div>
                  <button 
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 text-sm font-medium hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit sticky top-24">
              <h3 className="font-bold text-xl mb-4">Ringkasan Belanja</h3>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Total Item</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                <span>Total Harga</span>
                <span>Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}</span>
              </div>
              <Link href="/checkout">
                <button className="w-full bg-black text-white py-3 rounded-lg font-bold mt-6 hover:bg-gray-800">
                  Lanjut ke Pembayaran
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}